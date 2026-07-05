-- In-app notifications. Same trusted-gateway pattern as audit_log: no direct
-- insert policy for authenticated, writes only go through create_notification().

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id, created_at desc);
create index notifications_org_id_idx on public.notifications (org_id);

alter table public.notifications enable row level security;

create policy "notifications_select_own" on public.notifications
  for select to authenticated
  using (user_id = auth.uid());

-- Recipients can only toggle read_at on their own notifications, nothing else.
create policy "notifications_update_own" on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create or replace function public.create_notification(
  p_org_id uuid,
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text,
  p_link text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (org_id, user_id, type, title, body, link)
  values (p_org_id, p_user_id, p_type, p_title, p_body, p_link);
end;
$$;

grant execute on function public.create_notification(uuid, uuid, text, text, text, text) to authenticated;

-- Required for the in-app notification bell to receive live inserts.
alter publication supabase_realtime add table public.notifications;
