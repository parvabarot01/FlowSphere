// Hand-maintained mirror of supabase/migrations/*.sql. Update alongside every schema migration.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type OrgRole = "owner" | "admin" | "member";
export type InviteRole = "admin" | "member";
export type InviteStatus = "pending" | "accepted" | "revoked";
export type SprintStatus = "planned" | "active" | "completed";
export type TaskStatus = "todo" | "in_progress" | "in_review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type ActionItemStatus = "pending" | "added" | "dismissed";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type AiReportType = "weekly_update" | "health_score" | "risk_analysis" | "dependency_graph";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      org_members: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role: OrgRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          role?: OrgRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          role?: OrgRole;
          created_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          description: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          description?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          description?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      sprints: {
        Row: {
          id: string;
          org_id: string;
          project_id: string;
          name: string;
          goal: string | null;
          start_date: string | null;
          end_date: string | null;
          status: SprintStatus;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          project_id: string;
          name: string;
          goal?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          status?: SprintStatus;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          project_id?: string;
          name?: string;
          goal?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          status?: SprintStatus;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          org_id: string;
          project_id: string;
          sprint_id: string | null;
          title: string;
          description: string | null;
          status: TaskStatus;
          priority: TaskPriority;
          assignee_id: string | null;
          created_by: string | null;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          project_id: string;
          sprint_id?: string | null;
          title: string;
          description?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          assignee_id?: string | null;
          created_by?: string | null;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          project_id?: string;
          sprint_id?: string | null;
          title?: string;
          description?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          assignee_id?: string | null;
          created_by?: string | null;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: string;
          org_id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      org_invites: {
        Row: {
          id: string;
          org_id: string;
          email: string;
          role: InviteRole;
          token: string;
          invited_by: string | null;
          status: InviteStatus;
          created_at: string;
          accepted_at: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          email: string;
          role?: InviteRole;
          token?: string;
          invited_by?: string | null;
          status?: InviteStatus;
          created_at?: string;
          accepted_at?: string | null;
        };
        Update: {
          id?: string;
          org_id?: string;
          email?: string;
          role?: InviteRole;
          token?: string;
          invited_by?: string | null;
          status?: InviteStatus;
          created_at?: string;
          accepted_at?: string | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          type: string;
          title: string;
          body: string | null;
          link: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          type: string;
          title: string;
          body?: string | null;
          link?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          body?: string | null;
          link?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      meeting_summaries: {
        Row: {
          id: string;
          org_id: string;
          project_id: string | null;
          title: string;
          raw_transcript: string;
          summary: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          project_id?: string | null;
          title: string;
          raw_transcript: string;
          summary: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          project_id?: string | null;
          title?: string;
          raw_transcript?: string;
          summary?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      action_items: {
        Row: {
          id: string;
          org_id: string;
          meeting_summary_id: string;
          description: string;
          task_id: string | null;
          status: ActionItemStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          meeting_summary_id: string;
          description: string;
          task_id?: string | null;
          status?: ActionItemStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          meeting_summary_id?: string;
          description?: string;
          task_id?: string | null;
          status?: ActionItemStatus;
          created_at?: string;
        };
        Relationships: [];
      };
      decision_log: {
        Row: {
          id: string;
          org_id: string;
          project_id: string | null;
          meeting_summary_id: string | null;
          title: string;
          decision: string;
          rationale: string | null;
          decided_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          project_id?: string | null;
          meeting_summary_id?: string | null;
          title: string;
          decision: string;
          rationale?: string | null;
          decided_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          project_id?: string | null;
          meeting_summary_id?: string | null;
          title?: string;
          decision?: string;
          rationale?: string | null;
          decided_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      knowledge_base_pages: {
        Row: {
          id: string;
          org_id: string;
          slug: string;
          title: string;
          body: string;
          body_search: unknown;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          slug: string;
          title: string;
          body?: string;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          slug?: string;
          title?: string;
          body?: string;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      automation_rules: {
        Row: {
          id: string;
          org_id: string;
          project_id: string | null;
          name: string;
          is_active: boolean;
          trigger_type: string;
          trigger_config: Json;
          action_type: string;
          action_config: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          project_id?: string | null;
          name: string;
          is_active?: boolean;
          trigger_type: string;
          trigger_config?: Json;
          action_type: string;
          action_config?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          project_id?: string | null;
          name?: string;
          is_active?: boolean;
          trigger_type?: string;
          trigger_config?: Json;
          action_type?: string;
          action_config?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      approvals: {
        Row: {
          id: string;
          org_id: string;
          project_id: string | null;
          title: string;
          description: string | null;
          requested_by: string | null;
          status: ApprovalStatus;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          project_id?: string | null;
          title: string;
          description?: string | null;
          requested_by?: string | null;
          status?: ApprovalStatus;
          created_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          org_id?: string;
          project_id?: string | null;
          title?: string;
          description?: string | null;
          requested_by?: string | null;
          status?: ApprovalStatus;
          created_at?: string;
          resolved_at?: string | null;
        };
        Relationships: [];
      };
      approval_steps: {
        Row: {
          id: string;
          approval_id: string;
          org_id: string;
          step_order: number;
          approver_id: string;
          status: ApprovalStatus;
          comment: string | null;
          decided_at: string | null;
        };
        Insert: {
          id?: string;
          approval_id: string;
          org_id: string;
          step_order: number;
          approver_id: string;
          status?: ApprovalStatus;
          comment?: string | null;
          decided_at?: string | null;
        };
        Update: {
          id?: string;
          approval_id?: string;
          org_id?: string;
          step_order?: number;
          approver_id?: string;
          status?: ApprovalStatus;
          comment?: string | null;
          decided_at?: string | null;
        };
        Relationships: [];
      };
      ai_reports: {
        Row: {
          id: string;
          org_id: string;
          project_id: string | null;
          report_type: AiReportType;
          content: Json;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          project_id?: string | null;
          report_type: AiReportType;
          content?: Json;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          project_id?: string | null;
          report_type?: AiReportType;
          content?: Json;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      chat_threads: {
        Row: {
          id: string;
          org_id: string;
          project_id: string | null;
          title: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          project_id?: string | null;
          title: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          project_id?: string | null;
          title?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: string;
          thread_id: string;
          org_id: string;
          author_id: string | null;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          org_id: string;
          author_id?: string | null;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          thread_id?: string;
          org_id?: string;
          author_id?: string | null;
          body?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_organization_with_owner: {
        Args: { p_name: string; p_slug: string };
        Returns: Database["public"]["Tables"]["organizations"]["Row"];
      };
      create_notification: {
        Args: {
          p_org_id: string;
          p_user_id: string;
          p_type: string;
          p_title: string;
          p_body: string | null;
          p_link: string | null;
        };
        Returns: void;
      };
      log_audit_event: {
        Args: {
          p_org_id: string;
          p_action: string;
          p_entity_type: string;
          p_entity_id: string | null;
          p_metadata?: Json;
        };
        Returns: void;
      };
      is_org_member: {
        Args: { p_org_id: string };
        Returns: boolean;
      };
      get_org_role: {
        Args: { p_org_id: string };
        Returns: OrgRole | null;
      };
      get_invite_by_token: {
        Args: { p_token: string };
        Returns: {
          org_name: string;
          org_slug: string;
          email: string;
          role: InviteRole;
          status: InviteStatus;
        }[];
      };
      accept_org_invite: {
        Args: { p_token: string };
        Returns: Database["public"]["Tables"]["organizations"]["Row"];
      };
      create_approval_request: {
        Args: {
          p_org_id: string;
          p_project_id: string | null;
          p_title: string;
          p_description: string | null;
          p_approver_ids: string[];
        };
        Returns: Database["public"]["Tables"]["approvals"]["Row"];
      };
      decide_approval_step: {
        Args: { p_step_id: string; p_decision: string; p_comment?: string | null };
        Returns: Database["public"]["Tables"]["approvals"]["Row"];
      };
    };
    Enums: Record<string, never>;
  };
};
