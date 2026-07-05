-- Org invites: pending invitations by email, with role-gated management and
-- a token-based accept flow that works before the invitee has an account.

create table public.org_invites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  token uuid not null default gen_random_uuid() unique,
  invited_by uuid references public.profiles (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

-- Only one live invite per (org, email) at a time — re-inviting after an
-- accept or revoke is fine, so this is a partial index, not a plain unique.
create unique index org_invites_pending_unique_idx
  on public.org_invites (org_id, email)
  where (status = 'pending');

create index org_invites_org_id_idx on public.org_invites (org_id);
create index org_invites_token_idx on public.org_invites (token);

alter table public.org_invites enable row level security;

-- Owners/admins manage invites for their org; an invitee can see invites
-- addressed to their own signed-in email (to confirm what they're accepting).
create policy "org_invites_select_admin_or_invitee" on public.org_invites
  for select to authenticated
  using (
    public.get_org_role(org_id) in ('owner', 'admin')
    or email = (auth.jwt() ->> 'email')
  );

create policy "org_invites_insert_admin" on public.org_invites
  for insert to authenticated
  with check (public.get_org_role(org_id) in ('owner', 'admin'));

create policy "org_invites_update_admin" on public.org_invites
  for update to authenticated
  using (public.get_org_role(org_id) in ('owner', 'admin'))
  with check (public.get_org_role(org_id) in ('owner', 'admin'));

create policy "org_invites_delete_admin" on public.org_invites
  for delete to authenticated
  using (public.get_org_role(org_id) in ('owner', 'admin'));

-- ---------------------------------------------------------------------------
-- Token-based lookup and accept, callable before the invitee is an org
-- member (accept) or even has an account (lookup, hence "anon" grant).
-- ---------------------------------------------------------------------------

create or replace function public.get_invite_by_token(p_token uuid)
returns table (
  org_name text,
  org_slug text,
  email text,
  role text,
  status text
)
language sql
security definer
set search_path = public
stable
as $$
  select o.name, o.slug, i.email, i.role, i.status
  from public.org_invites i
  join public.organizations o on o.id = i.org_id
  where i.token = p_token;
$$;

grant execute on function public.get_invite_by_token(uuid) to anon, authenticated;

create or replace function public.accept_org_invite(p_token uuid)
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.org_invites;
  v_org public.organizations;
  v_caller_email text;
begin
  if auth.uid() is null then
    raise exception 'Must be authenticated to accept an invite';
  end if;

  select email into v_caller_email from auth.users where id = auth.uid();

  select * into v_invite from public.org_invites where token = p_token and status = 'pending';

  if v_invite.id is null then
    raise exception 'Invite not found or already used';
  end if;

  if lower(v_invite.email) <> lower(v_caller_email) then
    raise exception 'This invite was sent to a different email address';
  end if;

  insert into public.org_members (org_id, user_id, role)
  values (v_invite.org_id, auth.uid(), v_invite.role)
  on conflict (org_id, user_id) do nothing;

  update public.org_invites
  set status = 'accepted', accepted_at = now()
  where id = v_invite.id;

  perform public.log_audit_event(
    v_invite.org_id, 'member.joined', 'org_member', auth.uid(),
    jsonb_build_object('email', v_caller_email, 'role', v_invite.role)
  );

  select * into v_org from public.organizations where id = v_invite.org_id;
  return v_org;
end;
$$;

grant execute on function public.accept_org_invite(uuid) to authenticated;
