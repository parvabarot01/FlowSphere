-- Sprint 2 schema: AI agent artifacts (meeting summaries, action items,
-- decision log, knowledge base), workflow automation, approvals, AI
-- executive reports, and cross-team chat. Same multi-tenancy model as
-- Sprint 1 — every table carries org_id and is scoped through is_org_member.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.meeting_summaries (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  title text not null,
  raw_transcript text not null,
  summary text not null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.action_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  meeting_summary_id uuid not null references public.meeting_summaries (id) on delete cascade,
  description text not null,
  task_id uuid references public.tasks (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'added', 'dismissed')),
  created_at timestamptz not null default now()
);

create table public.decision_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  meeting_summary_id uuid references public.meeting_summaries (id) on delete set null,
  title text not null,
  decision text not null,
  rationale text,
  decided_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.knowledge_base_pages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  slug text not null,
  title text not null,
  body text not null default '',
  body_search tsvector generated always as (to_tsvector('english', title || ' ' || body)) stored,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, slug)
);

create table public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  name text not null,
  is_active boolean not null default true,
  trigger_type text not null,
  trigger_config jsonb not null default '{}'::jsonb,
  action_type text not null,
  action_config jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  title text not null,
  description text,
  requested_by uuid references public.profiles (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.approval_steps (
  id uuid primary key default gen_random_uuid(),
  approval_id uuid not null references public.approvals (id) on delete cascade,
  org_id uuid not null references public.organizations (id) on delete cascade,
  step_order int not null,
  approver_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  comment text,
  decided_at timestamptz,
  unique (approval_id, step_order)
);

create table public.ai_reports (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  report_type text not null check (report_type in ('weekly_update', 'health_score', 'risk_analysis', 'dependency_graph')),
  content jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  title text not null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads (id) on delete cascade,
  org_id uuid not null references public.organizations (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index meeting_summaries_org_id_idx on public.meeting_summaries (org_id);
create index meeting_summaries_project_id_idx on public.meeting_summaries (project_id);
create index action_items_org_id_idx on public.action_items (org_id);
create index action_items_meeting_summary_id_idx on public.action_items (meeting_summary_id);
create index action_items_task_id_idx on public.action_items (task_id);
create index decision_log_org_id_idx on public.decision_log (org_id);
create index decision_log_project_id_idx on public.decision_log (project_id);
create index knowledge_base_pages_org_id_idx on public.knowledge_base_pages (org_id);
create index knowledge_base_pages_body_search_idx on public.knowledge_base_pages using gin (body_search);
create index automation_rules_org_id_idx on public.automation_rules (org_id);
create index approvals_org_id_idx on public.approvals (org_id);
create index approval_steps_approval_id_idx on public.approval_steps (approval_id);
create index approval_steps_approver_id_idx on public.approval_steps (approver_id);
create index ai_reports_org_id_idx on public.ai_reports (org_id, created_at desc);
create index chat_threads_org_id_idx on public.chat_threads (org_id);
create index chat_messages_thread_id_idx on public.chat_messages (thread_id, created_at);

-- ---------------------------------------------------------------------------
-- Auto-maintained columns
-- ---------------------------------------------------------------------------

create trigger knowledge_base_pages_set_updated_at
  before update on public.knowledge_base_pages
  for each row execute function public.set_updated_at();

create trigger automation_rules_set_updated_at
  before update on public.automation_rules
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Trusted gateways for approvals — status transitions must be tamper-proof
-- (a requester can't approve their own request), so they don't go through a
-- plain authenticated update policy the way tasks/sprints do.
-- ---------------------------------------------------------------------------

create or replace function public.create_approval_request(
  p_org_id uuid,
  p_project_id uuid,
  p_title text,
  p_description text,
  p_approver_ids uuid[]
)
returns public.approvals
language plpgsql
security definer
set search_path = public
as $$
declare
  v_approval public.approvals;
  v_approver_id uuid;
  v_step_order int := 0;
begin
  if array_length(p_approver_ids, 1) is null or array_length(p_approver_ids, 1) < 1 then
    raise exception 'At least one approver is required';
  end if;

  insert into public.approvals (org_id, project_id, title, description, requested_by)
  values (p_org_id, p_project_id, p_title, p_description, auth.uid())
  returning * into v_approval;

  foreach v_approver_id in array p_approver_ids loop
    v_step_order := v_step_order + 1;
    insert into public.approval_steps (approval_id, org_id, step_order, approver_id)
    values (v_approval.id, p_org_id, v_step_order, v_approver_id);
  end loop;

  perform public.log_audit_event(
    p_org_id, 'approval.requested', 'approval', v_approval.id,
    jsonb_build_object('title', p_title, 'approver_count', array_length(p_approver_ids, 1))
  );

  return v_approval;
end;
$$;

create or replace function public.decide_approval_step(
  p_step_id uuid,
  p_decision text,
  p_comment text default null
)
returns public.approvals
language plpgsql
security definer
set search_path = public
as $$
declare
  v_step public.approval_steps;
  v_approval public.approvals;
  v_earliest_pending_step_order int;
  v_remaining_pending int;
begin
  if p_decision not in ('approved', 'rejected') then
    raise exception 'Invalid decision: %', p_decision;
  end if;

  select * into v_step from public.approval_steps where id = p_step_id;

  if v_step.id is null then
    raise exception 'Approval step not found';
  end if;

  if v_step.approver_id <> auth.uid() then
    raise exception 'Only the assigned approver can decide this step';
  end if;

  if v_step.status <> 'pending' then
    raise exception 'This step has already been decided';
  end if;

  select min(step_order) into v_earliest_pending_step_order
  from public.approval_steps
  where approval_id = v_step.approval_id and status = 'pending';

  if v_step.step_order <> v_earliest_pending_step_order then
    raise exception 'Earlier approval steps are still pending';
  end if;

  update public.approval_steps
  set status = p_decision, comment = p_comment, decided_at = now()
  where id = p_step_id;

  if p_decision = 'rejected' then
    update public.approvals
    set status = 'rejected', resolved_at = now()
    where id = v_step.approval_id
    returning * into v_approval;
  else
    select count(*) into v_remaining_pending
    from public.approval_steps
    where approval_id = v_step.approval_id and status = 'pending';

    if v_remaining_pending = 0 then
      update public.approvals
      set status = 'approved', resolved_at = now()
      where id = v_step.approval_id
      returning * into v_approval;
    else
      select * into v_approval from public.approvals where id = v_step.approval_id;
    end if;
  end if;

  perform public.log_audit_event(
    v_step.org_id, 'approval.step_decided', 'approval', v_step.approval_id,
    jsonb_build_object('step_id', p_step_id, 'decision', p_decision)
  );

  return v_approval;
end;
$$;

grant execute on function public.create_approval_request(uuid, uuid, text, text, uuid[]) to authenticated;
grant execute on function public.decide_approval_step(uuid, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.meeting_summaries enable row level security;
alter table public.action_items enable row level security;
alter table public.decision_log enable row level security;
alter table public.knowledge_base_pages enable row level security;
alter table public.automation_rules enable row level security;
alter table public.approvals enable row level security;
alter table public.approval_steps enable row level security;
alter table public.ai_reports enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;

-- meeting_summaries / action_items / decision_log: any org member can
-- read/create/update/delete, same as tasks and sprints.
create policy "meeting_summaries_select_member" on public.meeting_summaries
  for select to authenticated using (public.is_org_member(org_id));
create policy "meeting_summaries_insert_member" on public.meeting_summaries
  for insert to authenticated with check (public.is_org_member(org_id));
create policy "meeting_summaries_update_member" on public.meeting_summaries
  for update to authenticated using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));
create policy "meeting_summaries_delete_member" on public.meeting_summaries
  for delete to authenticated using (public.is_org_member(org_id));

create policy "action_items_select_member" on public.action_items
  for select to authenticated using (public.is_org_member(org_id));
create policy "action_items_insert_member" on public.action_items
  for insert to authenticated with check (public.is_org_member(org_id));
create policy "action_items_update_member" on public.action_items
  for update to authenticated using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));
create policy "action_items_delete_member" on public.action_items
  for delete to authenticated using (public.is_org_member(org_id));

create policy "decision_log_select_member" on public.decision_log
  for select to authenticated using (public.is_org_member(org_id));
create policy "decision_log_insert_member" on public.decision_log
  for insert to authenticated with check (public.is_org_member(org_id));
create policy "decision_log_update_member" on public.decision_log
  for update to authenticated using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));
create policy "decision_log_delete_member" on public.decision_log
  for delete to authenticated using (public.is_org_member(org_id));

-- knowledge_base_pages: any org member can read/create/update/delete.
create policy "knowledge_base_pages_select_member" on public.knowledge_base_pages
  for select to authenticated using (public.is_org_member(org_id));
create policy "knowledge_base_pages_insert_member" on public.knowledge_base_pages
  for insert to authenticated with check (public.is_org_member(org_id));
create policy "knowledge_base_pages_update_member" on public.knowledge_base_pages
  for update to authenticated using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));
create policy "knowledge_base_pages_delete_member" on public.knowledge_base_pages
  for delete to authenticated using (public.is_org_member(org_id));

-- automation_rules: any member can read/create/update; only owners/admins
-- delete, since a bad rule can fire broadly (e.g. spam-notify a whole org) —
-- same higher bar as projects_delete_admin.
create policy "automation_rules_select_member" on public.automation_rules
  for select to authenticated using (public.is_org_member(org_id));
create policy "automation_rules_insert_member" on public.automation_rules
  for insert to authenticated with check (public.is_org_member(org_id));
create policy "automation_rules_update_member" on public.automation_rules
  for update to authenticated using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));
create policy "automation_rules_delete_admin" on public.automation_rules
  for delete to authenticated using (public.get_org_role(org_id) in ('owner', 'admin'));

-- approvals / approval_steps: members can read. There is deliberately no
-- insert/update policy for the authenticated role beyond what's listed below
-- — creation and status transitions go through create_approval_request() and
-- decide_approval_step() so a requester can never approve their own request.
create policy "approvals_select_member" on public.approvals
  for select to authenticated using (public.is_org_member(org_id));

create policy "approval_steps_select_member" on public.approval_steps
  for select to authenticated using (public.is_org_member(org_id));

-- ai_reports: members can read. No insert/update/delete policy for
-- authenticated — these are written by the background report-generation job
-- using the service-role client, which bypasses RLS entirely.
create policy "ai_reports_select_member" on public.ai_reports
  for select to authenticated using (public.is_org_member(org_id));

-- chat_threads / chat_messages: any member can read/create; messages are
-- immutable once posted (no update/delete policy).
create policy "chat_threads_select_member" on public.chat_threads
  for select to authenticated using (public.is_org_member(org_id));
create policy "chat_threads_insert_member" on public.chat_threads
  for insert to authenticated with check (public.is_org_member(org_id));

create policy "chat_messages_select_member" on public.chat_messages
  for select to authenticated using (public.is_org_member(org_id));
create policy "chat_messages_insert_member" on public.chat_messages
  for insert to authenticated with check (public.is_org_member(org_id) and author_id = auth.uid());

-- Required for the chat UI to receive live message inserts.
alter publication supabase_realtime add table public.chat_messages;
