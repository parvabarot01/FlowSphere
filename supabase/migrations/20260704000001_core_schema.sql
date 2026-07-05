-- Core schema: profiles, organizations, membership, projects, sprints, tasks,
-- and an append-only audit log. Multi-tenancy is enforced end-to-end via RLS
-- scoped to organization membership.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.sprints (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  goal text,
  start_date date,
  end_date date,
  status text not null default 'planned' check (status in ('planned', 'active', 'completed')),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  sprint_id uuid references public.sprints (id) on delete set null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'in_review', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  assignee_id uuid references public.profiles (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index org_members_org_id_idx on public.org_members (org_id);
create index org_members_user_id_idx on public.org_members (user_id);
create index projects_org_id_idx on public.projects (org_id);
create index sprints_org_id_idx on public.sprints (org_id);
create index sprints_project_id_idx on public.sprints (project_id);
create index tasks_org_id_idx on public.tasks (org_id);
create index tasks_project_id_idx on public.tasks (project_id);
create index tasks_sprint_id_idx on public.tasks (sprint_id);
create index tasks_assignee_id_idx on public.tasks (assignee_id);
create index audit_log_org_id_idx on public.audit_log (org_id);
create index audit_log_created_at_idx on public.audit_log (created_at desc);

-- ---------------------------------------------------------------------------
-- Auto-maintained columns & bootstrap triggers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- Every new auth user gets a profile row automatically.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS helper functions
-- security definer so they can read org_members/profiles without recursing
-- through those tables' own RLS policies.
-- ---------------------------------------------------------------------------

create or replace function public.is_org_member(p_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.org_members
    where org_id = p_org_id and user_id = auth.uid()
  );
$$;

create or replace function public.get_org_role(p_org_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.org_members
  where org_id = p_org_id and user_id = auth.uid()
  limit 1;
$$;

create or replace function public.shares_org_with(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.org_members m1
    join public.org_members m2 on m1.org_id = m2.org_id
    where m1.user_id = auth.uid() and m2.user_id = p_user_id
  );
$$;

-- Trusted audit-log gateway. security definer so the actor_id always comes
-- from the authenticated session, never from client-supplied input, and so
-- writes succeed even though audit_log has no direct insert policy below.
create or replace function public.log_audit_event(
  p_org_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_log (org_id, actor_id, action, entity_type, entity_id, metadata)
  values (p_org_id, auth.uid(), p_action, p_entity_type, p_entity_id, p_metadata);
end;
$$;

-- Creates an organization and its first membership (owner) atomically —
-- needed because org_members' own insert policy requires an existing
-- owner/admin role, which doesn't exist yet for a brand-new org.
create or replace function public.create_organization_with_owner(p_name text, p_slug text)
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org public.organizations;
begin
  insert into public.organizations (name, slug, created_by)
  values (p_name, p_slug, auth.uid())
  returning * into v_org;

  insert into public.org_members (org_id, user_id, role)
  values (v_org.id, auth.uid(), 'owner');

  perform public.log_audit_event(
    v_org.id, 'organization.created', 'organization', v_org.id,
    jsonb_build_object('name', p_name)
  );

  return v_org;
end;
$$;

grant execute on function public.log_audit_event(uuid, text, text, uuid, jsonb) to authenticated;
grant execute on function public.create_organization_with_owner(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.org_members enable row level security;
alter table public.projects enable row level security;
alter table public.sprints enable row level security;
alter table public.tasks enable row level security;
alter table public.audit_log enable row level security;

-- profiles: readable by yourself or anyone you share an org with; only you
-- can update your own row. No direct insert/delete — handled by the
-- on_auth_user_created trigger and the auth.users cascade.
create policy "profiles_select_self_or_org_peer" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.shares_org_with(id));

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- organizations: members can read; any authenticated user can create one
-- (via create_organization_with_owner, which also grants them ownership);
-- only owners can update or delete.
create policy "organizations_select_member" on public.organizations
  for select to authenticated
  using (public.is_org_member(id));

create policy "organizations_update_admin" on public.organizations
  for update to authenticated
  using (public.get_org_role(id) in ('owner', 'admin'))
  with check (public.get_org_role(id) in ('owner', 'admin'));

create policy "organizations_delete_owner" on public.organizations
  for delete to authenticated
  using (public.get_org_role(id) = 'owner');

-- org_members: members can see their org's roster; owners/admins manage
-- membership; anyone can remove themselves.
create policy "org_members_select_member" on public.org_members
  for select to authenticated
  using (public.is_org_member(org_id));

create policy "org_members_insert_admin" on public.org_members
  for insert to authenticated
  with check (public.get_org_role(org_id) in ('owner', 'admin'));

create policy "org_members_update_admin" on public.org_members
  for update to authenticated
  using (public.get_org_role(org_id) in ('owner', 'admin'))
  with check (public.get_org_role(org_id) in ('owner', 'admin'));

create policy "org_members_delete_admin_or_self" on public.org_members
  for delete to authenticated
  using (public.get_org_role(org_id) in ('owner', 'admin') or user_id = auth.uid());

-- projects: any org member can read/create/update; only owners/admins delete.
create policy "projects_select_member" on public.projects
  for select to authenticated
  using (public.is_org_member(org_id));

create policy "projects_insert_member" on public.projects
  for insert to authenticated
  with check (public.is_org_member(org_id));

create policy "projects_update_member" on public.projects
  for update to authenticated
  using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));

create policy "projects_delete_admin" on public.projects
  for delete to authenticated
  using (public.get_org_role(org_id) in ('owner', 'admin'));

-- sprints: any org member can read/create/update/delete.
create policy "sprints_select_member" on public.sprints
  for select to authenticated
  using (public.is_org_member(org_id));

create policy "sprints_insert_member" on public.sprints
  for insert to authenticated
  with check (public.is_org_member(org_id));

create policy "sprints_update_member" on public.sprints
  for update to authenticated
  using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));

create policy "sprints_delete_member" on public.sprints
  for delete to authenticated
  using (public.is_org_member(org_id));

-- tasks: any org member can read/create/update/delete.
create policy "tasks_select_member" on public.tasks
  for select to authenticated
  using (public.is_org_member(org_id));

create policy "tasks_insert_member" on public.tasks
  for insert to authenticated
  with check (public.is_org_member(org_id));

create policy "tasks_update_member" on public.tasks
  for update to authenticated
  using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));

create policy "tasks_delete_member" on public.tasks
  for delete to authenticated
  using (public.is_org_member(org_id));

-- audit_log: members can read their org's trail. There is deliberately no
-- insert/update/delete policy for the authenticated role — all writes go
-- through the security-definer log_audit_event() function so actor_id can
-- never be spoofed and entries can never be edited or removed.
create policy "audit_log_select_member" on public.audit_log
  for select to authenticated
  using (public.is_org_member(org_id));
