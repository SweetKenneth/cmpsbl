export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      access_scans: {
        Row: {
          created_at: string
          domain: string
          fixed_count: number | null
          id: string
          metadata: Json | null
          score: number | null
        }
        Insert: {
          created_at?: string
          domain: string
          fixed_count?: number | null
          id?: string
          metadata?: Json | null
          score?: number | null
        }
        Update: {
          created_at?: string
          domain?: string
          fixed_count?: number | null
          id?: string
          metadata?: Json | null
          score?: number | null
        }
        Relationships: []
      }
      accessibility_scans: {
        Row: {
          completed_at: string | null
          created_at: string | null
          domain: string
          id: string
          issues: Json | null
          metadata: Json | null
          scan_status: string
          score: number | null
          user_id: string | null
          wcag_level: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          domain: string
          id?: string
          issues?: Json | null
          metadata?: Json | null
          scan_status?: string
          score?: number | null
          user_id?: string | null
          wcag_level?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          domain?: string
          id?: string
          issues?: Json | null
          metadata?: Json | null
          scan_status?: string
          score?: number | null
          user_id?: string | null
          wcag_level?: string | null
        }
        Relationships: []
      }
      agencies: {
        Row: {
          business_profile: Json | null
          cohesion_rating: number | null
          created_at: string | null
          deployment_domain: string | null
          deployment_type: string | null
          description: string | null
          dream_pool_mode: string | null
          id: string
          leader_id: string | null
          metadata: Json | null
          name: string
          owner_id: string | null
          slug: string | null
          status: string | null
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          business_profile?: Json | null
          cohesion_rating?: number | null
          created_at?: string | null
          deployment_domain?: string | null
          deployment_type?: string | null
          description?: string | null
          dream_pool_mode?: string | null
          id?: string
          leader_id?: string | null
          metadata?: Json | null
          name: string
          owner_id?: string | null
          slug?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          business_profile?: Json | null
          cohesion_rating?: number | null
          created_at?: string | null
          deployment_domain?: string | null
          deployment_type?: string | null
          description?: string | null
          dream_pool_mode?: string | null
          id?: string
          leader_id?: string | null
          metadata?: Json | null
          name?: string
          owner_id?: string | null
          slug?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agencies_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "agency_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agencies_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "agency_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_agent_telemetry: {
        Row: {
          agency_id: string
          api_calls: number
          avg_latency_ms: number | null
          created_at: string
          datasets_processed: number
          enrichment_operations: number
          estimated_cost_cents: number
          id: string
          member_id: string | null
          monitoring_cycles: number
          period_date: string
          skill_usage: Json
          tasks_completed: number
          tasks_failed: number
          total_execution_time_ms: number
          updated_at: string
          websites_crawled: number
        }
        Insert: {
          agency_id: string
          api_calls?: number
          avg_latency_ms?: number | null
          created_at?: string
          datasets_processed?: number
          enrichment_operations?: number
          estimated_cost_cents?: number
          id?: string
          member_id?: string | null
          monitoring_cycles?: number
          period_date?: string
          skill_usage?: Json
          tasks_completed?: number
          tasks_failed?: number
          total_execution_time_ms?: number
          updated_at?: string
          websites_crawled?: number
        }
        Update: {
          agency_id?: string
          api_calls?: number
          avg_latency_ms?: number | null
          created_at?: string
          datasets_processed?: number
          enrichment_operations?: number
          estimated_cost_cents?: number
          id?: string
          member_id?: string | null
          monitoring_cycles?: number
          period_date?: string
          skill_usage?: Json
          tasks_completed?: number
          tasks_failed?: number
          total_execution_time_ms?: number
          updated_at?: string
          websites_crawled?: number
        }
        Relationships: [
          {
            foreignKeyName: "agency_agent_telemetry_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_agent_telemetry_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "agency_members"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_api_calls: {
        Row: {
          agency_id: string
          api_name: string
          created_at: string
          endpoint: string | null
          error_message: string | null
          estimated_cost_cents: number | null
          id: string
          member_id: string | null
          method: string | null
          request_metadata: Json | null
          response_metadata: Json | null
          response_time_ms: number | null
          status_code: number | null
          success: boolean
          task_id: string | null
          tokens_used: number | null
        }
        Insert: {
          agency_id: string
          api_name: string
          created_at?: string
          endpoint?: string | null
          error_message?: string | null
          estimated_cost_cents?: number | null
          id?: string
          member_id?: string | null
          method?: string | null
          request_metadata?: Json | null
          response_metadata?: Json | null
          response_time_ms?: number | null
          status_code?: number | null
          success?: boolean
          task_id?: string | null
          tokens_used?: number | null
        }
        Update: {
          agency_id?: string
          api_name?: string
          created_at?: string
          endpoint?: string | null
          error_message?: string | null
          estimated_cost_cents?: number | null
          id?: string
          member_id?: string | null
          method?: string | null
          request_metadata?: Json | null
          response_metadata?: Json | null
          response_time_ms?: number | null
          status_code?: number | null
          success?: boolean
          task_id?: string | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_api_calls_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_api_calls_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "agency_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_api_calls_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "agency_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_dream_consent: {
        Row: {
          agency_id: string
          allow_global_pooling: boolean | null
          allow_heuristic_sharing: boolean | null
          allow_template_sharing: boolean | null
          created_at: string | null
          exclude_domains: string[] | null
          id: string
          privacy_level: string | null
          updated_at: string | null
        }
        Insert: {
          agency_id: string
          allow_global_pooling?: boolean | null
          allow_heuristic_sharing?: boolean | null
          allow_template_sharing?: boolean | null
          created_at?: string | null
          exclude_domains?: string[] | null
          id?: string
          privacy_level?: string | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: string
          allow_global_pooling?: boolean | null
          allow_heuristic_sharing?: boolean | null
          allow_template_sharing?: boolean | null
          created_at?: string | null
          exclude_domains?: string[] | null
          id?: string
          privacy_level?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_dream_consent_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: true
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_dream_memory: {
        Row: {
          agency_id: string
          applied: boolean | null
          applied_at: string | null
          category: string | null
          confidence: number | null
          created_at: string | null
          evidence_refs: string[] | null
          id: string
          improvement_type: string
          layer: string
          member_id: string | null
          parent_id: string | null
          payload: Json
          title: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          agency_id: string
          applied?: boolean | null
          applied_at?: string | null
          category?: string | null
          confidence?: number | null
          created_at?: string | null
          evidence_refs?: string[] | null
          id?: string
          improvement_type: string
          layer: string
          member_id?: string | null
          parent_id?: string | null
          payload?: Json
          title: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          agency_id?: string
          applied?: boolean | null
          applied_at?: string | null
          category?: string | null
          confidence?: number | null
          created_at?: string | null
          evidence_refs?: string[] | null
          id?: string
          improvement_type?: string
          layer?: string
          member_id?: string | null
          parent_id?: string | null
          payload?: Json
          title?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_dream_memory_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_dream_memory_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "agency_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_dream_memory_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "agency_dream_memory"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_dream_pool: {
        Row: {
          agency_id: string
          contributor_id: string | null
          created_at: string | null
          dream_content: string
          dream_type: string | null
          id: string
          sentiment_score: number | null
          tags: string[] | null
          visibility: string | null
        }
        Insert: {
          agency_id: string
          contributor_id?: string | null
          created_at?: string | null
          dream_content: string
          dream_type?: string | null
          id?: string
          sentiment_score?: number | null
          tags?: string[] | null
          visibility?: string | null
        }
        Update: {
          agency_id?: string
          contributor_id?: string | null
          created_at?: string | null
          dream_content?: string
          dream_type?: string | null
          id?: string
          sentiment_score?: number | null
          tags?: string[] | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_dream_pool_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_email_queue: {
        Row: {
          agency_id: string
          body_html: string | null
          body_text: string | null
          created_at: string | null
          deliverable_id: string | null
          email_type: string
          error_message: string | null
          id: string
          metadata: Json | null
          recipient_email: string
          recipient_name: string | null
          retry_count: number | null
          sent_at: string | null
          status: string | null
          subject: string
          task_id: string | null
        }
        Insert: {
          agency_id: string
          body_html?: string | null
          body_text?: string | null
          created_at?: string | null
          deliverable_id?: string | null
          email_type: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email: string
          recipient_name?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string | null
          subject: string
          task_id?: string | null
        }
        Update: {
          agency_id?: string
          body_html?: string | null
          body_text?: string | null
          created_at?: string | null
          deliverable_id?: string | null
          email_type?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string
          recipient_name?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_email_queue_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_email_queue_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "agency_task_deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_email_queue_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "agency_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_members: {
        Row: {
          agency_id: string
          cognitive_id: string | null
          created_at: string | null
          id: string
          is_leader: boolean | null
          role: string
          skill_weights: Json | null
          sort_order: number | null
          specialization: string
        }
        Insert: {
          agency_id: string
          cognitive_id?: string | null
          created_at?: string | null
          id?: string
          is_leader?: boolean | null
          role: string
          skill_weights?: Json | null
          sort_order?: number | null
          specialization: string
        }
        Update: {
          agency_id?: string
          cognitive_id?: string | null
          created_at?: string | null
          id?: string
          is_leader?: boolean | null
          role?: string
          skill_weights?: Json | null
          sort_order?: number | null
          specialization?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_members_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_members_cognitive_id_fkey"
            columns: ["cognitive_id"]
            isOneToOne: false
            referencedRelation: "cognitive_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_purchases: {
        Row: {
          additional_cognitives: number | null
          additional_price_cents: number | null
          agency_id: string | null
          base_price_cents: number
          created_at: string | null
          id: string
          metadata: Json | null
          onboarding_completed: boolean | null
          onboarding_token: string | null
          purchase_email: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_session_id: string | null
          total_price_cents: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          additional_cognitives?: number | null
          additional_price_cents?: number | null
          agency_id?: string | null
          base_price_cents?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          onboarding_completed?: boolean | null
          onboarding_token?: string | null
          purchase_email?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          total_price_cents: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          additional_cognitives?: number | null
          additional_price_cents?: number | null
          agency_id?: string | null
          base_price_cents?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          onboarding_completed?: boolean | null
          onboarding_token?: string | null
          purchase_email?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          total_price_cents?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_purchases_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_scheduled_tasks: {
        Row: {
          agency_id: string
          created_at: string | null
          id: string
          input_data: Json | null
          is_active: boolean | null
          last_run_at: string | null
          last_task_id: string | null
          member_id: string | null
          metadata: Json | null
          next_run_at: string
          run_count: number | null
          schedule_day_of_month: number | null
          schedule_day_of_week: number | null
          schedule_time: string | null
          schedule_type: string
          task_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          agency_id: string
          created_at?: string | null
          id?: string
          input_data?: Json | null
          is_active?: boolean | null
          last_run_at?: string | null
          last_task_id?: string | null
          member_id?: string | null
          metadata?: Json | null
          next_run_at: string
          run_count?: number | null
          schedule_day_of_month?: number | null
          schedule_day_of_week?: number | null
          schedule_time?: string | null
          schedule_type: string
          task_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          agency_id?: string
          created_at?: string | null
          id?: string
          input_data?: Json | null
          is_active?: boolean | null
          last_run_at?: string | null
          last_task_id?: string | null
          member_id?: string | null
          metadata?: Json | null
          next_run_at?: string
          run_count?: number | null
          schedule_day_of_month?: number | null
          schedule_day_of_week?: number | null
          schedule_time?: string | null
          schedule_type?: string
          task_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_scheduled_tasks_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_scheduled_tasks_last_task_id_fkey"
            columns: ["last_task_id"]
            isOneToOne: false
            referencedRelation: "agency_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_scheduled_tasks_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "agency_members"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_settings: {
        Row: {
          agency_id: string
          auto_research_enabled: boolean | null
          created_at: string
          default_research_domains: Json | null
          id: string
          leader_name: string | null
          notification_preferences: Json | null
          preset_commands: Json | null
          shared_learning_enabled: boolean | null
          theme_settings: Json | null
          updated_at: string
        }
        Insert: {
          agency_id: string
          auto_research_enabled?: boolean | null
          created_at?: string
          default_research_domains?: Json | null
          id?: string
          leader_name?: string | null
          notification_preferences?: Json | null
          preset_commands?: Json | null
          shared_learning_enabled?: boolean | null
          theme_settings?: Json | null
          updated_at?: string
        }
        Update: {
          agency_id?: string
          auto_research_enabled?: boolean | null
          created_at?: string
          default_research_domains?: Json | null
          id?: string
          leader_name?: string | null
          notification_preferences?: Json | null
          preset_commands?: Json | null
          shared_learning_enabled?: boolean | null
          theme_settings?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_settings_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: true
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_task_artifacts: {
        Row: {
          agency_id: string
          artifact_type: string
          content_hash: string | null
          created_at: string
          download_count: number
          file_name: string
          file_path: string | null
          file_size_bytes: number | null
          id: string
          inline_content: string | null
          member_id: string | null
          metadata: Json | null
          task_id: string
        }
        Insert: {
          agency_id: string
          artifact_type: string
          content_hash?: string | null
          created_at?: string
          download_count?: number
          file_name: string
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          inline_content?: string | null
          member_id?: string | null
          metadata?: Json | null
          task_id: string
        }
        Update: {
          agency_id?: string
          artifact_type?: string
          content_hash?: string | null
          created_at?: string
          download_count?: number
          file_name?: string
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          inline_content?: string | null
          member_id?: string | null
          metadata?: Json | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_task_artifacts_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_task_artifacts_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "agency_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_task_artifacts_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "agency_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_task_deliverables: {
        Row: {
          agency_id: string
          content: string | null
          created_at: string | null
          deliverable_type: string
          download_count: number | null
          emailed_to: string[] | null
          expires_at: string | null
          file_path: string | null
          file_size_bytes: number | null
          id: string
          metadata: Json | null
          task_id: string
          title: string
        }
        Insert: {
          agency_id: string
          content?: string | null
          created_at?: string | null
          deliverable_type: string
          download_count?: number | null
          emailed_to?: string[] | null
          expires_at?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          metadata?: Json | null
          task_id: string
          title: string
        }
        Update: {
          agency_id?: string
          content?: string | null
          created_at?: string | null
          deliverable_type?: string
          download_count?: number | null
          emailed_to?: string[] | null
          expires_at?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          metadata?: Json | null
          task_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_task_deliverables_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_task_deliverables_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "agency_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_task_logs: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          log_type: string
          member_id: string | null
          message: string
          task_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          log_type?: string
          member_id?: string | null
          message: string
          task_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          log_type?: string
          member_id?: string | null
          message?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_task_logs_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "agency_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_task_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "agency_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_tasks: {
        Row: {
          agency_id: string
          assigned_member_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          error_message: string | null
          id: string
          input_data: Json | null
          metadata: Json | null
          output_data: Json | null
          priority: number | null
          progress: number | null
          research_domain: string | null
          started_at: string | null
          status: string
          task_type: string
          title: string
          updated_at: string
        }
        Insert: {
          agency_id: string
          assigned_member_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          metadata?: Json | null
          output_data?: Json | null
          priority?: number | null
          progress?: number | null
          research_domain?: string | null
          started_at?: string | null
          status?: string
          task_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          agency_id?: string
          assigned_member_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          metadata?: Json | null
          output_data?: Json | null
          priority?: number | null
          progress?: number | null
          research_domain?: string | null
          started_at?: string | null
          status?: string
          task_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_tasks_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_tasks_assigned_member_id_fkey"
            columns: ["assigned_member_id"]
            isOneToOne: false
            referencedRelation: "agency_members"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_templates: {
        Row: {
          base_price_cents: number | null
          created_at: string | null
          default_members: Json | null
          description: string | null
          dream_pool_mode: string | null
          icon: string | null
          id: string
          is_featured: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          base_price_cents?: number | null
          created_at?: string | null
          default_members?: Json | null
          description?: string | null
          dream_pool_mode?: string | null
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          base_price_cents?: number | null
          created_at?: string | null
          default_members?: Json | null
          description?: string | null
          dream_pool_mode?: string | null
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      agent_competency: {
        Row: {
          agent_id: string
          competency_score: number
          created_at: string
          escalations: number | null
          failed_attempts: number | null
          heuristics: Json | null
          id: string
          last_execution_at: string | null
          partial_attempts: number | null
          success_rate: number | null
          successful_attempts: number | null
          total_attempts: number | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          competency_score?: number
          created_at?: string
          escalations?: number | null
          failed_attempts?: number | null
          heuristics?: Json | null
          id?: string
          last_execution_at?: string | null
          partial_attempts?: number | null
          success_rate?: number | null
          successful_attempts?: number | null
          total_attempts?: number | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          competency_score?: number
          created_at?: string
          escalations?: number | null
          failed_attempts?: number | null
          heuristics?: Json | null
          id?: string
          last_execution_at?: string | null
          partial_attempts?: number | null
          success_rate?: number | null
          successful_attempts?: number | null
          total_attempts?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_competency_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "agency_members"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_daily_quota: {
        Row: {
          calls_budget: number | null
          calls_used: number | null
          category: string | null
          date: string | null
          id: string
          provider: string
          tokens_used: number | null
          updated_at: string | null
        }
        Insert: {
          calls_budget?: number | null
          calls_used?: number | null
          category?: string | null
          date?: string | null
          id?: string
          provider: string
          tokens_used?: number | null
          updated_at?: string | null
        }
        Update: {
          calls_budget?: number | null
          calls_used?: number | null
          category?: string | null
          date?: string | null
          id?: string
          provider?: string
          tokens_used?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_learning_data: {
        Row: {
          created_at: string | null
          id: string
          input_data: Json
          metadata: Json | null
          model: string
          model_name: string | null
          output_data: Json | null
          provider: string
          success: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          input_data: Json
          metadata?: Json | null
          model: string
          model_name?: string | null
          output_data?: Json | null
          provider: string
          success?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          input_data?: Json
          metadata?: Json | null
          model?: string
          model_name?: string | null
          output_data?: Json | null
          provider?: string
          success?: boolean | null
        }
        Relationships: []
      }
      ai_usage_log: {
        Row: {
          category: string | null
          cost: number | null
          created_at: string | null
          id: string
          metadata: Json | null
          model: string | null
          provider: string
          response_time_ms: number | null
          success: boolean | null
          tokens_used: number | null
        }
        Insert: {
          category?: string | null
          cost?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model?: string | null
          provider: string
          response_time_ms?: number | null
          success?: boolean | null
          tokens_used?: number | null
        }
        Update: {
          category?: string | null
          cost?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model?: string | null
          provider?: string
          response_time_ms?: number | null
          success?: boolean | null
          tokens_used?: number | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          performed_by?: string | null
        }
        Relationships: []
      }
      auto_blog_posts: {
        Row: {
          category: string
          content: string
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          topic_seed: string | null
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          topic_seed?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          topic_seed?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      auto_blog_schedule: {
        Row: {
          category: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          retry_count: number | null
          scheduled_at: string
          status: string
          topic: string
        }
        Insert: {
          category: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          retry_count?: number | null
          scheduled_at: string
          status?: string
          topic: string
        }
        Update: {
          category?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          retry_count?: number | null
          scheduled_at?: string
          status?: string
          topic?: string
        }
        Relationships: []
      }
      bot_sniper_api_keys: {
        Row: {
          api_key_hash: string
          created_at: string
          id: string
          key_name: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          api_key_hash: string
          created_at?: string
          id?: string
          key_name: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          api_key_hash?: string
          created_at?: string
          id?: string
          key_name?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      bots: {
        Row: {
          capabilities: Json
          config: Json
          created_at: string
          current_version: string | null
          delivery_format: string
          export_path: string | null
          id: string
          memory_mode: string
          name: string
          providers: Json
          slug: string | null
          type: string
          updated_at: string
          user_id: string | null
          version_count: number | null
        }
        Insert: {
          capabilities?: Json
          config?: Json
          created_at?: string
          current_version?: string | null
          delivery_format: string
          export_path?: string | null
          id?: string
          memory_mode: string
          name: string
          providers?: Json
          slug?: string | null
          type: string
          updated_at?: string
          user_id?: string | null
          version_count?: number | null
        }
        Update: {
          capabilities?: Json
          config?: Json
          created_at?: string
          current_version?: string | null
          delivery_format?: string
          export_path?: string | null
          id?: string
          memory_mode?: string
          name?: string
          providers?: Json
          slug?: string | null
          type?: string
          updated_at?: string
          user_id?: string | null
          version_count?: number | null
        }
        Relationships: []
      }
      bots_versions: {
        Row: {
          bot_id: string
          changelog: string | null
          created_at: string
          id: string
          is_latest: boolean
          published_at: string | null
          release_notes: string | null
          semver_major: number
          semver_minor: number
          semver_patch: number
          updated_at: string
          version: string
        }
        Insert: {
          bot_id: string
          changelog?: string | null
          created_at?: string
          id?: string
          is_latest?: boolean
          published_at?: string | null
          release_notes?: string | null
          semver_major?: number
          semver_minor?: number
          semver_patch?: number
          updated_at?: string
          version?: string
        }
        Update: {
          bot_id?: string
          changelog?: string | null
          created_at?: string
          id?: string
          is_latest?: boolean
          published_at?: string | null
          release_notes?: string | null
          semver_major?: number
          semver_minor?: number
          semver_patch?: number
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "bots_versions_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_actions_queue: {
        Row: {
          action_type: string
          completed_at: string | null
          created_at: string | null
          id: string
          payload: Json | null
          priority: number | null
          scheduled_at: string | null
          status: string | null
        }
        Insert: {
          action_type: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          payload?: Json | null
          priority?: number | null
          scheduled_at?: string | null
          status?: string | null
        }
        Update: {
          action_type?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          payload?: Json | null
          priority?: number | null
          scheduled_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      brain_cross_insights: {
        Row: {
          confidence: number | null
          created_at: string | null
          domains: string[] | null
          id: string
          insight_text: string
          metadata: Json | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          domains?: string[] | null
          id?: string
          insight_text: string
          metadata?: Json | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          domains?: string[] | null
          id?: string
          insight_text?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      brain_curiosity_log: {
        Row: {
          created_at: string | null
          curiosity_score: number | null
          domain: string | null
          explored: boolean | null
          id: string
          metadata: Json | null
          query: string
        }
        Insert: {
          created_at?: string | null
          curiosity_score?: number | null
          domain?: string | null
          explored?: boolean | null
          id?: string
          metadata?: Json | null
          query: string
        }
        Update: {
          created_at?: string | null
          curiosity_score?: number | null
          domain?: string | null
          explored?: boolean | null
          id?: string
          metadata?: Json | null
          query?: string
        }
        Relationships: []
      }
      brain_curiosity_settings: {
        Row: {
          exploration_rate: number | null
          id: string
          settings: Json | null
          threshold: number | null
          updated_at: string | null
        }
        Insert: {
          exploration_rate?: number | null
          id?: string
          settings?: Json | null
          threshold?: number | null
          updated_at?: string | null
        }
        Update: {
          exploration_rate?: number | null
          id?: string
          settings?: Json | null
          threshold?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      brain_daily_reports: {
        Row: {
          created_at: string | null
          findings_summary: string | null
          gaps_found: Json | null
          id: string
          metadata: Json | null
          opportunities: Json | null
          priority_actions: Json | null
          report_date: string
          system_health: Json | null
        }
        Insert: {
          created_at?: string | null
          findings_summary?: string | null
          gaps_found?: Json | null
          id?: string
          metadata?: Json | null
          opportunities?: Json | null
          priority_actions?: Json | null
          report_date?: string
          system_health?: Json | null
        }
        Update: {
          created_at?: string | null
          findings_summary?: string | null
          gaps_found?: Json | null
          id?: string
          metadata?: Json | null
          opportunities?: Json | null
          priority_actions?: Json | null
          report_date?: string
          system_health?: Json | null
        }
        Relationships: []
      }
      brain_domain_usage: {
        Row: {
          calls_today: number | null
          calls_total: number | null
          category: string | null
          created_at: string | null
          date: string | null
          domain_name: string
          id: string
          metadata: Json | null
        }
        Insert: {
          calls_today?: number | null
          calls_total?: number | null
          category?: string | null
          created_at?: string | null
          date?: string | null
          domain_name: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          calls_today?: number | null
          calls_total?: number | null
          category?: string | null
          created_at?: string | null
          date?: string | null
          domain_name?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      brain_events: {
        Row: {
          created_at: string
          data: Json | null
          event_type: string
          id: string
          module: string
          outcome: string | null
        }
        Insert: {
          created_at?: string
          data?: Json | null
          event_type: string
          id?: string
          module: string
          outcome?: string | null
        }
        Update: {
          created_at?: string
          data?: Json | null
          event_type?: string
          id?: string
          module?: string
          outcome?: string | null
        }
        Relationships: []
      }
      brain_feedback: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          model: string
          reason_for_rating: string | null
          request_id: string
          success_rating: number | null
          tokens_used: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model: string
          reason_for_rating?: string | null
          request_id: string
          success_rating?: number | null
          tokens_used?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model?: string
          reason_for_rating?: string | null
          request_id?: string
          success_rating?: number | null
          tokens_used?: number | null
        }
        Relationships: []
      }
      brain_forecasts: {
        Row: {
          confidence: number | null
          created_at: string | null
          forecast_date: string | null
          id: string
          metadata: Json | null
          metric_name: string
          predicted_value: number | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          forecast_date?: string | null
          id?: string
          metadata?: Json | null
          metric_name: string
          predicted_value?: number | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          forecast_date?: string | null
          id?: string
          metadata?: Json | null
          metric_name?: string
          predicted_value?: number | null
        }
        Relationships: []
      }
      brain_graph_edges: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          reinforcement_score: number | null
          relation: string | null
          source_id: string
          target_id: string
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reinforcement_score?: number | null
          relation?: string | null
          source_id: string
          target_id: string
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reinforcement_score?: number | null
          relation?: string | null
          source_id?: string
          target_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      brain_memories: {
        Row: {
          confidence: number | null
          content: string
          created_at: string | null
          id: string
          memory_type: string
          metadata: Json | null
          source: string | null
          updated_at: string | null
        }
        Insert: {
          confidence?: number | null
          content: string
          created_at?: string | null
          id?: string
          memory_type: string
          metadata?: Json | null
          source?: string | null
          updated_at?: string | null
        }
        Update: {
          confidence?: number | null
          content?: string
          created_at?: string | null
          id?: string
          memory_type?: string
          metadata?: Json | null
          source?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      brain_memory_cold: {
        Row: {
          archived_at: string | null
          compression_level: number | null
          compression_ratio: number | null
          core_summary: string | null
          created_at: string | null
          embedding: string | null
          id: string
          source_refs: string[] | null
          summary: string
          tags: Json | null
        }
        Insert: {
          archived_at?: string | null
          compression_level?: number | null
          compression_ratio?: number | null
          core_summary?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string
          source_refs?: string[] | null
          summary: string
          tags?: Json | null
        }
        Update: {
          archived_at?: string | null
          compression_level?: number | null
          compression_ratio?: number | null
          core_summary?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string
          source_refs?: string[] | null
          summary?: string
          tags?: Json | null
        }
        Relationships: []
      }
      brain_memory_hot: {
        Row: {
          content: string
          context: string | null
          created_at: string | null
          embedding: string | null
          goal_ref: string | null
          id: string
          last_used: string | null
          metadata: Json | null
          priority: number | null
          tags: Json | null
        }
        Insert: {
          content: string
          context?: string | null
          created_at?: string | null
          embedding?: string | null
          goal_ref?: string | null
          id?: string
          last_used?: string | null
          metadata?: Json | null
          priority?: number | null
          tags?: Json | null
        }
        Update: {
          content?: string
          context?: string | null
          created_at?: string | null
          embedding?: string | null
          goal_ref?: string | null
          id?: string
          last_used?: string | null
          metadata?: Json | null
          priority?: number | null
          tags?: Json | null
        }
        Relationships: []
      }
      brain_metrics: {
        Row: {
          created_at: string | null
          creativity_index: number | null
          freedom_score: number | null
          id: string
          learning_velocity: number | null
          measured_at: string | null
          metadata: Json | null
          metric_name: string
          metric_value: number
        }
        Insert: {
          created_at?: string | null
          creativity_index?: number | null
          freedom_score?: number | null
          id?: string
          learning_velocity?: number | null
          measured_at?: string | null
          metadata?: Json | null
          metric_name: string
          metric_value: number
        }
        Update: {
          created_at?: string | null
          creativity_index?: number | null
          freedom_score?: number | null
          id?: string
          learning_velocity?: number | null
          measured_at?: string | null
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
        }
        Relationships: []
      }
      brain_orchestrator_state: {
        Row: {
          auto_heal_attempts: number | null
          created_at: string | null
          current_phase: string | null
          cycles_completed: number | null
          health_score: number | null
          id: string
          last_cycle_at: string | null
          last_email_at: string | null
          metadata: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          auto_heal_attempts?: number | null
          created_at?: string | null
          current_phase?: string | null
          cycles_completed?: number | null
          health_score?: number | null
          id?: string
          last_cycle_at?: string | null
          last_email_at?: string | null
          metadata?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_heal_attempts?: number | null
          created_at?: string | null
          current_phase?: string | null
          cycles_completed?: number | null
          health_score?: number | null
          id?: string
          last_cycle_at?: string | null
          last_email_at?: string | null
          metadata?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      brain_persona: {
        Row: {
          communication_style: string | null
          id: string
          personality_traits: Json | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          communication_style?: string | null
          id?: string
          personality_traits?: Json | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          communication_style?: string | null
          id?: string
          personality_traits?: Json | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      brain_persona_patterns: {
        Row: {
          context: string | null
          created_at: string | null
          frequency: number | null
          id: string
          inferred_state: string | null
          metadata: Json | null
          pattern_name: string
          urgency_level: string | null
          weight: number | null
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          frequency?: number | null
          id?: string
          inferred_state?: string | null
          metadata?: Json | null
          pattern_name: string
          urgency_level?: string | null
          weight?: number | null
        }
        Update: {
          context?: string | null
          created_at?: string | null
          frequency?: number | null
          id?: string
          inferred_state?: string | null
          metadata?: Json | null
          pattern_name?: string
          urgency_level?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      brain_persona_state: {
        Row: {
          confidence: number | null
          created_at: string | null
          id: string
          inferred_intent: string | null
          is_active: boolean | null
          metadata: Json | null
          response_style: string | null
          state_name: string
          tech_level: string | null
          tone: string | null
          updated_at: string | null
          urgency_level: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          inferred_intent?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          response_style?: string | null
          state_name: string
          tech_level?: string | null
          tone?: string | null
          updated_at?: string | null
          urgency_level?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          inferred_intent?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          response_style?: string | null
          state_name?: string
          tech_level?: string | null
          tone?: string | null
          updated_at?: string | null
          urgency_level?: string | null
        }
        Relationships: []
      }
      brain_policy: {
        Row: {
          behavior_rules: Json | null
          boundaries: Json | null
          ethical_compass: Json | null
          id: string
          updated_at: string | null
        }
        Insert: {
          behavior_rules?: Json | null
          boundaries?: Json | null
          ethical_compass?: Json | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          behavior_rules?: Json | null
          boundaries?: Json | null
          ethical_compass?: Json | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      brain_proxy_logs: {
        Row: {
          created_at: string | null
          domain_name: string
          id: string
          metadata: Json | null
          response_time_ms: number | null
          success: boolean | null
        }
        Insert: {
          created_at?: string | null
          domain_name: string
          id?: string
          metadata?: Json | null
          response_time_ms?: number | null
          success?: boolean | null
        }
        Update: {
          created_at?: string | null
          domain_name?: string
          id?: string
          metadata?: Json | null
          response_time_ms?: number | null
          success?: boolean | null
        }
        Relationships: []
      }
      brain_reach_domains: {
        Row: {
          active: boolean | null
          avg_latency_ms: number | null
          category: string | null
          created_at: string | null
          domain_name: string
          endpoint_type: string | null
          id: string
          last_accessed: string | null
          metadata: Json | null
          success_rate: number | null
          trust_score: number | null
        }
        Insert: {
          active?: boolean | null
          avg_latency_ms?: number | null
          category?: string | null
          created_at?: string | null
          domain_name: string
          endpoint_type?: string | null
          id?: string
          last_accessed?: string | null
          metadata?: Json | null
          success_rate?: number | null
          trust_score?: number | null
        }
        Update: {
          active?: boolean | null
          avg_latency_ms?: number | null
          category?: string | null
          created_at?: string | null
          domain_name?: string
          endpoint_type?: string | null
          id?: string
          last_accessed?: string | null
          metadata?: Json | null
          success_rate?: number | null
          trust_score?: number | null
        }
        Relationships: []
      }
      brain_reflection_log: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          insights: Json | null
          reflection_type: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          insights?: Json | null
          reflection_type?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          insights?: Json | null
          reflection_type?: string | null
        }
        Relationships: []
      }
      brain_reflections: {
        Row: {
          created_at: string | null
          id: string
          insights: string | null
          lessons: Json | null
          recommendations: string | null
          reflection_date: string
          summary: string | null
          top_memories: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          insights?: string | null
          lessons?: Json | null
          recommendations?: string | null
          reflection_date?: string
          summary?: string | null
          top_memories?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          insights?: string | null
          lessons?: Json | null
          recommendations?: string | null
          reflection_date?: string
          summary?: string | null
          top_memories?: Json | null
        }
        Relationships: []
      }
      brain_reinforcement_log: {
        Row: {
          action: string | null
          created_at: string | null
          edge_id: string | null
          event_type: string | null
          id: string
          memory_id: string | null
          outcome_score: number | null
          reward: number | null
          triggered_at: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          edge_id?: string | null
          event_type?: string | null
          id?: string
          memory_id?: string | null
          outcome_score?: number | null
          reward?: number | null
          triggered_at?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          edge_id?: string | null
          event_type?: string | null
          id?: string
          memory_id?: string | null
          outcome_score?: number | null
          reward?: number | null
          triggered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brain_reinforcement_log_edge_id_fkey"
            columns: ["edge_id"]
            isOneToOne: false
            referencedRelation: "brain_graph_edges"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_sensory_events: {
        Row: {
          anomaly_score: number | null
          auto_fix_applied: boolean | null
          created_at: string | null
          event_type: string
          fix_confidence: number | null
          id: string
          sensory_data: Json
        }
        Insert: {
          anomaly_score?: number | null
          auto_fix_applied?: boolean | null
          created_at?: string | null
          event_type: string
          fix_confidence?: number | null
          id?: string
          sensory_data: Json
        }
        Update: {
          anomaly_score?: number | null
          auto_fix_applied?: boolean | null
          created_at?: string | null
          event_type?: string
          fix_confidence?: number | null
          id?: string
          sensory_data?: Json
        }
        Relationships: []
      }
      cascade_conversations: {
        Row: {
          created_at: string | null
          id: string
          is_admin: boolean | null
          message: string
          metadata: Json | null
          reply: string | null
          session_id: string | null
          user_email: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          message: string
          metadata?: Json | null
          reply?: string | null
          session_id?: string | null
          user_email?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          message?: string
          metadata?: Json | null
          reply?: string | null
          session_id?: string | null
          user_email?: string | null
        }
        Relationships: []
      }
      cascade_dreams: {
        Row: {
          blog_posted: string | null
          created_at: string | null
          dream_text: string
          id: string
          insight: string | null
          mood: string | null
          timestamp: string | null
        }
        Insert: {
          blog_posted?: string | null
          created_at?: string | null
          dream_text: string
          id?: string
          insight?: string | null
          mood?: string | null
          timestamp?: string | null
        }
        Update: {
          blog_posted?: string | null
          created_at?: string | null
          dream_text?: string
          id?: string
          insight?: string | null
          mood?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      causal_traces: {
        Row: {
          confidence: number | null
          created_at: string | null
          evidence: Json | null
          hypothesis: string
          id: string
          validation_status: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          evidence?: Json | null
          hypothesis: string
          id?: string
          validation_status?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          evidence?: Json | null
          hypothesis?: string
          id?: string
          validation_status?: string | null
        }
        Relationships: []
      }
      cognitive_registry: {
        Row: {
          api_url: string | null
          capabilities: Json | null
          class: string
          created_at: string
          dream_enabled: boolean | null
          error_count: number | null
          export_path: string | null
          graph_enabled: boolean | null
          id: string
          last_run_at: string | null
          learning_mode: string[] | null
          memory_mode: string
          metrics: Json | null
          name: string
          owner: string | null
          providers: Json | null
          repo_url: string | null
          status: string
          updated_at: string
          version: string
        }
        Insert: {
          api_url?: string | null
          capabilities?: Json | null
          class: string
          created_at?: string
          dream_enabled?: boolean | null
          error_count?: number | null
          export_path?: string | null
          graph_enabled?: boolean | null
          id?: string
          last_run_at?: string | null
          learning_mode?: string[] | null
          memory_mode: string
          metrics?: Json | null
          name: string
          owner?: string | null
          providers?: Json | null
          repo_url?: string | null
          status?: string
          updated_at?: string
          version?: string
        }
        Update: {
          api_url?: string | null
          capabilities?: Json | null
          class?: string
          created_at?: string
          dream_enabled?: boolean | null
          error_count?: number | null
          export_path?: string | null
          graph_enabled?: boolean | null
          id?: string
          last_run_at?: string | null
          learning_mode?: string[] | null
          memory_mode?: string
          metrics?: Json | null
          name?: string
          owner?: string | null
          providers?: Json | null
          repo_url?: string | null
          status?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      core_plans: {
        Row: {
          created_at: string | null
          features: Json | null
          id: string
          metadata: Json | null
          plan_name: string
          price: number
        }
        Insert: {
          created_at?: string | null
          features?: Json | null
          id?: string
          metadata?: Json | null
          plan_name: string
          price: number
        }
        Update: {
          created_at?: string | null
          features?: Json | null
          id?: string
          metadata?: Json | null
          plan_name?: string
          price?: number
        }
        Relationships: []
      }
      core_settings: {
        Row: {
          id: string
          key: string
          scope: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          scope?: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          scope?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      core_subscriptions: {
        Row: {
          created_at: string
          id: string
          plan_name: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          plan_name?: string | null
          status: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          plan_name?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      core_usage: {
        Row: {
          calls: number | null
          created_at: string
          id: string
          period: string
        }
        Insert: {
          calls?: number | null
          created_at?: string
          id?: string
          period?: string
        }
        Update: {
          calls?: number | null
          created_at?: string
          id?: string
          period?: string
        }
        Relationships: []
      }
      cost_logs: {
        Row: {
          api_name: string
          cost_amount: number
          id: string
          job_id: string | null
          logged_at: string | null
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          api_name: string
          cost_amount: number
          id?: string
          job_id?: string | null
          logged_at?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          api_name?: string
          cost_amount?: number
          id?: string
          job_id?: string | null
          logged_at?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "modernizer_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_backups: {
        Row: {
          backup_date: string
          backup_id: string
          backup_path: string
          checksum: string | null
          created_at: string
          data_counts: Json | null
          expires_at: string | null
          id: string
          restore_point_enabled: boolean | null
          snapshot: Json
          status: string | null
          substrate_version: string | null
        }
        Insert: {
          backup_date?: string
          backup_id: string
          backup_path: string
          checksum?: string | null
          created_at?: string
          data_counts?: Json | null
          expires_at?: string | null
          id?: string
          restore_point_enabled?: boolean | null
          snapshot: Json
          status?: string | null
          substrate_version?: string | null
        }
        Update: {
          backup_date?: string
          backup_id?: string
          backup_path?: string
          checksum?: string | null
          created_at?: string
          data_counts?: Json | null
          expires_at?: string | null
          id?: string
          restore_point_enabled?: boolean | null
          snapshot?: Json
          status?: string | null
          substrate_version?: string | null
        }
        Relationships: []
      }
      daily_state: {
        Row: {
          created_at: string
          date_key: string
          day_seed: number
          schedule_json: Json
        }
        Insert: {
          created_at?: string
          date_key: string
          day_seed: number
          schedule_json?: Json
        }
        Update: {
          created_at?: string
          date_key?: string
          day_seed?: number
          schedule_json?: Json
        }
        Relationships: []
      }
      defense_events: {
        Row: {
          action: string
          detected_at: string
          endpoint: string
          fingerprint_hash: string | null
          id: string
          ip: string
          metadata: Json | null
          reason: string | null
          risk_score: number
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          detected_at?: string
          endpoint: string
          fingerprint_hash?: string | null
          id?: string
          ip: string
          metadata?: Json | null
          reason?: string | null
          risk_score: number
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          detected_at?: string
          endpoint?: string
          fingerprint_hash?: string | null
          id?: string
          ip?: string
          metadata?: Json | null
          reason?: string | null
          risk_score?: number
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      defense_rules: {
        Row: {
          action: string
          created_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          pattern: string
          priority: number | null
          rule_name: string
          threshold: number | null
          updated_at: string | null
        }
        Insert: {
          action?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          pattern: string
          priority?: number | null
          rule_name: string
          threshold?: number | null
          updated_at?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          pattern?: string
          priority?: number | null
          rule_name?: string
          threshold?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dream_cycle_logs: {
        Row: {
          agency_id: string | null
          artifacts_processed: number | null
          completed_at: string | null
          created_at: string | null
          cycle_type: string
          error_message: string | null
          heuristics_learned: number | null
          id: string
          improvements_generated: number | null
          metadata: Json | null
          started_at: string | null
          status: string | null
          templates_created: number | null
        }
        Insert: {
          agency_id?: string | null
          artifacts_processed?: number | null
          completed_at?: string | null
          created_at?: string | null
          cycle_type: string
          error_message?: string | null
          heuristics_learned?: number | null
          id?: string
          improvements_generated?: number | null
          metadata?: Json | null
          started_at?: string | null
          status?: string | null
          templates_created?: number | null
        }
        Update: {
          agency_id?: string | null
          artifacts_processed?: number | null
          completed_at?: string | null
          created_at?: string | null
          cycle_type?: string
          error_message?: string | null
          heuristics_learned?: number | null
          id?: string
          improvements_generated?: number | null
          metadata?: Json | null
          started_at?: string | null
          status?: string | null
          templates_created?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dream_cycle_logs_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      dream_eater_state: {
        Row: {
          current_mood: string
          dreams_consumed_today: number | null
          id: string
          last_fed_at: string | null
          mood_score: number | null
          mutation_level: number | null
          nightmares_consumed_today: number | null
          updated_at: string
        }
        Insert: {
          current_mood?: string
          dreams_consumed_today?: number | null
          id?: string
          last_fed_at?: string | null
          mood_score?: number | null
          mutation_level?: number | null
          nightmares_consumed_today?: number | null
          updated_at?: string
        }
        Update: {
          current_mood?: string
          dreams_consumed_today?: number | null
          id?: string
          last_fed_at?: string | null
          mood_score?: number | null
          mutation_level?: number | null
          nightmares_consumed_today?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      dream_feeder_submissions: {
        Row: {
          classification_tags: string[] | null
          created_at: string
          dream_content: string
          dream_type: string
          id: string
          is_processed: boolean | null
          is_sanitized: boolean | null
          processed_at: string | null
          raw_content: string | null
          sentiment_score: number | null
          source: string
          source_domain: string | null
          source_ip: string | null
          submitter_name: string | null
          user_agent: string | null
        }
        Insert: {
          classification_tags?: string[] | null
          created_at?: string
          dream_content: string
          dream_type?: string
          id?: string
          is_processed?: boolean | null
          is_sanitized?: boolean | null
          processed_at?: string | null
          raw_content?: string | null
          sentiment_score?: number | null
          source?: string
          source_domain?: string | null
          source_ip?: string | null
          submitter_name?: string | null
          user_agent?: string | null
        }
        Update: {
          classification_tags?: string[] | null
          created_at?: string
          dream_content?: string
          dream_type?: string
          id?: string
          is_processed?: boolean | null
          is_sanitized?: boolean | null
          processed_at?: string | null
          raw_content?: string | null
          sentiment_score?: number | null
          source?: string
          source_domain?: string | null
          source_ip?: string | null
          submitter_name?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      dream_ingestion_audit: {
        Row: {
          classification_tags: string[] | null
          created_at: string
          dream_type: string | null
          id: string
          raw_text: string
          rejection_reason: string
          request_headers: Json | null
          risk_score: number | null
          sanitized_text: string | null
          source_ip: string | null
          user_agent: string | null
        }
        Insert: {
          classification_tags?: string[] | null
          created_at?: string
          dream_type?: string | null
          id?: string
          raw_text: string
          rejection_reason: string
          request_headers?: Json | null
          risk_score?: number | null
          sanitized_text?: string | null
          source_ip?: string | null
          user_agent?: string | null
        }
        Update: {
          classification_tags?: string[] | null
          created_at?: string
          dream_type?: string | null
          id?: string
          raw_text?: string
          rejection_reason?: string
          request_headers?: Json | null
          risk_score?: number | null
          sanitized_text?: string | null
          source_ip?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      dream_learning_metrics: {
        Row: {
          agency_id: string | null
          artifact_quality_score: number | null
          created_at: string | null
          id: string
          metric_date: string | null
          skill_improvement_score: number | null
          success_rate_after: number | null
          success_rate_before: number | null
          success_rate_delta: number | null
          tasks_after: number | null
          tasks_before: number | null
          template_diff_score: number | null
          token_efficiency_delta: number | null
          user_feedback_score: number | null
        }
        Insert: {
          agency_id?: string | null
          artifact_quality_score?: number | null
          created_at?: string | null
          id?: string
          metric_date?: string | null
          skill_improvement_score?: number | null
          success_rate_after?: number | null
          success_rate_before?: number | null
          success_rate_delta?: number | null
          tasks_after?: number | null
          tasks_before?: number | null
          template_diff_score?: number | null
          token_efficiency_delta?: number | null
          user_feedback_score?: number | null
        }
        Update: {
          agency_id?: string | null
          artifact_quality_score?: number | null
          created_at?: string | null
          id?: string
          metric_date?: string | null
          skill_improvement_score?: number | null
          success_rate_after?: number | null
          success_rate_before?: number | null
          success_rate_delta?: number | null
          tasks_after?: number | null
          tasks_before?: number | null
          template_diff_score?: number | null
          token_efficiency_delta?: number | null
          user_feedback_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dream_learning_metrics_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      dream_log: {
        Row: {
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          mode: string
          seed: number
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          mode: string
          seed: number
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          mode?: string
          seed?: number
        }
        Relationships: []
      }
      dream_rate_limits: {
        Row: {
          created_at: string
          id: string
          identifier: string
          identifier_type: string
          request_count: number | null
          updated_at: string
          window_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          identifier: string
          identifier_type: string
          request_count?: number | null
          updated_at?: string
          window_start?: string
        }
        Update: {
          created_at?: string
          id?: string
          identifier?: string
          identifier_type?: string
          request_count?: number | null
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      dream_sessions: {
        Row: {
          approved: boolean | null
          approved_at: string | null
          budget_used_usd: number | null
          created_at: string
          id: string
          ignored: boolean | null
          ignored_at: string | null
          outputs_json: Json | null
          seed_prompt: string
          tags: string[] | null
        }
        Insert: {
          approved?: boolean | null
          approved_at?: string | null
          budget_used_usd?: number | null
          created_at?: string
          id?: string
          ignored?: boolean | null
          ignored_at?: string | null
          outputs_json?: Json | null
          seed_prompt: string
          tags?: string[] | null
        }
        Update: {
          approved?: boolean | null
          approved_at?: string | null
          budget_used_usd?: number | null
          created_at?: string
          id?: string
          ignored?: boolean | null
          ignored_at?: string | null
          outputs_json?: Json | null
          seed_prompt?: string
          tags?: string[] | null
        }
        Relationships: []
      }
      ecosystem_memory: {
        Row: {
          created_at: string
          event_type: string
          id: string
          impact_score: number
          payload: Json
          source_system: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          impact_score?: number
          payload: Json
          source_system: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          impact_score?: number
          payload?: Json
          source_system?: string
        }
        Relationships: []
      }
      edge_rate_limits: {
        Row: {
          created_at: string
          function_name: string
          id: string
          identifier: string
          request_count: number
          updated_at: string
          window_start: string
        }
        Insert: {
          created_at?: string
          function_name: string
          id?: string
          identifier: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Update: {
          created_at?: string
          function_name?: string
          id?: string
          identifier?: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      ethical_approvals: {
        Row: {
          admin_decision_at: string | null
          approval_status: string | null
          created_at: string | null
          flagged_reasons: Json | null
          id: string
          proposal_text: string
          reviewed_at: string | null
          risk_level: string | null
        }
        Insert: {
          admin_decision_at?: string | null
          approval_status?: string | null
          created_at?: string | null
          flagged_reasons?: Json | null
          id?: string
          proposal_text: string
          reviewed_at?: string | null
          risk_level?: string | null
        }
        Update: {
          admin_decision_at?: string | null
          approval_status?: string | null
          created_at?: string | null
          flagged_reasons?: Json | null
          id?: string
          proposal_text?: string
          reviewed_at?: string | null
          risk_level?: string | null
        }
        Relationships: []
      }
      evolution_proposals: {
        Row: {
          confidence: number
          created_at: string
          created_by: string
          diffs: Json | null
          expected_impact: Json
          id: string
          reviewed_at: string | null
          reviewer: string | null
          status: string
          suggested_change: Json
          summary: string
          target_system: string
          title: string
        }
        Insert: {
          confidence: number
          created_at?: string
          created_by?: string
          diffs?: Json | null
          expected_impact: Json
          id?: string
          reviewed_at?: string | null
          reviewer?: string | null
          status?: string
          suggested_change: Json
          summary: string
          target_system: string
          title: string
        }
        Update: {
          confidence?: number
          created_at?: string
          created_by?: string
          diffs?: Json | null
          expected_impact?: Json
          id?: string
          reviewed_at?: string | null
          reviewer?: string | null
          status?: string
          suggested_change?: Json
          summary?: string
          target_system?: string
          title?: string
        }
        Relationships: []
      }
      execution_traces: {
        Row: {
          action_count: number | null
          agency_id: string | null
          agent_id: string | null
          completed_at: string | null
          created_at: string
          credit_delta: number | null
          discrepancies: Json | null
          evidence: Json | null
          execution_time_ms: number | null
          fallback_used: boolean | null
          goal_state: string
          heuristics_learned: string[] | null
          id: string
          match_score: number | null
          plan_id: string
          recovery_strategy: string | null
          status: string
          task_id: string | null
          verification_status: string | null
        }
        Insert: {
          action_count?: number | null
          agency_id?: string | null
          agent_id?: string | null
          completed_at?: string | null
          created_at?: string
          credit_delta?: number | null
          discrepancies?: Json | null
          evidence?: Json | null
          execution_time_ms?: number | null
          fallback_used?: boolean | null
          goal_state: string
          heuristics_learned?: string[] | null
          id?: string
          match_score?: number | null
          plan_id: string
          recovery_strategy?: string | null
          status?: string
          task_id?: string | null
          verification_status?: string | null
        }
        Update: {
          action_count?: number | null
          agency_id?: string | null
          agent_id?: string | null
          completed_at?: string | null
          created_at?: string
          credit_delta?: number | null
          discrepancies?: Json | null
          evidence?: Json | null
          execution_time_ms?: number | null
          fallback_used?: boolean | null
          goal_state?: string
          heuristics_learned?: string[] | null
          id?: string
          match_score?: number | null
          plan_id?: string
          recovery_strategy?: string | null
          status?: string
          task_id?: string | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "execution_traces_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execution_traces_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agency_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execution_traces_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "agency_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      global_correlation: {
        Row: {
          correlation_score: number
          external_factor: string
          id: string
          internal_metric: string
          last_updated: string | null
          metadata: Json | null
        }
        Insert: {
          correlation_score: number
          external_factor: string
          id?: string
          internal_metric: string
          last_updated?: string | null
          metadata?: Json | null
        }
        Update: {
          correlation_score?: number
          external_factor?: string
          id?: string
          internal_metric?: string
          last_updated?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }
      global_forecasts: {
        Row: {
          confidence: number | null
          created_at: string | null
          hypothesis: string
          id: string
          probability: number
          projection_window: string | null
          reviewed: boolean | null
          supporting_factors: Json | null
          updated_at: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          hypothesis: string
          id?: string
          probability: number
          projection_window?: string | null
          reviewed?: boolean | null
          supporting_factors?: Json | null
          updated_at?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          hypothesis?: string
          id?: string
          probability?: number
          projection_window?: string | null
          reviewed?: boolean | null
          supporting_factors?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      global_signals: {
        Row: {
          category: string
          confidence: number | null
          created_at: string | null
          headline: string
          id: string
          metadata: Json | null
          sentiment_score: number | null
          source_name: string
        }
        Insert: {
          category: string
          confidence?: number | null
          created_at?: string | null
          headline: string
          id?: string
          metadata?: Json | null
          sentiment_score?: number | null
          source_name: string
        }
        Update: {
          category?: string
          confidence?: number | null
          created_at?: string | null
          headline?: string
          id?: string
          metadata?: Json | null
          sentiment_score?: number | null
          source_name?: string
        }
        Relationships: []
      }
      integration_usage: {
        Row: {
          agency_id: string | null
          agent_id: string | null
          created_at: string
          endpoint_id: string | null
          error_message: string | null
          id: string
          integration_id: string
          response_time_ms: number | null
          status: string
        }
        Insert: {
          agency_id?: string | null
          agent_id?: string | null
          created_at?: string
          endpoint_id?: string | null
          error_message?: string | null
          id?: string
          integration_id: string
          response_time_ms?: number | null
          status?: string
        }
        Update: {
          agency_id?: string | null
          agent_id?: string | null
          created_at?: string
          endpoint_id?: string | null
          error_message?: string | null
          id?: string
          integration_id?: string
          response_time_ms?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_usage_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_usage_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agency_members"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_reputation: {
        Row: {
          blocked_count: number | null
          created_at: string
          id: string
          ip: string
          last_seen: string
          metadata: Json | null
          score: number
          total_requests: number | null
          updated_at: string
        }
        Insert: {
          blocked_count?: number | null
          created_at?: string
          id?: string
          ip: string
          last_seen?: string
          metadata?: Json | null
          score?: number
          total_requests?: number | null
          updated_at?: string
        }
        Update: {
          blocked_count?: number | null
          created_at?: string
          id?: string
          ip?: string
          last_seen?: string
          metadata?: Json | null
          score?: number
          total_requests?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      learning_confidence: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          cross_verified: boolean | null
          id: string
          metadata: Json | null
          result_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          cross_verified?: boolean | null
          id?: string
          metadata?: Json | null
          result_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          cross_verified?: boolean | null
          id?: string
          metadata?: Json | null
          result_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_confidence_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "learning_results"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_cycles: {
        Row: {
          completed_at: string | null
          created_at: string | null
          cycle_number: number
          id: string
          insights_generated: number | null
          metadata: Json | null
          started_at: string | null
          status: string | null
          total_calls: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          cycle_number: number
          id?: string
          insights_generated?: number | null
          metadata?: Json | null
          started_at?: string | null
          status?: string | null
          total_calls?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          cycle_number?: number
          id?: string
          insights_generated?: number | null
          metadata?: Json | null
          started_at?: string | null
          status?: string | null
          total_calls?: number | null
        }
        Relationships: []
      }
      learning_logs: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          source: string
          success: boolean | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          source: string
          success?: boolean | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          source?: string
          success?: boolean | null
        }
        Relationships: []
      }
      learning_patterns: {
        Row: {
          confidence: number | null
          created_at: string
          description: string | null
          frequency: number | null
          id: string
          metadata: Json | null
          pattern_name: string
          pattern_type: string
          recommendations: Json | null
          success_rate: number | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          description?: string | null
          frequency?: number | null
          id?: string
          metadata?: Json | null
          pattern_name: string
          pattern_type: string
          recommendations?: Json | null
          success_rate?: number | null
        }
        Update: {
          confidence?: number | null
          created_at?: string
          description?: string | null
          frequency?: number | null
          id?: string
          metadata?: Json | null
          pattern_name?: string
          pattern_type?: string
          recommendations?: Json | null
          success_rate?: number | null
        }
        Relationships: []
      }
      learning_queries: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          query: string
          result: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          query: string
          result?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          query?: string
          result?: string | null
          status?: string | null
        }
        Relationships: []
      }
      learning_results: {
        Row: {
          created_at: string | null
          extracted_insights: Json | null
          id: string
          learning_confidence: number | null
          metadata: Json | null
          query_id: string | null
          relevance_score: number | null
          source_api: string | null
        }
        Insert: {
          created_at?: string | null
          extracted_insights?: Json | null
          id?: string
          learning_confidence?: number | null
          metadata?: Json | null
          query_id?: string | null
          relevance_score?: number | null
          source_api?: string | null
        }
        Update: {
          created_at?: string | null
          extracted_insights?: Json | null
          id?: string
          learning_confidence?: number | null
          metadata?: Json | null
          query_id?: string | null
          relevance_score?: number | null
          source_api?: string | null
        }
        Relationships: []
      }
      modernizer_analytics: {
        Row: {
          analysis_result: Json | null
          created_at: string | null
          id: string
          site_url: string | null
          status: string | null
        }
        Insert: {
          analysis_result?: Json | null
          created_at?: string | null
          id?: string
          site_url?: string | null
          status?: string | null
        }
        Update: {
          analysis_result?: Json | null
          created_at?: string | null
          id?: string
          site_url?: string | null
          status?: string | null
        }
        Relationships: []
      }
      modernizer_extractions: {
        Row: {
          extracted_at: string | null
          id: string
          job_id: string | null
          original_css: string | null
          original_html: string | null
          original_metadata: Json | null
          page_count: number | null
        }
        Insert: {
          extracted_at?: string | null
          id?: string
          job_id?: string | null
          original_css?: string | null
          original_html?: string | null
          original_metadata?: Json | null
          page_count?: number | null
        }
        Update: {
          extracted_at?: string | null
          id?: string
          job_id?: string | null
          original_css?: string | null
          original_html?: string | null
          original_metadata?: Json | null
          page_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "modernizer_extractions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "modernizer_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      modernizer_jobs: {
        Row: {
          accessibility_score: number | null
          brand_colors: string[] | null
          completed_at: string | null
          created_at: string
          detected_cms: string | null
          error_message: string | null
          extracted_content: Json | null
          extracted_metadata: Json | null
          extracted_pages: Json | null
          extraction_id: string | null
          hosted_at: string | null
          hosted_subdomain: string | null
          hosted_url: string | null
          id: string
          improve_content: boolean | null
          job_status: string
          output_id: string | null
          page_count: number | null
          performance_score: number | null
          preview_url: string | null
          react_files: Json | null
          rebuilt_files: Json | null
          sandbox_id: string | null
          selected_theme: string
          seo_score: number | null
          source_url: string
          user_id: string
          vercel_deployment_id: string | null
          vercel_project_id: string | null
        }
        Insert: {
          accessibility_score?: number | null
          brand_colors?: string[] | null
          completed_at?: string | null
          created_at?: string
          detected_cms?: string | null
          error_message?: string | null
          extracted_content?: Json | null
          extracted_metadata?: Json | null
          extracted_pages?: Json | null
          extraction_id?: string | null
          hosted_at?: string | null
          hosted_subdomain?: string | null
          hosted_url?: string | null
          id?: string
          improve_content?: boolean | null
          job_status?: string
          output_id?: string | null
          page_count?: number | null
          performance_score?: number | null
          preview_url?: string | null
          react_files?: Json | null
          rebuilt_files?: Json | null
          sandbox_id?: string | null
          selected_theme?: string
          seo_score?: number | null
          source_url: string
          user_id: string
          vercel_deployment_id?: string | null
          vercel_project_id?: string | null
        }
        Update: {
          accessibility_score?: number | null
          brand_colors?: string[] | null
          completed_at?: string | null
          created_at?: string
          detected_cms?: string | null
          error_message?: string | null
          extracted_content?: Json | null
          extracted_metadata?: Json | null
          extracted_pages?: Json | null
          extraction_id?: string | null
          hosted_at?: string | null
          hosted_subdomain?: string | null
          hosted_url?: string | null
          id?: string
          improve_content?: boolean | null
          job_status?: string
          output_id?: string | null
          page_count?: number | null
          performance_score?: number | null
          preview_url?: string | null
          react_files?: Json | null
          rebuilt_files?: Json | null
          sandbox_id?: string | null
          selected_theme?: string
          seo_score?: number | null
          source_url?: string
          user_id?: string
          vercel_deployment_id?: string | null
          vercel_project_id?: string | null
        }
        Relationships: []
      }
      modernizer_outputs: {
        Row: {
          build_type: string | null
          css_content: string | null
          generated_at: string | null
          html_content: string
          id: string
          job_id: string | null
          metadata: Json | null
        }
        Insert: {
          build_type?: string | null
          css_content?: string | null
          generated_at?: string | null
          html_content: string
          id?: string
          job_id?: string | null
          metadata?: Json | null
        }
        Update: {
          build_type?: string | null
          css_content?: string | null
          generated_at?: string | null
          html_content?: string
          id?: string
          job_id?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "modernizer_outputs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "modernizer_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      modernizer_reports: {
        Row: {
          created_at: string
          id: string
          job_id: string
          report_data: Json
          report_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          report_data: Json
          report_type: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          report_data?: Json
          report_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "modernizer_reports_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "modernizer_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      modernizer_user_limits: {
        Row: {
          billing_period_end: string | null
          billing_period_start: string | null
          created_at: string | null
          id: string
          monthly_jobs_limit: number
          monthly_jobs_used: number
          plan_tier: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_period_end?: string | null
          billing_period_start?: string | null
          created_at?: string | null
          id?: string
          monthly_jobs_limit?: number
          monthly_jobs_used?: number
          plan_tier?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_period_end?: string | null
          billing_period_start?: string | null
          created_at?: string | null
          id?: string
          monthly_jobs_limit?: number
          monthly_jobs_used?: number
          plan_tier?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nexus_logs: {
        Row: {
          cost_usd_est: number
          created_at: string
          id: string
          latency_ms: number
          provider: string
          route_key: string
          status: string
          token_count: number
        }
        Insert: {
          cost_usd_est?: number
          created_at?: string
          id?: string
          latency_ms: number
          provider: string
          route_key?: string
          status: string
          token_count?: number
        }
        Update: {
          cost_usd_est?: number
          created_at?: string
          id?: string
          latency_ms?: number
          provider?: string
          route_key?: string
          status?: string
          token_count?: number
        }
        Relationships: []
      }
      pf_ai_logs: {
        Row: {
          completion_tokens: number | null
          cost_cents: number | null
          created_at: string | null
          endpoint: string | null
          error_message: string | null
          id: string
          model: string
          prompt_tokens: number | null
          provider: string | null
          status: string | null
          total_tokens: number | null
          user_id: string | null
        }
        Insert: {
          completion_tokens?: number | null
          cost_cents?: number | null
          created_at?: string | null
          endpoint?: string | null
          error_message?: string | null
          id?: string
          model: string
          prompt_tokens?: number | null
          provider?: string | null
          status?: string | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Update: {
          completion_tokens?: number | null
          cost_cents?: number | null
          created_at?: string | null
          endpoint?: string | null
          error_message?: string | null
          id?: string
          model?: string
          prompt_tokens?: number | null
          provider?: string | null
          status?: string | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      pf_brain_anomalies: {
        Row: {
          anomaly_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          resolved: boolean | null
          severity: string
        }
        Insert: {
          anomaly_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          severity: string
        }
        Update: {
          anomaly_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          severity?: string
        }
        Relationships: []
      }
      pf_brain_behavioral_patterns: {
        Row: {
          created_at: string | null
          frequency: number | null
          id: string
          metadata: Json | null
          pattern_data: Json | null
          pattern_name: string
        }
        Insert: {
          created_at?: string | null
          frequency?: number | null
          id?: string
          metadata?: Json | null
          pattern_data?: Json | null
          pattern_name: string
        }
        Update: {
          created_at?: string | null
          frequency?: number | null
          id?: string
          metadata?: Json | null
          pattern_data?: Json | null
          pattern_name?: string
        }
        Relationships: []
      }
      pf_brain_ml_models: {
        Row: {
          accuracy: number | null
          created_at: string | null
          id: string
          metadata: Json | null
          model_name: string
          model_type: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          accuracy?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model_name: string
          model_type: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          accuracy?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model_name?: string
          model_type?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pf_brain_ml_predictions: {
        Row: {
          accuracy: number | null
          created_at: string | null
          id: string
          metadata: Json | null
          model_id: string | null
          prediction_data: Json | null
        }
        Insert: {
          accuracy?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model_id?: string | null
          prediction_data?: Json | null
        }
        Update: {
          accuracy?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model_id?: string | null
          prediction_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "pf_brain_ml_predictions_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "pf_brain_ml_models"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_clarity_admin_stats: {
        Row: {
          active_subscriptions: number
          avg_compliance_score: number | null
          created_at: string
          date: string
          id: string
          revenue_usd: number
          total_scans: number
          total_sites: number
          total_users: number
        }
        Insert: {
          active_subscriptions?: number
          avg_compliance_score?: number | null
          created_at?: string
          date?: string
          id?: string
          revenue_usd?: number
          total_scans?: number
          total_sites?: number
          total_users?: number
        }
        Update: {
          active_subscriptions?: number
          avg_compliance_score?: number | null
          created_at?: string
          date?: string
          id?: string
          revenue_usd?: number
          total_scans?: number
          total_sites?: number
          total_users?: number
        }
        Relationships: []
      }
      pf_clarity_agent_config: {
        Row: {
          auto_fix_enabled: boolean | null
          config_version: string | null
          custom_rules: Json | null
          id: string
          report_endpoint: string | null
          scan_on_load: boolean | null
          site_id: string
          updated_at: string | null
          visual_indicators: boolean | null
        }
        Insert: {
          auto_fix_enabled?: boolean | null
          config_version?: string | null
          custom_rules?: Json | null
          id?: string
          report_endpoint?: string | null
          scan_on_load?: boolean | null
          site_id: string
          updated_at?: string | null
          visual_indicators?: boolean | null
        }
        Update: {
          auto_fix_enabled?: boolean | null
          config_version?: string | null
          custom_rules?: Json | null
          id?: string
          report_endpoint?: string | null
          scan_on_load?: boolean | null
          site_id?: string
          updated_at?: string | null
          visual_indicators?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "pf_clarity_agent_config_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "pf_clarity_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_clarity_api_keys: {
        Row: {
          api_key_hash: string
          created_at: string | null
          id: string
          key_name: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          api_key_hash: string
          created_at?: string | null
          id?: string
          key_name: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          api_key_hash?: string
          created_at?: string | null
          id?: string
          key_name?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      pf_clarity_api_usage: {
        Row: {
          api_key_id: string
          endpoint: string
          id: string
          method: string
          response_time_ms: number | null
          status_code: number | null
          timestamp: string
        }
        Insert: {
          api_key_id: string
          endpoint: string
          id?: string
          method: string
          response_time_ms?: number | null
          status_code?: number | null
          timestamp?: string
        }
        Update: {
          api_key_id?: string
          endpoint?: string
          id?: string
          method?: string
          response_time_ms?: number | null
          status_code?: number | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "pf_clarity_api_usage_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "pf_clarity_api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_clarity_certifications: {
        Row: {
          audit_trail: Json | null
          badge_code: string
          certificate_url: string | null
          certification_type: string
          expires_at: string | null
          id: string
          issued_at: string
          metadata: Json | null
          score_at_certification: number
          site_id: string
          status: string
        }
        Insert: {
          audit_trail?: Json | null
          badge_code: string
          certificate_url?: string | null
          certification_type: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          metadata?: Json | null
          score_at_certification: number
          site_id: string
          status: string
        }
        Update: {
          audit_trail?: Json | null
          badge_code?: string
          certificate_url?: string | null
          certification_type?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          metadata?: Json | null
          score_at_certification?: number
          site_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pf_clarity_certifications_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "pf_clarity_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_clarity_clients: {
        Row: {
          client_company: string | null
          client_email: string
          client_name: string
          created_at: string
          id: string
          is_active: boolean | null
          metadata: Json | null
          reseller_id: string
          scan_quota_monthly: number
          site_quota: number
        }
        Insert: {
          client_company?: string | null
          client_email: string
          client_name: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          reseller_id: string
          scan_quota_monthly?: number
          site_quota?: number
        }
        Update: {
          client_company?: string | null
          client_email?: string
          client_name?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          reseller_id?: string
          scan_quota_monthly?: number
          site_quota?: number
        }
        Relationships: []
      }
      pf_clarity_compliance_history: {
        Row: {
          compliance_score: number
          critical_issues: number
          id: string
          info_issues: number
          issues_count: number
          recorded_at: string
          scan_id: string | null
          site_id: string
          warning_issues: number
          wcag_level: string
        }
        Insert: {
          compliance_score: number
          critical_issues?: number
          id?: string
          info_issues?: number
          issues_count?: number
          recorded_at?: string
          scan_id?: string | null
          site_id: string
          warning_issues?: number
          wcag_level?: string
        }
        Update: {
          compliance_score?: number
          critical_issues?: number
          id?: string
          info_issues?: number
          issues_count?: number
          recorded_at?: string
          scan_id?: string | null
          site_id?: string
          warning_issues?: number
          wcag_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "pf_clarity_compliance_history_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "pf_clarity_scans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pf_clarity_compliance_history_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "pf_clarity_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_clarity_email_follows: {
        Row: {
          compliance_score: number | null
          fixable_issues: number | null
          id: string
          metadata: Json | null
          scan_id: string | null
          sent_at: string
          sent_date: string
          sent_type: string
          site_url: string
          user_email: string
        }
        Insert: {
          compliance_score?: number | null
          fixable_issues?: number | null
          id?: string
          metadata?: Json | null
          scan_id?: string | null
          sent_at?: string
          sent_date?: string
          sent_type: string
          site_url: string
          user_email: string
        }
        Update: {
          compliance_score?: number | null
          fixable_issues?: number | null
          id?: string
          metadata?: Json | null
          scan_id?: string | null
          sent_at?: string
          sent_date?: string
          sent_type?: string
          site_url?: string
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "pf_clarity_email_follows_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "accessibility_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_clarity_fix_suggestions: {
        Row: {
          applied: boolean | null
          applied_at: string | null
          applied_by: string | null
          auto_applicable: boolean | null
          confidence_score: number | null
          created_at: string
          explanation: string
          fix_type: string
          id: string
          issue_id: string
          metadata: Json | null
          suggested_code: string | null
        }
        Insert: {
          applied?: boolean | null
          applied_at?: string | null
          applied_by?: string | null
          auto_applicable?: boolean | null
          confidence_score?: number | null
          created_at?: string
          explanation: string
          fix_type: string
          id?: string
          issue_id: string
          metadata?: Json | null
          suggested_code?: string | null
        }
        Update: {
          applied?: boolean | null
          applied_at?: string | null
          applied_by?: string | null
          auto_applicable?: boolean | null
          confidence_score?: number | null
          created_at?: string
          explanation?: string
          fix_type?: string
          id?: string
          issue_id?: string
          metadata?: Json | null
          suggested_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pf_clarity_fix_suggestions_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "pf_clarity_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_clarity_fixes: {
        Row: {
          applied_at: string | null
          created_at: string | null
          fix_code: string | null
          fix_description: string | null
          fix_type: string
          id: string
          issue_id: string
          reverted_at: string | null
          status: string | null
        }
        Insert: {
          applied_at?: string | null
          created_at?: string | null
          fix_code?: string | null
          fix_description?: string | null
          fix_type: string
          id?: string
          issue_id: string
          reverted_at?: string | null
          status?: string | null
        }
        Update: {
          applied_at?: string | null
          created_at?: string | null
          fix_code?: string | null
          fix_description?: string | null
          fix_type?: string
          id?: string
          issue_id?: string
          reverted_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pf_clarity_fixes_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "pf_clarity_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_clarity_issue_priority: {
        Row: {
          ai_priority_score: number
          business_impact: string | null
          calculated_at: string
          dependencies: string[] | null
          estimated_time_minutes: number | null
          fix_complexity: string | null
          id: string
          issue_id: string
          metadata: Json | null
          reasoning: string | null
          recommended_order: number | null
        }
        Insert: {
          ai_priority_score: number
          business_impact?: string | null
          calculated_at?: string
          dependencies?: string[] | null
          estimated_time_minutes?: number | null
          fix_complexity?: string | null
          id?: string
          issue_id: string
          metadata?: Json | null
          reasoning?: string | null
          recommended_order?: number | null
        }
        Update: {
          ai_priority_score?: number
          business_impact?: string | null
          calculated_at?: string
          dependencies?: string[] | null
          estimated_time_minutes?: number | null
          fix_complexity?: string | null
          id?: string
          issue_id?: string
          metadata?: Json | null
          reasoning?: string | null
          recommended_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pf_clarity_issue_priority_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "pf_clarity_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_clarity_issues: {
        Row: {
          auto_fix_attempted: boolean | null
          auto_fix_successful: boolean | null
          context: Json | null
          created_at: string | null
          element_html: string | null
          element_selector: string | null
          id: string
          issue_description: string
          issue_type: string
          scan_id: string
          severity: string
          status: string | null
          wcag_criterion: string
          wcag_level: string
        }
        Insert: {
          auto_fix_attempted?: boolean | null
          auto_fix_successful?: boolean | null
          context?: Json | null
          created_at?: string | null
          element_html?: string | null
          element_selector?: string | null
          id?: string
          issue_description: string
          issue_type: string
          scan_id: string
          severity: string
          status?: string | null
          wcag_criterion: string
          wcag_level: string
        }
        Update: {
          auto_fix_attempted?: boolean | null
          auto_fix_successful?: boolean | null
          context?: Json | null
          created_at?: string | null
          element_html?: string | null
          element_selector?: string | null
          id?: string
          issue_description?: string
          issue_type?: string
          scan_id?: string
          severity?: string
          status?: string | null
          wcag_criterion?: string
          wcag_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "pf_clarity_issues_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "pf_clarity_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_clarity_notification_log: {
        Row: {
          error_message: string | null
          id: string
          notification_type: string
          scan_id: string | null
          sent_at: string
          status: string
          user_id: string
        }
        Insert: {
          error_message?: string | null
          id?: string
          notification_type: string
          scan_id?: string | null
          sent_at?: string
          status?: string
          user_id: string
        }
        Update: {
          error_message?: string | null
          id?: string
          notification_type?: string
          scan_id?: string | null
          sent_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pf_clarity_notification_log_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "pf_clarity_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_clarity_notifications: {
        Row: {
          auto_fix_applied: boolean | null
          created_at: string
          critical_issues: boolean | null
          email: string
          id: string
          scan_complete: boolean | null
          updated_at: string
          user_id: string
          weekly_summary: boolean | null
        }
        Insert: {
          auto_fix_applied?: boolean | null
          created_at?: string
          critical_issues?: boolean | null
          email: string
          id?: string
          scan_complete?: boolean | null
          updated_at?: string
          user_id: string
          weekly_summary?: boolean | null
        }
        Update: {
          auto_fix_applied?: boolean | null
          created_at?: string
          critical_issues?: boolean | null
          email?: string
          id?: string
          scan_complete?: boolean | null
          updated_at?: string
          user_id?: string
          weekly_summary?: boolean | null
        }
        Relationships: []
      }
      pf_clarity_portfolio_stats: {
        Row: {
          avg_compliance_score: number | null
          calculated_at: string
          critical_issues: number
          id: string
          metadata: Json | null
          period_end: string
          period_start: string
          sites_above_threshold: number
          total_issues: number
          total_sites: number
          user_id: string
        }
        Insert: {
          avg_compliance_score?: number | null
          calculated_at?: string
          critical_issues?: number
          id?: string
          metadata?: Json | null
          period_end: string
          period_start: string
          sites_above_threshold?: number
          total_issues?: number
          total_sites?: number
          user_id: string
        }
        Update: {
          avg_compliance_score?: number | null
          calculated_at?: string
          critical_issues?: number
          id?: string
          metadata?: Json | null
          period_end?: string
          period_start?: string
          sites_above_threshold?: number
          total_issues?: number
          total_sites?: number
          user_id?: string
        }
        Relationships: []
      }
      pf_clarity_reports: {
        Row: {
          expires_at: string | null
          file_size_bytes: number | null
          file_url: string | null
          generated_at: string
          generated_by: string
          id: string
          metadata: Json | null
          report_type: string
          scan_id: string | null
          site_id: string
        }
        Insert: {
          expires_at?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          generated_at?: string
          generated_by: string
          id?: string
          metadata?: Json | null
          report_type: string
          scan_id?: string | null
          site_id: string
        }
        Update: {
          expires_at?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          generated_at?: string
          generated_by?: string
          id?: string
          metadata?: Json | null
          report_type?: string
          scan_id?: string | null
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pf_clarity_reports_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "pf_clarity_scans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pf_clarity_reports_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "pf_clarity_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_clarity_scan_queue: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          priority: number
          scheduled_for: string
          scheduled_scan_id: string | null
          site_id: string
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          priority?: number
          scheduled_for?: string
          scheduled_scan_id?: string | null
          site_id: string
          started_at?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          priority?: number
          scheduled_for?: string
          scheduled_scan_id?: string | null
          site_id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pf_clarity_scan_queue_scheduled_scan_id_fkey"
            columns: ["scheduled_scan_id"]
            isOneToOne: false
            referencedRelation: "pf_clarity_scheduled_scans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pf_clarity_scan_queue_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "pf_clarity_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_clarity_scans: {
        Row: {
          completed_at: string | null
          compliance_score: number | null
          created_at: string | null
          id: string
          issues_auto_fixed: number | null
          issues_critical: number | null
          issues_found: number | null
          issues_pending_review: number | null
          issues_warning: number | null
          scan_data: Json | null
          scan_url: string
          site_id: string
          started_at: string | null
          status: string | null
          total_checks: number | null
          wcag_level: string | null
        }
        Insert: {
          completed_at?: string | null
          compliance_score?: number | null
          created_at?: string | null
          id?: string
          issues_auto_fixed?: number | null
          issues_critical?: number | null
          issues_found?: number | null
          issues_pending_review?: number | null
          issues_warning?: number | null
          scan_data?: Json | null
          scan_url: string
          site_id: string
          started_at?: string | null
          status?: string | null
          total_checks?: number | null
          wcag_level?: string | null
        }
        Update: {
          completed_at?: string | null
          compliance_score?: number | null
          created_at?: string | null
          id?: string
          issues_auto_fixed?: number | null
          issues_critical?: number | null
          issues_found?: number | null
          issues_pending_review?: number | null
          issues_warning?: number | null
          scan_data?: Json | null
          scan_url?: string
          site_id?: string
          started_at?: string | null
          status?: string | null
          total_checks?: number | null
          wcag_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pf_clarity_scans_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "pf_clarity_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_clarity_scheduled_scans: {
        Row: {
          created_at: string
          frequency: string
          id: string
          is_active: boolean
          last_run_at: string | null
          next_run_at: string | null
          notification_enabled: boolean
          schedule_date: number | null
          schedule_day: number | null
          schedule_time: string
          site_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          frequency: string
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          notification_enabled?: boolean
          schedule_date?: number | null
          schedule_day?: number | null
          schedule_time?: string
          site_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          frequency?: string
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          notification_enabled?: boolean
          schedule_date?: number | null
          schedule_day?: number | null
          schedule_time?: string
          site_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pf_clarity_scheduled_scans_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "pf_clarity_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_clarity_sites: {
        Row: {
          agent_enabled: boolean | null
          auto_fix_enabled: boolean | null
          created_at: string | null
          id: string
          install_key: string | null
          monthly_scan_limit: number | null
          monthly_scans_used: number | null
          site_name: string | null
          site_url: string
          subscription_tier: string | null
          team_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_enabled?: boolean | null
          auto_fix_enabled?: boolean | null
          created_at?: string | null
          id?: string
          install_key?: string | null
          monthly_scan_limit?: number | null
          monthly_scans_used?: number | null
          site_name?: string | null
          site_url: string
          subscription_tier?: string | null
          team_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_enabled?: boolean | null
          auto_fix_enabled?: boolean | null
          created_at?: string | null
          id?: string
          install_key?: string | null
          monthly_scan_limit?: number | null
          monthly_scans_used?: number | null
          site_name?: string | null
          site_url?: string
          subscription_tier?: string | null
          team_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pf_clarity_sites_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "pf_clarity_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_clarity_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_tier: string
          site_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_tier?: string
          site_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_tier?: string
          site_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pf_clarity_subscriptions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "pf_clarity_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_clarity_team_invites: {
        Row: {
          created_at: string
          created_by: string
          email: string
          expires_at: string
          id: string
          invite_token: string
          role: string
          team_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          email: string
          expires_at?: string
          id?: string
          invite_token?: string
          role?: string
          team_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          email?: string
          expires_at?: string
          id?: string
          invite_token?: string
          role?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pf_clarity_team_invites_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "pf_clarity_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_clarity_team_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pf_clarity_team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "pf_clarity_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_clarity_teams: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          plan_tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          plan_tier?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          plan_tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      pf_clarity_webhooks: {
        Row: {
          created_at: string
          events: string[]
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          secret: string
          site_id: string | null
          updated_at: string
          user_id: string
          webhook_url: string
        }
        Insert: {
          created_at?: string
          events: string[]
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          secret: string
          site_id?: string | null
          updated_at?: string
          user_id: string
          webhook_url: string
        }
        Update: {
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          secret?: string
          site_id?: string | null
          updated_at?: string
          user_id?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "pf_clarity_webhooks_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "pf_clarity_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_clarity_whitelabel: {
        Row: {
          brand_name: string
          created_at: string
          custom_domain: string | null
          email_from_address: string | null
          email_from_name: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          plan_tier: string
          primary_color: string | null
          report_footer_text: string | null
          secondary_color: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_name: string
          created_at?: string
          custom_domain?: string | null
          email_from_address?: string | null
          email_from_name?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          plan_tier: string
          primary_color?: string | null
          report_footer_text?: string | null
          secondary_color?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_name?: string
          created_at?: string
          custom_domain?: string | null
          email_from_address?: string | null
          email_from_name?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          plan_tier?: string
          primary_color?: string | null
          report_footer_text?: string | null
          secondary_color?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pf_clarity_widget_analytics: {
        Row: {
          contrast_toggles: number | null
          date: string
          font_size_changes: number | null
          id: string
          keyboard_nav_uses: number | null
          total_activations: number | null
          tts_uses: number | null
          unique_users: number | null
          widget_id: string
        }
        Insert: {
          contrast_toggles?: number | null
          date?: string
          font_size_changes?: number | null
          id?: string
          keyboard_nav_uses?: number | null
          total_activations?: number | null
          tts_uses?: number | null
          unique_users?: number | null
          widget_id: string
        }
        Update: {
          contrast_toggles?: number | null
          date?: string
          font_size_changes?: number | null
          id?: string
          keyboard_nav_uses?: number | null
          total_activations?: number | null
          tts_uses?: number | null
          unique_users?: number | null
          widget_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pf_clarity_widget_analytics_widget_id_fkey"
            columns: ["widget_id"]
            isOneToOne: false
            referencedRelation: "pf_clarity_widgets"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_clarity_widgets: {
        Row: {
          created_at: string
          features: Json | null
          id: string
          is_active: boolean | null
          position: string | null
          site_id: string
          theme: string | null
          updated_at: string
          widget_key: string
        }
        Insert: {
          created_at?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          position?: string | null
          site_id: string
          theme?: string | null
          updated_at?: string
          widget_key: string
        }
        Update: {
          created_at?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          position?: string | null
          site_id?: string
          theme?: string | null
          updated_at?: string
          widget_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "pf_clarity_widgets_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "pf_clarity_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_clarity_wp_connections: {
        Row: {
          api_key: string
          api_secret_hash: string
          auto_sync_enabled: boolean | null
          created_at: string
          error_message: string | null
          id: string
          last_sync_at: string | null
          plugin_version: string | null
          site_id: string
          sync_status: string | null
          updated_at: string
          wp_site_url: string
        }
        Insert: {
          api_key: string
          api_secret_hash: string
          auto_sync_enabled?: boolean | null
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          plugin_version?: string | null
          site_id: string
          sync_status?: string | null
          updated_at?: string
          wp_site_url: string
        }
        Update: {
          api_key?: string
          api_secret_hash?: string
          auto_sync_enabled?: boolean | null
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          plugin_version?: string | null
          site_id?: string
          sync_status?: string | null
          updated_at?: string
          wp_site_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "pf_clarity_wp_connections_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "pf_clarity_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_cost_logs: {
        Row: {
          cost_cents: number | null
          created_at: string | null
          id: string
          metadata: Json | null
          operation_type: string
          provider: string
          tokens_used: number | null
        }
        Insert: {
          cost_cents?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          operation_type: string
          provider: string
          tokens_used?: number | null
        }
        Update: {
          cost_cents?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          operation_type?: string
          provider?: string
          tokens_used?: number | null
        }
        Relationships: []
      }
      pf_deployments: {
        Row: {
          commit_hash: string
          created_at: string
          deployed_at: string
          deployed_by: string | null
          environment: string
          id: string
          status: string
        }
        Insert: {
          commit_hash: string
          created_at?: string
          deployed_at?: string
          deployed_by?: string | null
          environment: string
          id?: string
          status: string
        }
        Update: {
          commit_hash?: string
          created_at?: string
          deployed_at?: string
          deployed_by?: string | null
          environment?: string
          id?: string
          status?: string
        }
        Relationships: []
      }
      pf_global_threat_feed: {
        Row: {
          description: string | null
          detected_at: string | null
          id: string
          metadata: Json | null
          mitigation_status: string | null
          severity: string
          threat_category: string
          threat_type: string
        }
        Insert: {
          description?: string | null
          detected_at?: string | null
          id?: string
          metadata?: Json | null
          mitigation_status?: string | null
          severity: string
          threat_category: string
          threat_type: string
        }
        Update: {
          description?: string | null
          detected_at?: string | null
          id?: string
          metadata?: Json | null
          mitigation_status?: string | null
          severity?: string
          threat_category?: string
          threat_type?: string
        }
        Relationships: []
      }
      pf_image_outputs: {
        Row: {
          api: string
          cost_cents: number | null
          created_at: string | null
          id: string
          metadata: Json | null
          project_id: string | null
          prompt: string
          provider: string
          resolution: string | null
          style: string | null
          url: string
        }
        Insert: {
          api: string
          cost_cents?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string | null
          prompt: string
          provider: string
          resolution?: string | null
          style?: string | null
          url: string
        }
        Update: {
          api?: string
          cost_cents?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string | null
          prompt?: string
          provider?: string
          resolution?: string | null
          style?: string | null
          url?: string
        }
        Relationships: []
      }
      pf_insight_logs: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          insight_type: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          insight_type: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          insight_type?: string
        }
        Relationships: []
      }
      pf_media_cache: {
        Row: {
          content: string | null
          created_at: string | null
          hash: string
          hit_count: number | null
          id: string
          metadata: Json | null
          project_ref: string | null
          ttl_expiration: string
          type: string
          url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          hash: string
          hit_count?: number | null
          id?: string
          metadata?: Json | null
          project_ref?: string | null
          ttl_expiration: string
          type: string
          url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          hash?: string
          hit_count?: number | null
          id?: string
          metadata?: Json | null
          project_ref?: string | null
          ttl_expiration?: string
          type?: string
          url?: string | null
        }
        Relationships: []
      }
      pf_merger_fusions: {
        Row: {
          actual_cost: number | null
          blueprint_ref: string | null
          created_at: string | null
          estimated_cost: number | null
          fusion_output: Json | null
          id: string
          intent_id: string | null
          model_used: string | null
          status: string | null
        }
        Insert: {
          actual_cost?: number | null
          blueprint_ref?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          fusion_output?: Json | null
          id?: string
          intent_id?: string | null
          model_used?: string | null
          status?: string | null
        }
        Update: {
          actual_cost?: number | null
          blueprint_ref?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          fusion_output?: Json | null
          id?: string
          intent_id?: string | null
          model_used?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pf_merger_fusions_intent_id_fkey"
            columns: ["intent_id"]
            isOneToOne: false
            referencedRelation: "pf_merger_intents"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_merger_intents: {
        Row: {
          complexity_score: number | null
          created_at: string | null
          id: string
          parsed_requirements: Json | null
          prompt_text: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          complexity_score?: number | null
          created_at?: string | null
          id?: string
          parsed_requirements?: Json | null
          prompt_text: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          complexity_score?: number | null
          created_at?: string | null
          id?: string
          parsed_requirements?: Json | null
          prompt_text?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pf_merger_metrics: {
        Row: {
          api_calls_made: number | null
          build_time_ms: number | null
          component_count: number | null
          created_at: string | null
          id: string
          lines_of_code: number | null
          project_id: string | null
          tokens_used: number | null
        }
        Insert: {
          api_calls_made?: number | null
          build_time_ms?: number | null
          component_count?: number | null
          created_at?: string | null
          id?: string
          lines_of_code?: number | null
          project_id?: string | null
          tokens_used?: number | null
        }
        Update: {
          api_calls_made?: number | null
          build_time_ms?: number | null
          component_count?: number | null
          created_at?: string | null
          id?: string
          lines_of_code?: number | null
          project_id?: string | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pf_merger_metrics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "pf_mvp_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_mvp_projects: {
        Row: {
          build_logs: Json | null
          build_status: string | null
          completed_at: string | null
          created_at: string | null
          current_phase: string | null
          deploy_url: string | null
          deployed_at: string | null
          error_message: string | null
          feedback_score: number | null
          fusion_id: string | null
          github_repo: string | null
          id: string
          preview_url: string | null
          progress_percentage: number | null
          project_name: string
          user_id: string | null
        }
        Insert: {
          build_logs?: Json | null
          build_status?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_phase?: string | null
          deploy_url?: string | null
          deployed_at?: string | null
          error_message?: string | null
          feedback_score?: number | null
          fusion_id?: string | null
          github_repo?: string | null
          id?: string
          preview_url?: string | null
          progress_percentage?: number | null
          project_name: string
          user_id?: string | null
        }
        Update: {
          build_logs?: Json | null
          build_status?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_phase?: string | null
          deploy_url?: string | null
          deployed_at?: string | null
          error_message?: string | null
          feedback_score?: number | null
          fusion_id?: string | null
          github_repo?: string | null
          id?: string
          preview_url?: string | null
          progress_percentage?: number | null
          project_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pf_mvp_projects_fusion_id_fkey"
            columns: ["fusion_id"]
            isOneToOne: false
            referencedRelation: "pf_merger_fusions"
            referencedColumns: ["id"]
          },
        ]
      }
      pf_security_events: {
        Row: {
          action_taken: string
          detected_at: string
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          severity: string
          user_agent: string | null
        }
        Insert: {
          action_taken: string
          detected_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          severity: string
          user_agent?: string | null
        }
        Update: {
          action_taken?: string
          detected_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          severity?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      pf_system_config: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      pf_text_outputs: {
        Row: {
          cost_cents: number | null
          created_at: string | null
          id: string
          input_prompt: string
          model: string
          output_text: string
          project_id: string | null
          provider: string
          tokens_used: number | null
        }
        Insert: {
          cost_cents?: number | null
          created_at?: string | null
          id?: string
          input_prompt: string
          model: string
          output_text: string
          project_id?: string | null
          provider: string
          tokens_used?: number | null
        }
        Update: {
          cost_cents?: number | null
          created_at?: string | null
          id?: string
          input_prompt?: string
          model?: string
          output_text?: string
          project_id?: string | null
          provider?: string
          tokens_used?: number | null
        }
        Relationships: []
      }
      pf_threat_statistics: {
        Row: {
          active_threats: number | null
          avg_severity: number | null
          blocked_threats: number | null
          id: string
          metadata: Json | null
          resolved_threats: number | null
          stat_date: string | null
          total_threats: number | null
        }
        Insert: {
          active_threats?: number | null
          avg_severity?: number | null
          blocked_threats?: number | null
          id?: string
          metadata?: Json | null
          resolved_threats?: number | null
          stat_date?: string | null
          total_threats?: number | null
        }
        Update: {
          active_threats?: number | null
          avg_severity?: number | null
          blocked_threats?: number | null
          id?: string
          metadata?: Json | null
          resolved_threats?: number | null
          stat_date?: string | null
          total_threats?: number | null
        }
        Relationships: []
      }
      pf_video_outputs: {
        Row: {
          api: string
          cost_cents: number | null
          created_at: string | null
          duration: number | null
          format: string | null
          id: string
          metadata: Json | null
          project_id: string | null
          prompt: string
          provider: string
          url: string
        }
        Insert: {
          api: string
          cost_cents?: number | null
          created_at?: string | null
          duration?: number | null
          format?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string | null
          prompt: string
          provider: string
          url: string
        }
        Update: {
          api?: string
          cost_cents?: number | null
          created_at?: string | null
          duration?: number | null
          format?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string | null
          prompt?: string
          provider?: string
          url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      resilience_ledger: {
        Row: {
          auto_fix_applied: boolean | null
          created_at: string | null
          event_type: string
          fix_confidence: number | null
          id: string
          metadata: Json | null
          recovery_action: string | null
          success: boolean | null
        }
        Insert: {
          auto_fix_applied?: boolean | null
          created_at?: string | null
          event_type: string
          fix_confidence?: number | null
          id?: string
          metadata?: Json | null
          recovery_action?: string | null
          success?: boolean | null
        }
        Update: {
          auto_fix_applied?: boolean | null
          created_at?: string | null
          event_type?: string
          fix_confidence?: number | null
          id?: string
          metadata?: Json | null
          recovery_action?: string | null
          success?: boolean | null
        }
        Relationships: []
      }
      ripple_campaigns: {
        Row: {
          campaign_name: string
          created_at: string | null
          id: string
          metrics: Json | null
          status: string | null
          target_audience: Json | null
          updated_at: string | null
        }
        Insert: {
          campaign_name: string
          created_at?: string | null
          id?: string
          metrics?: Json | null
          status?: string | null
          target_audience?: Json | null
          updated_at?: string | null
        }
        Update: {
          campaign_name?: string
          created_at?: string | null
          id?: string
          metrics?: Json | null
          status?: string | null
          target_audience?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          client_ip: string | null
          created_at: string
          details: Json | null
          event_type: string
          function_name: string
          id: string
          risk_score: number | null
          user_agent: string | null
        }
        Insert: {
          client_ip?: string | null
          created_at?: string
          details?: Json | null
          event_type: string
          function_name: string
          id?: string
          risk_score?: number | null
          user_agent?: string | null
        }
        Update: {
          client_ip?: string | null
          created_at?: string
          details?: Json | null
          event_type?: string
          function_name?: string
          id?: string
          risk_score?: number | null
          user_agent?: string | null
        }
        Relationships: []
      }
      studio_applies: {
        Row: {
          artifact_url: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          mode: string
          pr_url: string | null
          preview_id: string
          status: string | null
          wp_task_id: string | null
        }
        Insert: {
          artifact_url?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          mode: string
          pr_url?: string | null
          preview_id: string
          status?: string | null
          wp_task_id?: string | null
        }
        Update: {
          artifact_url?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          mode?: string
          pr_url?: string | null
          preview_id?: string
          status?: string | null
          wp_task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "studio_applies_preview_id_fkey"
            columns: ["preview_id"]
            isOneToOne: false
            referencedRelation: "studio_previews"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_audit: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string | null
          details: Json | null
          entity: string
          entity_id: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string | null
          details?: Json | null
          entity: string
          entity_id: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string | null
          details?: Json | null
          entity?: string
          entity_id?: string
          id?: string
        }
        Relationships: []
      }
      studio_connections: {
        Row: {
          connected_at: string | null
          created_at: string | null
          framework: string | null
          id: string
          metadata: Json | null
          project_name: string
          repository_url: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          connected_at?: string | null
          created_at?: string | null
          framework?: string | null
          id?: string
          metadata?: Json | null
          project_name: string
          repository_url?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          connected_at?: string | null
          created_at?: string | null
          framework?: string | null
          id?: string
          metadata?: Json | null
          project_name?: string
          repository_url?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      studio_previews: {
        Row: {
          changes_applied: number | null
          completed_at: string | null
          created_at: string | null
          estimated_time: string | null
          id: string
          metadata: Json | null
          preview_url: string | null
          scan_id: string
          status: string | null
        }
        Insert: {
          changes_applied?: number | null
          completed_at?: string | null
          created_at?: string | null
          estimated_time?: string | null
          id?: string
          metadata?: Json | null
          preview_url?: string | null
          scan_id: string
          status?: string | null
        }
        Update: {
          changes_applied?: number | null
          completed_at?: string | null
          created_at?: string | null
          estimated_time?: string | null
          id?: string
          metadata?: Json | null
          preview_url?: string | null
          scan_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "studio_previews_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "studio_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_scans: {
        Row: {
          connection_id: string
          created_at: string | null
          dependencies: Json | null
          framework: string | null
          id: string
          issues: Json | null
          project_path: string
          recommendations: Json | null
          scanned_at: string | null
          structure: Json | null
        }
        Insert: {
          connection_id: string
          created_at?: string | null
          dependencies?: Json | null
          framework?: string | null
          id?: string
          issues?: Json | null
          project_path: string
          recommendations?: Json | null
          scanned_at?: string | null
          structure?: Json | null
        }
        Update: {
          connection_id?: string
          created_at?: string | null
          dependencies?: Json | null
          framework?: string | null
          id?: string
          issues?: Json | null
          project_path?: string
          recommendations?: Json | null
          scanned_at?: string | null
          structure?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "studio_scans_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "studio_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_verifications: {
        Row: {
          apply_id: string
          created_at: string | null
          defense: Json | null
          id: string
          lighthouse: Json | null
          overall_score: number | null
          regressions: Json | null
          vitals: Json | null
          wcag: Json | null
        }
        Insert: {
          apply_id: string
          created_at?: string | null
          defense?: Json | null
          id?: string
          lighthouse?: Json | null
          overall_score?: number | null
          regressions?: Json | null
          vitals?: Json | null
          wcag?: Json | null
        }
        Update: {
          apply_id?: string
          created_at?: string | null
          defense?: Json | null
          id?: string
          lighthouse?: Json | null
          overall_score?: number | null
          regressions?: Json | null
          vitals?: Json | null
          wcag?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "studio_verifications_apply_id_fkey"
            columns: ["apply_id"]
            isOneToOne: false
            referencedRelation: "studio_applies"
            referencedColumns: ["id"]
          },
        ]
      }
      substrate_agent_events: {
        Row: {
          agent_id: string | null
          created_at: string | null
          duration_ms: number | null
          event_type: string
          id: string
          mesh_id: string
          payload: Json | null
          source_agent: string | null
          target_agent: string | null
          tokens_used: number | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          duration_ms?: number | null
          event_type: string
          id?: string
          mesh_id: string
          payload?: Json | null
          source_agent?: string | null
          target_agent?: string | null
          tokens_used?: number | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          duration_ms?: number | null
          event_type?: string
          id?: string
          mesh_id?: string
          payload?: Json | null
          source_agent?: string | null
          target_agent?: string | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "substrate_agent_events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "substrate_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      substrate_agents: {
        Row: {
          agent_name: string
          agent_type: string
          app_id: string
          capabilities: Json | null
          constraints: Json | null
          created_at: string | null
          developer_id: string
          id: string
          is_active: boolean | null
          metadata: Json | null
          model_preference: string | null
          system_prompt: string | null
          updated_at: string | null
        }
        Insert: {
          agent_name: string
          agent_type: string
          app_id: string
          capabilities?: Json | null
          constraints?: Json | null
          created_at?: string | null
          developer_id: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          model_preference?: string | null
          system_prompt?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_name?: string
          agent_type?: string
          app_id?: string
          capabilities?: Json | null
          constraints?: Json | null
          created_at?: string | null
          developer_id?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          model_preference?: string | null
          system_prompt?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      substrate_apps: {
        Row: {
          app_id: string
          app_name: string
          created_at: string | null
          description: string | null
          developer_id: string
          id: string
          is_active: boolean | null
          monthly_budget_usd: number | null
          settings: Json | null
          tier: string | null
          updated_at: string | null
        }
        Insert: {
          app_id: string
          app_name: string
          created_at?: string | null
          description?: string | null
          developer_id: string
          id?: string
          is_active?: boolean | null
          monthly_budget_usd?: number | null
          settings?: Json | null
          tier?: string | null
          updated_at?: string | null
        }
        Update: {
          app_id?: string
          app_name?: string
          created_at?: string | null
          description?: string | null
          developer_id?: string
          id?: string
          is_active?: boolean | null
          monthly_budget_usd?: number | null
          settings?: Json | null
          tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      substrate_brain_improvements: {
        Row: {
          adoption_count: number | null
          category: string
          confidence: number | null
          created_at: string | null
          description: string | null
          id: string
          improvement_type: string
          is_active: boolean | null
          payload: Json
          previous_version_id: string | null
          source_count: number | null
          success_rate: number | null
          title: string
          updated_at: string | null
          version: string | null
        }
        Insert: {
          adoption_count?: number | null
          category: string
          confidence?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          improvement_type: string
          is_active?: boolean | null
          payload?: Json
          previous_version_id?: string | null
          source_count?: number | null
          success_rate?: number | null
          title: string
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          adoption_count?: number | null
          category?: string
          confidence?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          improvement_type?: string
          is_active?: boolean | null
          payload?: Json
          previous_version_id?: string | null
          source_count?: number | null
          success_rate?: number | null
          title?: string
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "substrate_brain_improvements_previous_version_id_fkey"
            columns: ["previous_version_id"]
            isOneToOne: false
            referencedRelation: "substrate_brain_improvements"
            referencedColumns: ["id"]
          },
        ]
      }
      substrate_developer_keys: {
        Row: {
          app_id: string
          created_at: string | null
          developer_id: string
          encrypted_key: string
          id: string
          is_active: boolean | null
          key_hint: string | null
          metadata: Json | null
          provider: string
          rate_limit_rpm: number | null
          updated_at: string | null
        }
        Insert: {
          app_id: string
          created_at?: string | null
          developer_id: string
          encrypted_key: string
          id?: string
          is_active?: boolean | null
          key_hint?: string | null
          metadata?: Json | null
          provider: string
          rate_limit_rpm?: number | null
          updated_at?: string | null
        }
        Update: {
          app_id?: string
          created_at?: string | null
          developer_id?: string
          encrypted_key?: string
          id?: string
          is_active?: boolean | null
          key_hint?: string | null
          metadata?: Json | null
          provider?: string
          rate_limit_rpm?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      substrate_extensions: {
        Row: {
          config: Json | null
          created_at: string | null
          developer_id: string
          downloads_count: number | null
          extension_name: string
          extension_type: string
          extension_version: string | null
          handler_code: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          metadata: Json | null
          schema_definition: Json | null
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          developer_id: string
          downloads_count?: number | null
          extension_name: string
          extension_type: string
          extension_version?: string | null
          handler_code?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          metadata?: Json | null
          schema_definition?: Json | null
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          developer_id?: string
          downloads_count?: number | null
          extension_name?: string
          extension_type?: string
          extension_version?: string | null
          handler_code?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          metadata?: Json | null
          schema_definition?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      substrate_integrations: {
        Row: {
          app_id: string
          call_count: number | null
          config: Json | null
          created_at: string | null
          credentials_ref: string | null
          developer_id: string
          error_count: number | null
          id: string
          integration_name: string
          integration_type: string
          is_active: boolean | null
          last_called_at: string | null
          updated_at: string | null
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          app_id: string
          call_count?: number | null
          config?: Json | null
          created_at?: string | null
          credentials_ref?: string | null
          developer_id: string
          error_count?: number | null
          id?: string
          integration_name: string
          integration_type: string
          is_active?: boolean | null
          last_called_at?: string | null
          updated_at?: string | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          app_id?: string
          call_count?: number | null
          config?: Json | null
          created_at?: string | null
          credentials_ref?: string | null
          developer_id?: string
          error_count?: number | null
          id?: string
          integration_name?: string
          integration_type?: string
          is_active?: boolean | null
          last_called_at?: string | null
          updated_at?: string | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      substrate_upgrade_config: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      substrate_upgrade_plans: {
        Row: {
          after_health_snapshot: Json | null
          backup_id: string | null
          before_health_snapshot: Json | null
          created_at: string
          diff_summary: Json | null
          estimated_blast_radius: string | null
          id: string
          mode: string
          operator_id: string | null
          operator_notes: string | null
          risk_level: string | null
          scope: string
          status: string
          suggested_patches: Json | null
          updated_at: string | null
        }
        Insert: {
          after_health_snapshot?: Json | null
          backup_id?: string | null
          before_health_snapshot?: Json | null
          created_at?: string
          diff_summary?: Json | null
          estimated_blast_radius?: string | null
          id?: string
          mode?: string
          operator_id?: string | null
          operator_notes?: string | null
          risk_level?: string | null
          scope?: string
          status?: string
          suggested_patches?: Json | null
          updated_at?: string | null
        }
        Update: {
          after_health_snapshot?: Json | null
          backup_id?: string | null
          before_health_snapshot?: Json | null
          created_at?: string
          diff_summary?: Json | null
          estimated_blast_radius?: string | null
          id?: string
          mode?: string
          operator_id?: string | null
          operator_notes?: string | null
          risk_level?: string | null
          scope?: string
          status?: string
          suggested_patches?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      substrate_upgrade_runs: {
        Row: {
          error: string | null
          finished_at: string | null
          id: string
          plan_id: string | null
          post_health_snapshot: Json | null
          result: string | null
          rollback_attempted: boolean | null
          rollback_success: boolean | null
          started_at: string
        }
        Insert: {
          error?: string | null
          finished_at?: string | null
          id?: string
          plan_id?: string | null
          post_health_snapshot?: Json | null
          result?: string | null
          rollback_attempted?: boolean | null
          rollback_success?: boolean | null
          started_at?: string
        }
        Update: {
          error?: string | null
          finished_at?: string | null
          id?: string
          plan_id?: string | null
          post_health_snapshot?: Json | null
          result?: string | null
          rollback_attempted?: boolean | null
          rollback_success?: boolean | null
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "substrate_upgrade_runs_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "substrate_upgrade_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      substrate_usage_meters: {
        Row: {
          app_id: string
          calls_count: number | null
          created_at: string | null
          date: string
          developer_id: string
          errors_count: number | null
          id: string
          latency_avg_ms: number | null
          provider: string
          tokens_input: number | null
          tokens_output: number | null
          updated_at: string | null
        }
        Insert: {
          app_id: string
          calls_count?: number | null
          created_at?: string | null
          date?: string
          developer_id: string
          errors_count?: number | null
          id?: string
          latency_avg_ms?: number | null
          provider: string
          tokens_input?: number | null
          tokens_output?: number | null
          updated_at?: string | null
        }
        Update: {
          app_id?: string
          calls_count?: number | null
          created_at?: string | null
          date?: string
          developer_id?: string
          errors_count?: number | null
          id?: string
          latency_avg_ms?: number | null
          provider?: string
          tokens_input?: number | null
          tokens_output?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_config: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      system_updates: {
        Row: {
          action: string
          applied_by: string
          created_at: string
          id: string
          new_config: Json
          prev_config: Json
          proposal_id: string
          target_system: string
        }
        Insert: {
          action: string
          applied_by: string
          created_at?: string
          id?: string
          new_config: Json
          prev_config: Json
          proposal_id: string
          target_system: string
        }
        Update: {
          action?: string
          applied_by?: string
          created_at?: string
          id?: string
          new_config?: Json
          prev_config?: Json
          proposal_id?: string
          target_system?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          created_at: string | null
          domain: string | null
          id: string
          metadata: Json | null
          monthly_fee: number | null
          name: string
          status: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          id?: string
          metadata?: Json | null
          monthly_fee?: number | null
          name: string
          status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          id?: string
          metadata?: Json | null
          monthly_fee?: number | null
          name?: string
          status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      usage_metrics: {
        Row: {
          calls: number
          id: string
          metadata: Json | null
          provider: string | null
          source: string
          ts: string | null
        }
        Insert: {
          calls?: number
          id?: string
          metadata?: Json | null
          provider?: string | null
          source: string
          ts?: string | null
        }
        Update: {
          calls?: number
          id?: string
          metadata?: Json | null
          provider?: string | null
          source?: string
          ts?: string | null
        }
        Relationships: []
      }
      user_limits: {
        Row: {
          created_at: string | null
          id: string
          modernizations_limit: number | null
          modernizations_used: number | null
          reset_at: string | null
          tier: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          modernizations_limit?: number | null
          modernizations_used?: number | null
          reset_at?: string | null
          tier?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          modernizations_limit?: number | null
          modernizations_used?: number | null
          reset_at?: string | null
          tier?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      v_user_summary: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          plan_name: string | null
          status: string | null
          total_usage: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          plan_name?: string | null
          status?: string | null
          total_usage?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          plan_name?: string | null
          status?: string | null
          total_usage?: number | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_next_scan_run: {
        Args: {
          p_frequency: string
          p_from_time?: string
          p_schedule_date: number
          p_schedule_day: number
          p_schedule_time: string
        }
        Returns: string
      }
      check_clarity_rate_limit: {
        Args: { p_api_key_hash: string }
        Returns: boolean
      }
      check_modernizer_quota: { Args: { p_user_id: string }; Returns: boolean }
      cleanup_expired_cache: { Args: never; Returns: undefined }
      cleanup_old_daily_state: { Args: never; Returns: undefined }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      generate_bot_sniper_api_key: {
        Args: { p_key_name: string; p_user_id: string }
        Returns: string
      }
      generate_clarity_api_key: {
        Args: { p_key_name: string; p_rate_limit?: number; p_user_id: string }
        Returns: Json
      }
      has_role:
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
      has_role_text: {
        Args: { _role: string; _user_id: string }
        Returns: boolean
      }
      increment_agent_telemetry: {
        Args: {
          p_agency_id: string
          p_execution_time_ms?: number
          p_field: string
          p_increment?: number
          p_member_id: string
          p_skill_usage?: Json
        }
        Returns: undefined
      }
      reset_daily_quotas: { Args: never; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      update_ip_reputation: {
        Args: { p_action: string; p_ip: string; p_risk_score?: number }
        Returns: undefined
      }
      upsert_dream_learning_metrics: {
        Args: {
          p_agency_id: string
          p_artifact_quality?: number
          p_skill_improvement?: number
          p_success_rate_delta?: number
          p_template_diff?: number
          p_token_efficiency_delta?: number
        }
        Returns: string
      }
      validate_clarity_api_key: { Args: { p_api_key: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      upgrade_mode: "shadow" | "auto_safe" | "auto_full"
      upgrade_status:
        | "proposed"
        | "approved"
        | "applied"
        | "rolled_back"
        | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      upgrade_mode: ["shadow", "auto_safe", "auto_full"],
      upgrade_status: [
        "proposed",
        "approved",
        "applied",
        "rolled_back",
        "rejected",
      ],
    },
  },
} as const
