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
      access_api_keys: {
        Row: {
          created_at: string | null
          developer_id: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string | null
          rate_limit_per_day: number | null
          rate_limit_per_minute: number | null
          scopes: string[] | null
        }
        Insert: {
          created_at?: string | null
          developer_id: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name?: string | null
          rate_limit_per_day?: number | null
          rate_limit_per_minute?: number | null
          scopes?: string[] | null
        }
        Update: {
          created_at?: string | null
          developer_id?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string | null
          rate_limit_per_day?: number | null
          rate_limit_per_minute?: number | null
          scopes?: string[] | null
        }
        Relationships: []
      }
      access_developers: {
        Row: {
          created_at: string | null
          display_name: string
          email: string | null
          id: string
          metadata: Json | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_name: string
          email?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string
          email?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      access_products: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          legacy_code: string | null
          metadata: Json | null
          monthly_quota: number | null
          name: string
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          legacy_code?: string | null
          metadata?: Json | null
          monthly_quota?: number | null
          name: string
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          legacy_code?: string | null
          metadata?: Json | null
          monthly_quota?: number | null
          name?: string
        }
        Relationships: []
      }
      access_quotas: {
        Row: {
          api_key_id: string | null
          calls_used: number | null
          cost_millicents: number | null
          date: string
          id: string
          tokens_used: number | null
        }
        Insert: {
          api_key_id?: string | null
          calls_used?: number | null
          cost_millicents?: number | null
          date?: string
          id?: string
          tokens_used?: number | null
        }
        Update: {
          api_key_id?: string | null
          calls_used?: number | null
          cost_millicents?: number | null
          date?: string
          id?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "access_quotas_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "access_api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
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
      access_subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          developer_id: string
          entitlements: Json | null
          id: string
          monthly_quota: number | null
          plan_slug: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          developer_id: string
          entitlements?: Json | null
          id?: string
          monthly_quota?: number | null
          plan_slug?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          developer_id?: string
          entitlements?: Json | null
          id?: string
          monthly_quota?: number | null
          plan_slug?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      access_usage: {
        Row: {
          action: string
          api_key_id: string | null
          compute_ms: number | null
          cost_millicents: number | null
          created_at: string | null
          developer_id: string | null
          id: string
          metadata: Json | null
          module: string
          product_code: string | null
          tokens_used: number | null
        }
        Insert: {
          action: string
          api_key_id?: string | null
          compute_ms?: number | null
          cost_millicents?: number | null
          created_at?: string | null
          developer_id?: string | null
          id?: string
          metadata?: Json | null
          module: string
          product_code?: string | null
          tokens_used?: number | null
        }
        Update: {
          action?: string
          api_key_id?: string | null
          compute_ms?: number | null
          cost_millicents?: number | null
          created_at?: string | null
          developer_id?: string | null
          id?: string
          metadata?: Json | null
          module?: string
          product_code?: string | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "access_usage_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "access_api_keys"
            referencedColumns: ["id"]
          },
        ]
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
      activation_audit_log: {
        Row: {
          active_count: number
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          pack_id: string
          slot_capacity: number
          user_id: string
        }
        Insert: {
          active_count: number
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          pack_id: string
          slot_capacity: number
          user_id: string
        }
        Update: {
          active_count?: number
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          pack_id?: string
          slot_capacity?: number
          user_id?: string
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
      agency_economics: {
        Row: {
          agency_id: string
          avg_roi: number | null
          convergence_speed: number | null
          created_at: string | null
          id: string
          improvement_rate: number | null
          period_date: string
          success_rate: number | null
          tasks_completed: number | null
          total_compute_time_ms: number | null
          total_cost_cents: number | null
          total_learning_gain: number | null
          total_value_cents: number | null
          updated_at: string | null
        }
        Insert: {
          agency_id: string
          avg_roi?: number | null
          convergence_speed?: number | null
          created_at?: string | null
          id?: string
          improvement_rate?: number | null
          period_date?: string
          success_rate?: number | null
          tasks_completed?: number | null
          total_compute_time_ms?: number | null
          total_cost_cents?: number | null
          total_learning_gain?: number | null
          total_value_cents?: number | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: string
          avg_roi?: number | null
          convergence_speed?: number | null
          created_at?: string | null
          id?: string
          improvement_rate?: number | null
          period_date?: string
          success_rate?: number | null
          tasks_completed?: number | null
          total_compute_time_ms?: number | null
          total_cost_cents?: number | null
          total_learning_gain?: number | null
          total_value_cents?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_economics_agency_id_fkey"
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
          competency_score: number | null
          created_at: string | null
          id: string
          is_leader: boolean | null
          reflection_quality: number | null
          role: string
          skill_level: string | null
          skill_weights: Json | null
          sort_order: number | null
          specialization: string
          success_rate: number | null
          task_count: number | null
          total_learning_gain: number | null
        }
        Insert: {
          agency_id: string
          cognitive_id?: string | null
          competency_score?: number | null
          created_at?: string | null
          id?: string
          is_leader?: boolean | null
          reflection_quality?: number | null
          role: string
          skill_level?: string | null
          skill_weights?: Json | null
          sort_order?: number | null
          specialization: string
          success_rate?: number | null
          task_count?: number | null
          total_learning_gain?: number | null
        }
        Update: {
          agency_id?: string
          cognitive_id?: string | null
          competency_score?: number | null
          created_at?: string | null
          id?: string
          is_leader?: boolean | null
          reflection_quality?: number | null
          role?: string
          skill_level?: string | null
          skill_weights?: Json | null
          sort_order?: number | null
          specialization?: string
          success_rate?: number | null
          task_count?: number | null
          total_learning_gain?: number | null
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
          compute_time_ms: number | null
          created_at: string
          description: string | null
          error_message: string | null
          id: string
          input_data: Json | null
          learning_gain: number | null
          metadata: Json | null
          output_data: Json | null
          preset_id: string | null
          priority: number | null
          progress: number | null
          research_domain: string | null
          roi: number | null
          started_at: string | null
          status: string
          task_cost_cents: number | null
          task_type: string
          task_value_cents: number | null
          title: string
          updated_at: string
        }
        Insert: {
          agency_id: string
          assigned_member_id?: string | null
          completed_at?: string | null
          compute_time_ms?: number | null
          created_at?: string
          description?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          learning_gain?: number | null
          metadata?: Json | null
          output_data?: Json | null
          preset_id?: string | null
          priority?: number | null
          progress?: number | null
          research_domain?: string | null
          roi?: number | null
          started_at?: string | null
          status?: string
          task_cost_cents?: number | null
          task_type?: string
          task_value_cents?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          agency_id?: string
          assigned_member_id?: string | null
          completed_at?: string | null
          compute_time_ms?: number | null
          created_at?: string
          description?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          learning_gain?: number | null
          metadata?: Json | null
          output_data?: Json | null
          preset_id?: string | null
          priority?: number | null
          progress?: number | null
          research_domain?: string | null
          roi?: number | null
          started_at?: string | null
          status?: string
          task_cost_cents?: number | null
          task_type?: string
          task_value_cents?: number | null
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
      analytics_events: {
        Row: {
          category: string
          created_at: string
          event_type: string
          id: string
          label: string | null
          metadata: Json | null
          page: string | null
          session_id: string | null
          user_id: string | null
          value: number | null
        }
        Insert: {
          category: string
          created_at?: string
          event_type: string
          id?: string
          label?: string | null
          metadata?: Json | null
          page?: string | null
          session_id?: string | null
          user_id?: string | null
          value?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          event_type?: string
          id?: string
          label?: string | null
          metadata?: Json | null
          page?: string | null
          session_id?: string | null
          user_id?: string | null
          value?: number | null
        }
        Relationships: []
      }
      analytics_snapshots: {
        Row: {
          active_modules: number | null
          created_at: string
          data: Json
          error_rate: number | null
          health_score: number | null
          id: string
          snapshot_type: string
          total_events: number | null
        }
        Insert: {
          active_modules?: number | null
          created_at?: string
          data?: Json
          error_rate?: number | null
          health_score?: number | null
          id?: string
          snapshot_type?: string
          total_events?: number | null
        }
        Update: {
          active_modules?: number | null
          created_at?: string
          data?: Json
          error_rate?: number | null
          health_score?: number | null
          id?: string
          snapshot_type?: string
          total_events?: number | null
        }
        Relationships: []
      }
      atlas_capabilities: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          key: string
          metadata: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          key: string
          metadata?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          key?: string
          metadata?: Json | null
          updated_at?: string
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
          assumptions_extracted: boolean | null
          author_name: string | null
          author_role: string | null
          category: string
          confidence_factors: Json | null
          confidence_score: number | null
          content: string
          contradiction_outcome: string | null
          contradiction_score: number | null
          created_at: string
          epistemic_status: string | null
          excerpt: string | null
          experience_tags: string[] | null
          id: string
          published_at: string | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          slug: string
          split_brain_decision: string | null
          split_brain_reader_score: number | null
          split_brain_skeptic_score: number | null
          status: string
          title: string
          topic_seed: string | null
          updated_at: string
        }
        Insert: {
          assumptions_extracted?: boolean | null
          author_name?: string | null
          author_role?: string | null
          category: string
          confidence_factors?: Json | null
          confidence_score?: number | null
          content: string
          contradiction_outcome?: string | null
          contradiction_score?: number | null
          created_at?: string
          epistemic_status?: string | null
          excerpt?: string | null
          experience_tags?: string[] | null
          id?: string
          published_at?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          slug: string
          split_brain_decision?: string | null
          split_brain_reader_score?: number | null
          split_brain_skeptic_score?: number | null
          status?: string
          title: string
          topic_seed?: string | null
          updated_at?: string
        }
        Update: {
          assumptions_extracted?: boolean | null
          author_name?: string | null
          author_role?: string | null
          category?: string
          confidence_factors?: Json | null
          confidence_score?: number | null
          content?: string
          contradiction_outcome?: string | null
          contradiction_score?: number | null
          created_at?: string
          epistemic_status?: string | null
          excerpt?: string | null
          experience_tags?: string[] | null
          id?: string
          published_at?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          slug?: string
          split_brain_decision?: string | null
          split_brain_reader_score?: number | null
          split_brain_skeptic_score?: number | null
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
      autoblog_assumptions: {
        Row: {
          assumption_text: string
          assumption_type: string
          broken_at: string | null
          broken_by_post_id: string | null
          confidence_level: number | null
          created_at: string
          id: string
          is_broken: boolean | null
          post_id: string
        }
        Insert: {
          assumption_text: string
          assumption_type?: string
          broken_at?: string | null
          broken_by_post_id?: string | null
          confidence_level?: number | null
          created_at?: string
          id?: string
          is_broken?: boolean | null
          post_id: string
        }
        Update: {
          assumption_text?: string
          assumption_type?: string
          broken_at?: string | null
          broken_by_post_id?: string | null
          confidence_level?: number | null
          created_at?: string
          id?: string
          is_broken?: boolean | null
          post_id?: string
        }
        Relationships: []
      }
      autoblog_drafts: {
        Row: {
          body: string | null
          created_at: string
          format: string
          id: string
          preview_url: string | null
          queue_id: string | null
          title: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          format?: string
          id?: string
          preview_url?: string | null
          queue_id?: string | null
          title?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          format?: string
          id?: string
          preview_url?: string | null
          queue_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "autoblog_drafts_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "autoblog_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      autoblog_memory_reports: {
        Row: {
          assumptions_wrong: string[] | null
          confidence_adjustments: Json | null
          contradiction_count: number | null
          created_at: string
          id: string
          is_published: boolean | null
          lessons_learned: string[] | null
          patterns_abandoned: string[] | null
          post_count: number | null
          quality_trend: string | null
          report_period_end: string
          report_period_start: string
          silence_count: number | null
        }
        Insert: {
          assumptions_wrong?: string[] | null
          confidence_adjustments?: Json | null
          contradiction_count?: number | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          lessons_learned?: string[] | null
          patterns_abandoned?: string[] | null
          post_count?: number | null
          quality_trend?: string | null
          report_period_end: string
          report_period_start: string
          silence_count?: number | null
        }
        Update: {
          assumptions_wrong?: string[] | null
          confidence_adjustments?: Json | null
          contradiction_count?: number | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          lessons_learned?: string[] | null
          patterns_abandoned?: string[] | null
          post_count?: number | null
          quality_trend?: string | null
          report_period_end?: string
          report_period_start?: string
          silence_count?: number | null
        }
        Relationships: []
      }
      autoblog_queue: {
        Row: {
          channel: string
          completed_at: string | null
          confidence: number | null
          created_at: string
          dedupe_key: string | null
          error: string | null
          fallback_used: boolean
          id: string
          planned_at: string | null
          provider_used: string | null
          risk: string | null
          started_at: string | null
          status: string
          topic: string | null
        }
        Insert: {
          channel: string
          completed_at?: string | null
          confidence?: number | null
          created_at?: string
          dedupe_key?: string | null
          error?: string | null
          fallback_used?: boolean
          id?: string
          planned_at?: string | null
          provider_used?: string | null
          risk?: string | null
          started_at?: string | null
          status?: string
          topic?: string | null
        }
        Update: {
          channel?: string
          completed_at?: string | null
          confidence?: number | null
          created_at?: string
          dedupe_key?: string | null
          error?: string | null
          fallback_used?: boolean
          id?: string
          planned_at?: string | null
          provider_used?: string | null
          risk?: string | null
          started_at?: string | null
          status?: string
          topic?: string | null
        }
        Relationships: []
      }
      autoblog_runs: {
        Row: {
          circuit_state: string
          created_at: string
          failures: number
          heal_attempted: boolean
          id: string
          outcome: string
          phase: string
          queue_id: string | null
          reason: string | null
        }
        Insert: {
          circuit_state?: string
          created_at?: string
          failures?: number
          heal_attempted?: boolean
          id?: string
          outcome: string
          phase: string
          queue_id?: string | null
          reason?: string | null
        }
        Update: {
          circuit_state?: string
          created_at?: string
          failures?: number
          heal_attempted?: boolean
          id?: string
          outcome?: string
          phase?: string
          queue_id?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "autoblog_runs_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "autoblog_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      autoblog_settings: {
        Row: {
          allowed_channels: string[]
          allowed_risk_levels: string[]
          cadence_minutes: number
          circuit_opened_at: string | null
          circuit_state: string
          created_at: string
          dry_run: boolean
          enabled: boolean
          id: string
          max_failures_per_hour: number
          max_posts_per_day: number
          min_confidence_publish: number
          mode: string
          updated_at: string
        }
        Insert: {
          allowed_channels?: string[]
          allowed_risk_levels?: string[]
          cadence_minutes?: number
          circuit_opened_at?: string | null
          circuit_state?: string
          created_at?: string
          dry_run?: boolean
          enabled?: boolean
          id?: string
          max_failures_per_hour?: number
          max_posts_per_day?: number
          min_confidence_publish?: number
          mode?: string
          updated_at?: string
        }
        Update: {
          allowed_channels?: string[]
          allowed_risk_levels?: string[]
          cadence_minutes?: number
          circuit_opened_at?: string | null
          circuit_state?: string
          created_at?: string
          dry_run?: boolean
          enabled?: boolean
          id?: string
          max_failures_per_hour?: number
          max_posts_per_day?: number
          min_confidence_publish?: number
          mode?: string
          updated_at?: string
        }
        Relationships: []
      }
      autoblog_split_brain_audits: {
        Row: {
          caveat_count: number | null
          caveats_injected: string[] | null
          created_at: string
          final_decision: string
          id: string
          post_id: string | null
          queue_id: string | null
          reader_brain_score: number
          skeptic_brain_score: number
        }
        Insert: {
          caveat_count?: number | null
          caveats_injected?: string[] | null
          created_at?: string
          final_decision?: string
          id?: string
          post_id?: string | null
          queue_id?: string | null
          reader_brain_score?: number
          skeptic_brain_score?: number
        }
        Update: {
          caveat_count?: number | null
          caveats_injected?: string[] | null
          created_at?: string
          final_decision?: string
          id?: string
          post_id?: string | null
          queue_id?: string | null
          reader_brain_score?: number
          skeptic_brain_score?: number
        }
        Relationships: []
      }
      backup_exports: {
        Row: {
          backup_id: string
          created_at: string | null
          created_by: string | null
          download_count: number | null
          download_token: string | null
          expires_at: string | null
          export_type: string
          file_path: string
          file_size_bytes: number | null
          id: string
          includes_secrets: boolean | null
        }
        Insert: {
          backup_id: string
          created_at?: string | null
          created_by?: string | null
          download_count?: number | null
          download_token?: string | null
          expires_at?: string | null
          export_type: string
          file_path: string
          file_size_bytes?: number | null
          id?: string
          includes_secrets?: boolean | null
        }
        Update: {
          backup_id?: string
          created_at?: string | null
          created_by?: string | null
          download_count?: number | null
          download_token?: string | null
          expires_at?: string | null
          export_type?: string
          file_path?: string
          file_size_bytes?: number | null
          id?: string
          includes_secrets?: boolean | null
        }
        Relationships: []
      }
      backup_import_log: {
        Row: {
          completed_at: string | null
          errors: Json | null
          id: string
          import_status: string | null
          imported_by: string | null
          source_backup_id: string
          source_project_id: string | null
          started_at: string | null
          tables_restored: Json | null
        }
        Insert: {
          completed_at?: string | null
          errors?: Json | null
          id?: string
          import_status?: string | null
          imported_by?: string | null
          source_backup_id: string
          source_project_id?: string | null
          started_at?: string | null
          tables_restored?: Json | null
        }
        Update: {
          completed_at?: string | null
          errors?: Json | null
          id?: string
          import_status?: string | null
          imported_by?: string | null
          source_backup_id?: string
          source_project_id?: string | null
          started_at?: string | null
          tables_restored?: Json | null
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
      brain_classifier_models: {
        Row: {
          accuracy: number | null
          created_at: string
          ece_score: number | null
          id: string
          is_active: boolean
          model_type: string
          training_metadata: Json
          training_samples: number
          weights: Json
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          ece_score?: number | null
          id?: string
          is_active?: boolean
          model_type: string
          training_metadata?: Json
          training_samples?: number
          weights?: Json
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          ece_score?: number | null
          id?: string
          is_active?: boolean
          model_type?: string
          training_metadata?: Json
          training_samples?: number
          weights?: Json
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
      brain_distillation_runs: {
        Row: {
          calls_used: number | null
          completed_at: string | null
          compression_ratio_avg: number | null
          confidence_avg: number | null
          created_at: string
          crystals_created: number | null
          duration_ms: number | null
          error_message: string | null
          heuristics_created: number | null
          id: string
          memories_processed: number | null
          metadata: Json | null
          run_type: string
          status: string
          traces_created: number | null
        }
        Insert: {
          calls_used?: number | null
          completed_at?: string | null
          compression_ratio_avg?: number | null
          confidence_avg?: number | null
          created_at?: string
          crystals_created?: number | null
          duration_ms?: number | null
          error_message?: string | null
          heuristics_created?: number | null
          id?: string
          memories_processed?: number | null
          metadata?: Json | null
          run_type: string
          status?: string
          traces_created?: number | null
        }
        Update: {
          calls_used?: number | null
          completed_at?: string | null
          compression_ratio_avg?: number | null
          confidence_avg?: number | null
          created_at?: string
          crystals_created?: number | null
          duration_ms?: number | null
          error_message?: string | null
          heuristics_created?: number | null
          id?: string
          memories_processed?: number | null
          metadata?: Json | null
          run_type?: string
          status?: string
          traces_created?: number | null
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
      brain_drift_log: {
        Row: {
          action_taken: string | null
          created_at: string
          domain: string | null
          id: string
          is_anomaly: boolean
          reconstruction_error: number
          rolling_mean: number
          rolling_stddev: number
          sample_artifact_ids: string[] | null
          sigma_deviation: number
        }
        Insert: {
          action_taken?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          is_anomaly?: boolean
          reconstruction_error: number
          rolling_mean: number
          rolling_stddev: number
          sample_artifact_ids?: string[] | null
          sigma_deviation: number
        }
        Update: {
          action_taken?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          is_anomaly?: boolean
          reconstruction_error?: number
          rolling_mean?: number
          rolling_stddev?: number
          sample_artifact_ids?: string[] | null
          sigma_deviation?: number
        }
        Relationships: []
      }
      brain_embeddings: {
        Row: {
          artifact_content: string
          artifact_id: string
          artifact_type: string
          created_at: string
          embedding: string | null
          id: string
          model_version: string
          updated_at: string
        }
        Insert: {
          artifact_content: string
          artifact_id: string
          artifact_type: string
          created_at?: string
          embedding?: string | null
          id?: string
          model_version?: string
          updated_at?: string
        }
        Update: {
          artifact_content?: string
          artifact_id?: string
          artifact_type?: string
          created_at?: string
          embedding?: string | null
          id?: string
          model_version?: string
          updated_at?: string
        }
        Relationships: []
      }
      brain_events: {
        Row: {
          correlation_keys: Json | null
          created_at: string
          data: Json | null
          event_type: string
          id: string
          module: string
          outcome: string | null
          parent_span_id: string | null
          source_operation: string | null
          span_id: string | null
          trace_id: string | null
        }
        Insert: {
          correlation_keys?: Json | null
          created_at?: string
          data?: Json | null
          event_type: string
          id?: string
          module: string
          outcome?: string | null
          parent_span_id?: string | null
          source_operation?: string | null
          span_id?: string | null
          trace_id?: string | null
        }
        Update: {
          correlation_keys?: Json | null
          created_at?: string
          data?: Json | null
          event_type?: string
          id?: string
          module?: string
          outcome?: string | null
          parent_span_id?: string | null
          source_operation?: string | null
          span_id?: string | null
          trace_id?: string | null
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
          access_count: number | null
          confidence: number | null
          created_at: string | null
          decay_weight: number | null
          direction: string | null
          id: string
          last_accessed: string | null
          metadata: Json | null
          reinforcement_score: number | null
          relation: string | null
          relation_type: string | null
          source_id: string
          target_id: string
          temporal_context: string | null
          weight: number | null
        }
        Insert: {
          access_count?: number | null
          confidence?: number | null
          created_at?: string | null
          decay_weight?: number | null
          direction?: string | null
          id?: string
          last_accessed?: string | null
          metadata?: Json | null
          reinforcement_score?: number | null
          relation?: string | null
          relation_type?: string | null
          source_id: string
          target_id: string
          temporal_context?: string | null
          weight?: number | null
        }
        Update: {
          access_count?: number | null
          confidence?: number | null
          created_at?: string | null
          decay_weight?: number | null
          direction?: string | null
          id?: string
          last_accessed?: string | null
          metadata?: Json | null
          reinforcement_score?: number | null
          relation?: string | null
          relation_type?: string | null
          source_id?: string
          target_id?: string
          temporal_context?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      brain_graph_nodes: {
        Row: {
          attributes: Json | null
          centrality_score: number | null
          cluster_id: string | null
          created_at: string | null
          description: string | null
          embedding: string | null
          id: string
          label: string
          memory_tier: string | null
          node_type: string
          source_id: string | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          attributes?: Json | null
          centrality_score?: number | null
          cluster_id?: string | null
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          id?: string
          label: string
          memory_tier?: string | null
          node_type: string
          source_id?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          attributes?: Json | null
          centrality_score?: number | null
          cluster_id?: string | null
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          id?: string
          label?: string
          memory_tier?: string | null
          node_type?: string
          source_id?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      brain_knowledge_crystals: {
        Row: {
          compression_ratio: number | null
          confidence: number | null
          created_at: string
          crystal_type: string
          distilled_content: string
          domain: string | null
          id: string
          last_used_at: string | null
          metadata: Json | null
          reasoning_trace: string | null
          source_count: number | null
          source_memory_ids: string[] | null
          source_module: string | null
          source_tier: string | null
          student_model: string | null
          tags: string[] | null
          teacher_model: string | null
          title: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          compression_ratio?: number | null
          confidence?: number | null
          created_at?: string
          crystal_type?: string
          distilled_content: string
          domain?: string | null
          id?: string
          last_used_at?: string | null
          metadata?: Json | null
          reasoning_trace?: string | null
          source_count?: number | null
          source_memory_ids?: string[] | null
          source_module?: string | null
          source_tier?: string | null
          student_model?: string | null
          tags?: string[] | null
          teacher_model?: string | null
          title: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          compression_ratio?: number | null
          confidence?: number | null
          created_at?: string
          crystal_type?: string
          distilled_content?: string
          domain?: string | null
          id?: string
          last_used_at?: string | null
          metadata?: Json | null
          reasoning_trace?: string | null
          source_count?: number | null
          source_memory_ids?: string[] | null
          source_module?: string | null
          source_tier?: string | null
          student_model?: string | null
          tags?: string[] | null
          teacher_model?: string | null
          title?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      brain_knowledge_edges: {
        Row: {
          agent_id: string | null
          causal_direction: string | null
          created_at: string | null
          evidence_count: number | null
          id: string
          last_reinforced_at: string | null
          relationship_type: string | null
          source_memory_id: string
          strength: number | null
          target_memory_id: string
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          causal_direction?: string | null
          created_at?: string | null
          evidence_count?: number | null
          id?: string
          last_reinforced_at?: string | null
          relationship_type?: string | null
          source_memory_id: string
          strength?: number | null
          target_memory_id: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          causal_direction?: string | null
          created_at?: string | null
          evidence_count?: number | null
          id?: string
          last_reinforced_at?: string | null
          relationship_type?: string | null
          source_memory_id?: string
          strength?: number | null
          target_memory_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      brain_maintenance_log: {
        Row: {
          completed_at: string | null
          created_at: string
          details: Json | null
          duration_ms: number | null
          error_message: string | null
          id: string
          started_at: string
          status: string
          task_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          details?: Json | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          started_at?: string
          status?: string
          task_type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          details?: Json | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          started_at?: string
          status?: string
          task_type?: string
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
      brain_memory_archive: {
        Row: {
          access_count: number | null
          agent_id: string | null
          archived_at: string | null
          archived_from_tier: string | null
          archived_reason: string | null
          content: string
          context: string | null
          core_summary: string | null
          created_at: string | null
          id: string
          memory_type: string | null
          metadata: Json | null
          provenance: Json | null
          salience_score: number | null
          source_memory_id: string | null
          source_tier: string
          tags: Json | null
          user_id: string | null
          value_score: number | null
        }
        Insert: {
          access_count?: number | null
          agent_id?: string | null
          archived_at?: string | null
          archived_from_tier?: string | null
          archived_reason?: string | null
          content: string
          context?: string | null
          core_summary?: string | null
          created_at?: string | null
          id?: string
          memory_type?: string | null
          metadata?: Json | null
          provenance?: Json | null
          salience_score?: number | null
          source_memory_id?: string | null
          source_tier: string
          tags?: Json | null
          user_id?: string | null
          value_score?: number | null
        }
        Update: {
          access_count?: number | null
          agent_id?: string | null
          archived_at?: string | null
          archived_from_tier?: string | null
          archived_reason?: string | null
          content?: string
          context?: string | null
          core_summary?: string | null
          created_at?: string | null
          id?: string
          memory_type?: string | null
          metadata?: Json | null
          provenance?: Json | null
          salience_score?: number | null
          source_memory_id?: string | null
          source_tier?: string
          tags?: Json | null
          user_id?: string | null
          value_score?: number | null
        }
        Relationships: []
      }
      brain_memory_cold: {
        Row: {
          access_count: number | null
          agent_id: string | null
          archived_at: string | null
          compression_level: number | null
          compression_ratio: number | null
          core_summary: string | null
          created_at: string | null
          decay_curve: string | null
          embedding: string | null
          id: string
          last_accessed: string | null
          memory_type: string | null
          provenance: Json | null
          salience_score: number | null
          source_refs: string[] | null
          summary: string
          tags: Json | null
          user_id: string | null
          value_score: number | null
        }
        Insert: {
          access_count?: number | null
          agent_id?: string | null
          archived_at?: string | null
          compression_level?: number | null
          compression_ratio?: number | null
          core_summary?: string | null
          created_at?: string | null
          decay_curve?: string | null
          embedding?: string | null
          id?: string
          last_accessed?: string | null
          memory_type?: string | null
          provenance?: Json | null
          salience_score?: number | null
          source_refs?: string[] | null
          summary: string
          tags?: Json | null
          user_id?: string | null
          value_score?: number | null
        }
        Update: {
          access_count?: number | null
          agent_id?: string | null
          archived_at?: string | null
          compression_level?: number | null
          compression_ratio?: number | null
          core_summary?: string | null
          created_at?: string | null
          decay_curve?: string | null
          embedding?: string | null
          id?: string
          last_accessed?: string | null
          memory_type?: string | null
          provenance?: Json | null
          salience_score?: number | null
          source_refs?: string[] | null
          summary?: string
          tags?: Json | null
          user_id?: string | null
          value_score?: number | null
        }
        Relationships: []
      }
      brain_memory_contradictions: {
        Row: {
          agent_id: string | null
          confidence: number | null
          contradiction_type: string | null
          created_at: string | null
          id: string
          memory_a_content: string
          memory_a_id: string
          memory_a_tier: string
          memory_b_content: string
          memory_b_id: string
          memory_b_tier: string
          resolution: string | null
          resolved_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          confidence?: number | null
          contradiction_type?: string | null
          created_at?: string | null
          id?: string
          memory_a_content: string
          memory_a_id: string
          memory_a_tier: string
          memory_b_content: string
          memory_b_id: string
          memory_b_tier: string
          resolution?: string | null
          resolved_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          confidence?: number | null
          contradiction_type?: string | null
          created_at?: string | null
          id?: string
          memory_a_content?: string
          memory_a_id?: string
          memory_a_tier?: string
          memory_b_content?: string
          memory_b_id?: string
          memory_b_tier?: string
          resolution?: string | null
          resolved_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      brain_memory_hot: {
        Row: {
          access_count: number | null
          agent_id: string | null
          content: string
          context: string | null
          created_at: string | null
          decay_curve: string | null
          decay_rate: number | null
          ease_factor: number | null
          embedding: string | null
          goal_ref: string | null
          id: string
          importance_score: number | null
          last_used: string | null
          memory_type: string | null
          metadata: Json | null
          next_review_at: string | null
          priority: number | null
          provenance: Json | null
          repetition_interval_days: number | null
          review_count: number | null
          salience_score: number | null
          tags: Json | null
          updated_at: string | null
          user_id: string | null
          value_score: number | null
        }
        Insert: {
          access_count?: number | null
          agent_id?: string | null
          content: string
          context?: string | null
          created_at?: string | null
          decay_curve?: string | null
          decay_rate?: number | null
          ease_factor?: number | null
          embedding?: string | null
          goal_ref?: string | null
          id?: string
          importance_score?: number | null
          last_used?: string | null
          memory_type?: string | null
          metadata?: Json | null
          next_review_at?: string | null
          priority?: number | null
          provenance?: Json | null
          repetition_interval_days?: number | null
          review_count?: number | null
          salience_score?: number | null
          tags?: Json | null
          updated_at?: string | null
          user_id?: string | null
          value_score?: number | null
        }
        Update: {
          access_count?: number | null
          agent_id?: string | null
          content?: string
          context?: string | null
          created_at?: string | null
          decay_curve?: string | null
          decay_rate?: number | null
          ease_factor?: number | null
          embedding?: string | null
          goal_ref?: string | null
          id?: string
          importance_score?: number | null
          last_used?: string | null
          memory_type?: string | null
          metadata?: Json | null
          next_review_at?: string | null
          priority?: number | null
          provenance?: Json | null
          repetition_interval_days?: number | null
          review_count?: number | null
          salience_score?: number | null
          tags?: Json | null
          updated_at?: string | null
          user_id?: string | null
          value_score?: number | null
        }
        Relationships: []
      }
      brain_memory_meta: {
        Row: {
          agent_id: string | null
          archive_count: number | null
          avg_salience: number | null
          cold_count: number | null
          cold_limit: number | null
          compression_ratio: number | null
          contradiction_count: number | null
          created_at: string | null
          demotions: number | null
          hot_count: number | null
          hot_limit: number | null
          hourly_activity: Json | null
          id: string
          last_metacognition_update: string | null
          last_strategy_adjustment: string | null
          last_tiering_run: string | null
          peak_hours: number[] | null
          promotions: number | null
          recall_accuracy: number | null
          recall_hit_rate: number | null
          retrieval_strategy: string | null
          total_recalls: number | null
          total_stores: number | null
          updated_at: string | null
          user_id: string | null
          warm_count: number | null
          warm_limit: number | null
        }
        Insert: {
          agent_id?: string | null
          archive_count?: number | null
          avg_salience?: number | null
          cold_count?: number | null
          cold_limit?: number | null
          compression_ratio?: number | null
          contradiction_count?: number | null
          created_at?: string | null
          demotions?: number | null
          hot_count?: number | null
          hot_limit?: number | null
          hourly_activity?: Json | null
          id?: string
          last_metacognition_update?: string | null
          last_strategy_adjustment?: string | null
          last_tiering_run?: string | null
          peak_hours?: number[] | null
          promotions?: number | null
          recall_accuracy?: number | null
          recall_hit_rate?: number | null
          retrieval_strategy?: string | null
          total_recalls?: number | null
          total_stores?: number | null
          updated_at?: string | null
          user_id?: string | null
          warm_count?: number | null
          warm_limit?: number | null
        }
        Update: {
          agent_id?: string | null
          archive_count?: number | null
          avg_salience?: number | null
          cold_count?: number | null
          cold_limit?: number | null
          compression_ratio?: number | null
          contradiction_count?: number | null
          created_at?: string | null
          demotions?: number | null
          hot_count?: number | null
          hot_limit?: number | null
          hourly_activity?: Json | null
          id?: string
          last_metacognition_update?: string | null
          last_strategy_adjustment?: string | null
          last_tiering_run?: string | null
          peak_hours?: number[] | null
          promotions?: number | null
          recall_accuracy?: number | null
          recall_hit_rate?: number | null
          retrieval_strategy?: string | null
          total_recalls?: number | null
          total_stores?: number | null
          updated_at?: string | null
          user_id?: string | null
          warm_count?: number | null
          warm_limit?: number | null
        }
        Relationships: []
      }
      brain_memory_pruned: {
        Row: {
          can_restore: boolean | null
          content_preview: string | null
          context: string | null
          id: string
          original_memory_id: string
          original_tier: string
          prune_reason: string
          pruned_at: string | null
          restore_until: string | null
          value_score: number | null
        }
        Insert: {
          can_restore?: boolean | null
          content_preview?: string | null
          context?: string | null
          id?: string
          original_memory_id: string
          original_tier: string
          prune_reason: string
          pruned_at?: string | null
          restore_until?: string | null
          value_score?: number | null
        }
        Update: {
          can_restore?: boolean | null
          content_preview?: string | null
          context?: string | null
          id?: string
          original_memory_id?: string
          original_tier?: string
          prune_reason?: string
          pruned_at?: string | null
          restore_until?: string | null
          value_score?: number | null
        }
        Relationships: []
      }
      brain_memory_warm: {
        Row: {
          access_count: number | null
          agent_id: string | null
          compressed_summary: string | null
          compression_ratio: number | null
          content: string
          context: string | null
          core_summary: string | null
          created_at: string | null
          decay_curve: string | null
          decay_rate: number | null
          demoted_at: string | null
          ease_factor: number | null
          embedding: string | null
          goal_ref: string | null
          id: string
          last_accessed: string | null
          memory_type: string | null
          metadata: Json | null
          next_review_at: string | null
          priority: number | null
          promoted_at: string | null
          provenance: Json | null
          repetition_interval_days: number | null
          review_count: number | null
          salience_score: number | null
          source_memory_id: string | null
          tags: Json | null
          updated_at: string | null
          user_id: string | null
          value_score: number | null
        }
        Insert: {
          access_count?: number | null
          agent_id?: string | null
          compressed_summary?: string | null
          compression_ratio?: number | null
          content: string
          context?: string | null
          core_summary?: string | null
          created_at?: string | null
          decay_curve?: string | null
          decay_rate?: number | null
          demoted_at?: string | null
          ease_factor?: number | null
          embedding?: string | null
          goal_ref?: string | null
          id?: string
          last_accessed?: string | null
          memory_type?: string | null
          metadata?: Json | null
          next_review_at?: string | null
          priority?: number | null
          promoted_at?: string | null
          provenance?: Json | null
          repetition_interval_days?: number | null
          review_count?: number | null
          salience_score?: number | null
          source_memory_id?: string | null
          tags?: Json | null
          updated_at?: string | null
          user_id?: string | null
          value_score?: number | null
        }
        Update: {
          access_count?: number | null
          agent_id?: string | null
          compressed_summary?: string | null
          compression_ratio?: number | null
          content?: string
          context?: string | null
          core_summary?: string | null
          created_at?: string | null
          decay_curve?: string | null
          decay_rate?: number | null
          demoted_at?: string | null
          ease_factor?: number | null
          embedding?: string | null
          goal_ref?: string | null
          id?: string
          last_accessed?: string | null
          memory_type?: string | null
          metadata?: Json | null
          next_review_at?: string | null
          priority?: number | null
          promoted_at?: string | null
          provenance?: Json | null
          repetition_interval_days?: number | null
          review_count?: number | null
          salience_score?: number | null
          source_memory_id?: string | null
          tags?: Json | null
          updated_at?: string | null
          user_id?: string | null
          value_score?: number | null
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
      brain_rag_contexts: {
        Row: {
          agent_id: string | null
          context_string: string | null
          created_at: string | null
          id: string
          model_used: string | null
          query_text: string
          recalled_memory_ids: string[] | null
          recalled_tiers: string[] | null
          response_quality: number | null
          total_tokens: number | null
          user_id: string | null
          was_useful: boolean | null
        }
        Insert: {
          agent_id?: string | null
          context_string?: string | null
          created_at?: string | null
          id?: string
          model_used?: string | null
          query_text: string
          recalled_memory_ids?: string[] | null
          recalled_tiers?: string[] | null
          response_quality?: number | null
          total_tokens?: number | null
          user_id?: string | null
          was_useful?: boolean | null
        }
        Update: {
          agent_id?: string | null
          context_string?: string | null
          created_at?: string | null
          id?: string
          model_used?: string | null
          query_text?: string
          recalled_memory_ids?: string[] | null
          recalled_tiers?: string[] | null
          response_quality?: number | null
          total_tokens?: number | null
          user_id?: string | null
          was_useful?: boolean | null
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
      brain_reasoning_traces: {
        Row: {
          applied_count: number | null
          created_at: string
          distilled_pattern: string | null
          domain: string | null
          id: string
          last_applied_at: string | null
          metadata: Json | null
          module: string | null
          pattern_confidence: number | null
          prompt: string
          student_model: string
          teacher_model: string
          teacher_response: string
          token_savings_pct: number | null
          trace_type: string
        }
        Insert: {
          applied_count?: number | null
          created_at?: string
          distilled_pattern?: string | null
          domain?: string | null
          id?: string
          last_applied_at?: string | null
          metadata?: Json | null
          module?: string | null
          pattern_confidence?: number | null
          prompt: string
          student_model?: string
          teacher_model?: string
          teacher_response: string
          token_savings_pct?: number | null
          trace_type?: string
        }
        Update: {
          applied_count?: number | null
          created_at?: string
          distilled_pattern?: string | null
          domain?: string | null
          id?: string
          last_applied_at?: string | null
          metadata?: Json | null
          module?: string | null
          pattern_confidence?: number | null
          prompt?: string
          student_model?: string
          teacher_model?: string
          teacher_response?: string
          token_savings_pct?: number | null
          trace_type?: string
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
      brain_tiering_config: {
        Row: {
          auto_demote: boolean | null
          auto_promote: boolean | null
          config: Json | null
          created_at: string | null
          id: string
          max_age_days: number | null
          max_entries: number | null
          min_value_score: number | null
          prune_threshold: number | null
          tier_name: string
          updated_at: string | null
        }
        Insert: {
          auto_demote?: boolean | null
          auto_promote?: boolean | null
          config?: Json | null
          created_at?: string | null
          id?: string
          max_age_days?: number | null
          max_entries?: number | null
          min_value_score?: number | null
          prune_threshold?: number | null
          tier_name: string
          updated_at?: string | null
        }
        Update: {
          auto_demote?: boolean | null
          auto_promote?: boolean | null
          config?: Json | null
          created_at?: string | null
          id?: string
          max_age_days?: number | null
          max_entries?: number | null
          min_value_score?: number | null
          prune_threshold?: number | null
          tier_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      brain_transfer_heuristics: {
        Row: {
          applicability_domains: string[] | null
          applied_count: number | null
          confidence: number | null
          created_at: string
          generalization_score: number | null
          heuristic_content: string
          heuristic_name: string
          id: string
          last_applied_at: string | null
          metadata: Json | null
          source_module: string
          success_rate: number | null
          target_modules: string[] | null
          teacher_model: string | null
          updated_at: string
        }
        Insert: {
          applicability_domains?: string[] | null
          applied_count?: number | null
          confidence?: number | null
          created_at?: string
          generalization_score?: number | null
          heuristic_content: string
          heuristic_name: string
          id?: string
          last_applied_at?: string | null
          metadata?: Json | null
          source_module: string
          success_rate?: number | null
          target_modules?: string[] | null
          teacher_model?: string | null
          updated_at?: string
        }
        Update: {
          applicability_domains?: string[] | null
          applied_count?: number | null
          confidence?: number | null
          created_at?: string
          generalization_score?: number | null
          heuristic_content?: string
          heuristic_name?: string
          id?: string
          last_applied_at?: string | null
          metadata?: Json | null
          source_module?: string
          success_rate?: number | null
          target_modules?: string[] | null
          teacher_model?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      brain_user_fingerprints: {
        Row: {
          agent_id: string
          avg_message_length: number | null
          communication_style: string | null
          complexity_preference: string | null
          first_seen_at: string | null
          id: string
          interaction_count: number | null
          language_preference: string | null
          last_seen_at: string | null
          personality_signals: Json | null
          preferred_topics: string[] | null
          sentiment_trend: number | null
          timezone_hint: string | null
          top_keywords: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_id: string
          avg_message_length?: number | null
          communication_style?: string | null
          complexity_preference?: string | null
          first_seen_at?: string | null
          id?: string
          interaction_count?: number | null
          language_preference?: string | null
          last_seen_at?: string | null
          personality_signals?: Json | null
          preferred_topics?: string[] | null
          sentiment_trend?: number | null
          timezone_hint?: string | null
          top_keywords?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string
          avg_message_length?: number | null
          communication_style?: string | null
          complexity_preference?: string | null
          first_seen_at?: string | null
          id?: string
          interaction_count?: number | null
          language_preference?: string | null
          last_seen_at?: string | null
          personality_signals?: Json | null
          preferred_topics?: string[] | null
          sentiment_trend?: number | null
          timezone_hint?: string | null
          top_keywords?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      captcha_challenges: {
        Row: {
          challenge_text: string
          correct_answer: string
          created_at: string
          id: string
          solved_at: string | null
          status: string
          token: string
        }
        Insert: {
          challenge_text: string
          correct_answer: string
          created_at?: string
          id?: string
          solved_at?: string | null
          status?: string
          token: string
        }
        Update: {
          challenge_text?: string
          correct_answer?: string
          created_at?: string
          id?: string
          solved_at?: string | null
          status?: string
          token?: string
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
          session_token: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          message: string
          metadata?: Json | null
          reply?: string | null
          session_id?: string | null
          session_token?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          message?: string
          metadata?: Json | null
          reply?: string | null
          session_id?: string | null
          session_token?: string | null
          user_email?: string | null
          user_id?: string | null
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
      change_artifacts: {
        Row: {
          actor_id: string | null
          actor_type: string
          after_snapshot: Json | null
          before_snapshot: Json | null
          category: string
          created_at: string
          diff_data: Json | null
          id: string
          intent_summary: string | null
          metadata: Json | null
          status: string
        }
        Insert: {
          actor_id?: string | null
          actor_type?: string
          after_snapshot?: Json | null
          before_snapshot?: Json | null
          category?: string
          created_at?: string
          diff_data?: Json | null
          id?: string
          intent_summary?: string | null
          metadata?: Json | null
          status?: string
        }
        Update: {
          actor_id?: string | null
          actor_type?: string
          after_snapshot?: Json | null
          before_snapshot?: Json | null
          category?: string
          created_at?: string
          diff_data?: Json | null
          id?: string
          intent_summary?: string | null
          metadata?: Json | null
          status?: string
        }
        Relationships: []
      }
      change_ledger: {
        Row: {
          artifacts_touched: string[] | null
          change_type: string
          component: string
          evolution_id: string | null
          id: string
          metadata: Json | null
          metrics_after: Json | null
          metrics_before: Json | null
          phase: string
          source: string
          summary: string
          timestamp: string
        }
        Insert: {
          artifacts_touched?: string[] | null
          change_type: string
          component: string
          evolution_id?: string | null
          id?: string
          metadata?: Json | null
          metrics_after?: Json | null
          metrics_before?: Json | null
          phase?: string
          source?: string
          summary: string
          timestamp?: string
        }
        Update: {
          artifacts_touched?: string[] | null
          change_type?: string
          component?: string
          evolution_id?: string | null
          id?: string
          metadata?: Json | null
          metrics_after?: Json | null
          metrics_before?: Json | null
          phase?: string
          source?: string
          summary?: string
          timestamp?: string
        }
        Relationships: []
      }
      client_error_log: {
        Row: {
          component_stack: string | null
          created_at: string
          error_message: string | null
          error_name: string
          id: string
          metadata: Json | null
          session_id: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          component_stack?: string | null
          created_at?: string
          error_message?: string | null
          error_name: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          component_stack?: string | null
          created_at?: string
          error_message?: string | null
          error_name?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cmpsbl_patch_downloads: {
        Row: {
          created_at: string
          distribution_id: string
          id: string
          ip_address: string | null
          license_key_hash: string | null
          license_tier: string | null
          patch_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          distribution_id?: string
          id?: string
          ip_address?: string | null
          license_key_hash?: string | null
          license_tier?: string | null
          patch_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          distribution_id?: string
          id?: string
          ip_address?: string | null
          license_key_hash?: string | null
          license_tier?: string | null
          patch_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cmpsbl_patch_downloads_patch_id_fkey"
            columns: ["patch_id"]
            isOneToOne: false
            referencedRelation: "cmpsbl_patches"
            referencedColumns: ["id"]
          },
        ]
      }
      cmpsbl_patches: {
        Row: {
          capabilities_unlocked: string[] | null
          changelog: string | null
          config_overrides: Json | null
          created_at: string
          created_by: string | null
          edge_function_code: Json | null
          engines_unlocked: string[] | null
          id: string
          manifest_json: Json | null
          meta_engines_unlocked: string[] | null
          published_at: string | null
          required_tier: string
          signature: string | null
          status: string
          target_distribution: string
          updated_at: string
          version: string
        }
        Insert: {
          capabilities_unlocked?: string[] | null
          changelog?: string | null
          config_overrides?: Json | null
          created_at?: string
          created_by?: string | null
          edge_function_code?: Json | null
          engines_unlocked?: string[] | null
          id?: string
          manifest_json?: Json | null
          meta_engines_unlocked?: string[] | null
          published_at?: string | null
          required_tier?: string
          signature?: string | null
          status?: string
          target_distribution?: string
          updated_at?: string
          version: string
        }
        Update: {
          capabilities_unlocked?: string[] | null
          changelog?: string | null
          config_overrides?: Json | null
          created_at?: string
          created_by?: string | null
          edge_function_code?: Json | null
          engines_unlocked?: string[] | null
          id?: string
          manifest_json?: Json | null
          meta_engines_unlocked?: string[] | null
          published_at?: string | null
          required_tier?: string
          signature?: string | null
          status?: string
          target_distribution?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      code_stamps: {
        Row: {
          commit_hash: string | null
          created_at: string
          file_path: string
          id: string
          promotion_id: string | null
          shadow_run_id: string | null
          stamp_text: string
        }
        Insert: {
          commit_hash?: string | null
          created_at?: string
          file_path: string
          id?: string
          promotion_id?: string | null
          shadow_run_id?: string | null
          stamp_text: string
        }
        Update: {
          commit_hash?: string | null
          created_at?: string
          file_path?: string
          id?: string
          promotion_id?: string | null
          shadow_run_id?: string | null
          stamp_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "code_stamps_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "production_promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      cognitive_orders: {
        Row: {
          chosen_name: string | null
          created_at: string
          id: string
          payment_status: string
          sku: string
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          chosen_name?: string | null
          created_at?: string
          id?: string
          payment_status?: string
          sku: string
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          chosen_name?: string | null
          created_at?: string
          id?: string
          payment_status?: string
          sku?: string
          stripe_session_id?: string | null
          user_id?: string
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
      cognitive_stripe_map: {
        Row: {
          currency: string
          price_cents: number
          sku: string
          stripe_price_id: string | null
          stripe_product_id: string | null
          updated_at: string
        }
        Insert: {
          currency?: string
          price_cents?: number
          sku: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
        }
        Update: {
          currency?: string
          price_cents?: number
          sku?: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      core_config: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_sensitive: boolean | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_sensitive?: boolean | null
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_sensitive?: boolean | null
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      core_contexts: {
        Row: {
          api_key_id: string | null
          developer_id: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          permissions: Json | null
          rate_limit_remaining: number | null
          started_at: string | null
          tokens_remaining: number | null
        }
        Insert: {
          api_key_id?: string | null
          developer_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          permissions?: Json | null
          rate_limit_remaining?: number | null
          started_at?: string | null
          tokens_remaining?: number | null
        }
        Update: {
          api_key_id?: string | null
          developer_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          permissions?: Json | null
          rate_limit_remaining?: number | null
          started_at?: string | null
          tokens_remaining?: number | null
        }
        Relationships: []
      }
      core_jobs: {
        Row: {
          action: string
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          error_message: string | null
          execution_ms: number | null
          id: string
          max_retries: number | null
          module: string
          payload: Json | null
          priority: number | null
          result: Json | null
          retry_count: number | null
          scheduled_at: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          action: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          execution_ms?: number | null
          id?: string
          max_retries?: number | null
          module: string
          payload?: Json | null
          priority?: number | null
          result?: Json | null
          retry_count?: number | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          action?: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          execution_ms?: number | null
          id?: string
          max_retries?: number | null
          module?: string
          payload?: Json | null
          priority?: number | null
          result?: Json | null
          retry_count?: number | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
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
      core_state: {
        Row: {
          boot_sequence: Json | null
          created_at: string | null
          id: string
          last_heartbeat: string | null
          metadata: Json | null
          modules_status: Json | null
          state: string
          updated_at: string | null
          uptime_seconds: number | null
        }
        Insert: {
          boot_sequence?: Json | null
          created_at?: string | null
          id?: string
          last_heartbeat?: string | null
          metadata?: Json | null
          modules_status?: Json | null
          state?: string
          updated_at?: string | null
          uptime_seconds?: number | null
        }
        Update: {
          boot_sequence?: Json | null
          created_at?: string | null
          id?: string
          last_heartbeat?: string | null
          metadata?: Json | null
          modules_status?: Json | null
          state?: string
          updated_at?: string | null
          uptime_seconds?: number | null
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
      cortex_audit_log: {
        Row: {
          actor: string | null
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          reason: string | null
          target_action: string | null
          target_module: string | null
        }
        Insert: {
          actor?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          reason?: string | null
          target_action?: string | null
          target_module?: string | null
        }
        Update: {
          actor?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          reason?: string | null
          target_action?: string | null
          target_module?: string | null
        }
        Relationships: []
      }
      cortex_circuit_breakers: {
        Row: {
          created_at: string | null
          failure_count: number | null
          id: string
          last_failure_at: string | null
          last_success_at: string | null
          metadata: Json | null
          opened_at: string | null
          state: string
          subsystem: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          failure_count?: number | null
          id?: string
          last_failure_at?: string | null
          last_success_at?: string | null
          metadata?: Json | null
          opened_at?: string | null
          state?: string
          subsystem: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          failure_count?: number | null
          id?: string
          last_failure_at?: string | null
          last_success_at?: string | null
          metadata?: Json | null
          opened_at?: string | null
          state?: string
          subsystem?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cortex_modes: {
        Row: {
          auto_apply_enabled: boolean | null
          auto_apply_max_risk: string | null
          created_at: string | null
          degraded: boolean | null
          degraded_reason: string | null
          dispatch_enabled: boolean | null
          id: string
          last_restart_at: string | null
          mode: string
          panic_frozen: boolean | null
          panic_frozen_at: string | null
          panic_reason: string | null
          ready: boolean | null
          restart_count: number | null
          updated_at: string | null
        }
        Insert: {
          auto_apply_enabled?: boolean | null
          auto_apply_max_risk?: string | null
          created_at?: string | null
          degraded?: boolean | null
          degraded_reason?: string | null
          dispatch_enabled?: boolean | null
          id?: string
          last_restart_at?: string | null
          mode?: string
          panic_frozen?: boolean | null
          panic_frozen_at?: string | null
          panic_reason?: string | null
          ready?: boolean | null
          restart_count?: number | null
          updated_at?: string | null
        }
        Update: {
          auto_apply_enabled?: boolean | null
          auto_apply_max_risk?: string | null
          created_at?: string | null
          degraded?: boolean | null
          degraded_reason?: string | null
          dispatch_enabled?: boolean | null
          id?: string
          last_restart_at?: string | null
          mode?: string
          panic_frozen?: boolean | null
          panic_frozen_at?: string | null
          panic_reason?: string | null
          ready?: boolean | null
          restart_count?: number | null
          updated_at?: string | null
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
      crystallized_assets: {
        Row: {
          asset_key: string
          asset_type: string
          created_at: string
          display_name: string
          id: string
          pack_id: string | null
          status: string
          tier_min: string
          updated_at: string
        }
        Insert: {
          asset_key: string
          asset_type?: string
          created_at?: string
          display_name: string
          id?: string
          pack_id?: string | null
          status?: string
          tier_min?: string
          updated_at?: string
        }
        Update: {
          asset_key?: string
          asset_type?: string
          created_at?: string
          display_name?: string
          id?: string
          pack_id?: string | null
          status?: string
          tier_min?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_backups: {
        Row: {
          backup_category: string | null
          backup_date: string
          backup_id: string
          backup_path: string
          checksum: string | null
          created_at: string
          data_counts: Json | null
          expires_at: string | null
          id: string
          is_permanent: boolean | null
          notes: string | null
          restore_point_enabled: boolean | null
          size_bytes: number | null
          snapshot: Json
          status: string | null
          substrate_version: string | null
        }
        Insert: {
          backup_category?: string | null
          backup_date?: string
          backup_id: string
          backup_path: string
          checksum?: string | null
          created_at?: string
          data_counts?: Json | null
          expires_at?: string | null
          id?: string
          is_permanent?: boolean | null
          notes?: string | null
          restore_point_enabled?: boolean | null
          size_bytes?: number | null
          snapshot: Json
          status?: string | null
          substrate_version?: string | null
        }
        Update: {
          backup_category?: string | null
          backup_date?: string
          backup_id?: string
          backup_path?: string
          checksum?: string | null
          created_at?: string
          data_counts?: Json | null
          expires_at?: string | null
          id?: string
          is_permanent?: boolean | null
          notes?: string | null
          restore_point_enabled?: boolean | null
          size_bytes?: number | null
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
      decode_search_results: {
        Row: {
          created_at: string
          id: string
          is_new: boolean | null
          query: string
          relevance_score: number | null
          search_provider: string | null
          snippet: string | null
          source_url: string | null
          title: string | null
          topic: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_new?: boolean | null
          query: string
          relevance_score?: number | null
          search_provider?: string | null
          snippet?: string | null
          source_url?: string | null
          title?: string | null
          topic: string
        }
        Update: {
          created_at?: string
          id?: string
          is_new?: boolean | null
          query?: string
          relevance_score?: number | null
          search_provider?: string | null
          snippet?: string | null
          source_url?: string | null
          title?: string | null
          topic?: string
        }
        Relationships: []
      }
      defense_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string | null
          description: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      defense_events: {
        Row: {
          action: string
          asn: string | null
          country: string | null
          defense_mode: string | null
          detected_at: string
          endpoint: string
          fingerprint_family: string | null
          fingerprint_hash: string | null
          id: string
          ip: string
          matched_rule_id: string | null
          metadata: Json | null
          provider: string | null
          reason: string | null
          request_method: string | null
          risk_score: number
          session_id: string | null
          status_code: number | null
          user_agent: string | null
        }
        Insert: {
          action: string
          asn?: string | null
          country?: string | null
          defense_mode?: string | null
          detected_at?: string
          endpoint: string
          fingerprint_family?: string | null
          fingerprint_hash?: string | null
          id?: string
          ip: string
          matched_rule_id?: string | null
          metadata?: Json | null
          provider?: string | null
          reason?: string | null
          request_method?: string | null
          risk_score: number
          session_id?: string | null
          status_code?: number | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          asn?: string | null
          country?: string | null
          defense_mode?: string | null
          detected_at?: string
          endpoint?: string
          fingerprint_family?: string | null
          fingerprint_hash?: string | null
          id?: string
          ip?: string
          matched_rule_id?: string | null
          metadata?: Json | null
          provider?: string | null
          reason?: string | null
          request_method?: string | null
          risk_score?: number
          session_id?: string | null
          status_code?: number | null
          user_agent?: string | null
        }
        Relationships: []
      }
      defense_rules: {
        Row: {
          action: string
          condition: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          last_matched_at: string | null
          match_count: number | null
          metadata: Json | null
          pattern: string
          priority: number | null
          rule_name: string
          threshold: number | null
          updated_at: string | null
        }
        Insert: {
          action?: string
          condition?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_matched_at?: string | null
          match_count?: number | null
          metadata?: Json | null
          pattern: string
          priority?: number | null
          rule_name: string
          threshold?: number | null
          updated_at?: string | null
        }
        Update: {
          action?: string
          condition?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_matched_at?: string | null
          match_count?: number | null
          metadata?: Json | null
          pattern?: string
          priority?: number | null
          rule_name?: string
          threshold?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      developer_ai_tool_usage: {
        Row: {
          created_at: string | null
          developer_id: string
          id: string
          input_context: string | null
          output_result: string | null
          response_time_ms: number | null
          tokens_used: number | null
          tool_type: string
          was_helpful: boolean | null
        }
        Insert: {
          created_at?: string | null
          developer_id: string
          id?: string
          input_context?: string | null
          output_result?: string | null
          response_time_ms?: number | null
          tokens_used?: number | null
          tool_type: string
          was_helpful?: boolean | null
        }
        Update: {
          created_at?: string | null
          developer_id?: string
          id?: string
          input_context?: string | null
          output_result?: string | null
          response_time_ms?: number | null
          tokens_used?: number | null
          tool_type?: string
          was_helpful?: boolean | null
        }
        Relationships: []
      }
      developer_certifications: {
        Row: {
          badge_color: string | null
          badge_icon: string | null
          certification_key: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          min_xp_total: number | null
          name: string
          required_skills: string[]
        }
        Insert: {
          badge_color?: string | null
          badge_icon?: string | null
          certification_key: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          min_xp_total?: number | null
          name: string
          required_skills?: string[]
        }
        Update: {
          badge_color?: string | null
          badge_icon?: string | null
          certification_key?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          min_xp_total?: number | null
          name?: string
          required_skills?: string[]
        }
        Relationships: []
      }
      developer_earned_badges: {
        Row: {
          certification_key: string
          developer_id: string
          earned_at: string
          id: string
          metadata: Json | null
          verification_hash: string | null
        }
        Insert: {
          certification_key: string
          developer_id: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          verification_hash?: string | null
        }
        Update: {
          certification_key?: string
          developer_id?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          verification_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "developer_earned_badges_certification_key_fkey"
            columns: ["certification_key"]
            isOneToOne: false
            referencedRelation: "developer_certifications"
            referencedColumns: ["certification_key"]
          },
        ]
      }
      developer_progress: {
        Row: {
          completed_at: string | null
          developer_id: string
          id: string
          is_completed: boolean | null
          last_activity_at: string | null
          skill_key: string
          started_at: string | null
          xp_earned: number
        }
        Insert: {
          completed_at?: string | null
          developer_id: string
          id?: string
          is_completed?: boolean | null
          last_activity_at?: string | null
          skill_key: string
          started_at?: string | null
          xp_earned?: number
        }
        Update: {
          completed_at?: string | null
          developer_id?: string
          id?: string
          is_completed?: boolean | null
          last_activity_at?: string | null
          skill_key?: string
          started_at?: string | null
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "developer_progress_skill_key_fkey"
            columns: ["skill_key"]
            isOneToOne: false
            referencedRelation: "developer_skill_tree"
            referencedColumns: ["skill_key"]
          },
        ]
      }
      developer_sandbox_sessions: {
        Row: {
          code_state: Json | null
          created_at: string | null
          developer_id: string
          id: string
          is_active: boolean | null
          memory_state: Json | null
          session_name: string | null
          updated_at: string | null
        }
        Insert: {
          code_state?: Json | null
          created_at?: string | null
          developer_id: string
          id?: string
          is_active?: boolean | null
          memory_state?: Json | null
          session_name?: string | null
          updated_at?: string | null
        }
        Update: {
          code_state?: Json | null
          created_at?: string | null
          developer_id?: string
          id?: string
          is_active?: boolean | null
          memory_state?: Json | null
          session_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      developer_skill_tree: {
        Row: {
          category: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          prerequisites: string[] | null
          skill_key: string
          tier: number
          unlocks: string[] | null
          xp_required: number
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          prerequisites?: string[] | null
          skill_key: string
          tier?: number
          unlocks?: string[] | null
          xp_required?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          prerequisites?: string[] | null
          skill_key?: string
          tier?: number
          unlocks?: string[] | null
          xp_required?: number
        }
        Relationships: []
      }
      developer_templates: {
        Row: {
          category: string
          created_at: string
          default_config: Json
          description: string
          difficulty: string
          documentation_url: string | null
          estimated_setup_minutes: number
          example_code: string | null
          features: string[]
          id: string
          install_count: number
          is_active: boolean
          is_featured: boolean
          long_description: string | null
          name: string
          required_modules: string[]
          slug: string
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          default_config?: Json
          description: string
          difficulty?: string
          documentation_url?: string | null
          estimated_setup_minutes?: number
          example_code?: string | null
          features?: string[]
          id?: string
          install_count?: number
          is_active?: boolean
          is_featured?: boolean
          long_description?: string | null
          name: string
          required_modules?: string[]
          slug: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          default_config?: Json
          description?: string
          difficulty?: string
          documentation_url?: string | null
          estimated_setup_minutes?: number
          example_code?: string | null
          features?: string[]
          id?: string
          install_count?: number
          is_active?: boolean
          is_featured?: boolean
          long_description?: string | null
          name?: string
          required_modules?: string[]
          slug?: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      developer_tutorial_progress: {
        Row: {
          code_submissions: Json | null
          completed_at: string | null
          developer_id: string
          id: string
          is_completed: boolean | null
          started_at: string | null
          step_index: number
          tutorial_id: string
        }
        Insert: {
          code_submissions?: Json | null
          completed_at?: string | null
          developer_id: string
          id?: string
          is_completed?: boolean | null
          started_at?: string | null
          step_index?: number
          tutorial_id: string
        }
        Update: {
          code_submissions?: Json | null
          completed_at?: string | null
          developer_id?: string
          id?: string
          is_completed?: boolean | null
          started_at?: string | null
          step_index?: number
          tutorial_id?: string
        }
        Relationships: []
      }
      device_fingerprint_snapshots: {
        Row: {
          created_at: string
          drift_history: Json | null
          fingerprint_hash: string
          flags: Json
          id: string
          signal_buckets: Json
          signal_hashes: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          drift_history?: Json | null
          fingerprint_hash: string
          flags?: Json
          id?: string
          signal_buckets?: Json
          signal_hashes?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          drift_history?: Json | null
          fingerprint_hash?: string
          flags?: Json
          id?: string
          signal_buckets?: Json
          signal_hashes?: Json
          updated_at?: string
        }
        Relationships: []
      }
      discoveries: {
        Row: {
          category: string
          cjpi: number
          cjpi_breakdown: Json | null
          components: Json
          created_at: string
          description: string | null
          discovered_by: string | null
          engine_candidate: boolean | null
          error_strategy: string | null
          id: string
          max_execution_ms: number | null
          module_chain: string[]
          name: string
          provenance: string | null
          rationale: string | null
          run_id: string
          synergy_multiplier: number | null
          tier: string | null
          written_to_registry: boolean | null
        }
        Insert: {
          category: string
          cjpi: number
          cjpi_breakdown?: Json | null
          components?: Json
          created_at?: string
          description?: string | null
          discovered_by?: string | null
          engine_candidate?: boolean | null
          error_strategy?: string | null
          id: string
          max_execution_ms?: number | null
          module_chain?: string[]
          name: string
          provenance?: string | null
          rationale?: string | null
          run_id: string
          synergy_multiplier?: number | null
          tier?: string | null
          written_to_registry?: boolean | null
        }
        Update: {
          category?: string
          cjpi?: number
          cjpi_breakdown?: Json | null
          components?: Json
          created_at?: string
          description?: string | null
          discovered_by?: string | null
          engine_candidate?: boolean | null
          error_strategy?: string | null
          id?: string
          max_execution_ms?: number | null
          module_chain?: string[]
          name?: string
          provenance?: string | null
          rationale?: string | null
          run_id?: string
          synergy_multiplier?: number | null
          tier?: string | null
          written_to_registry?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "discoveries_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "discovery_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      discovery_lock: {
        Row: {
          expires_at: string | null
          id: string
          locked_at: string | null
          locked_by: string | null
        }
        Insert: {
          expires_at?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
        }
        Update: {
          expires_at?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
        }
        Relationships: []
      }
      discovery_runs: {
        Row: {
          accepted_count: number
          created_at: string
          created_by: string | null
          dry_run: boolean
          exploratory_mode: boolean
          finished_at: string | null
          id: string
          input_snapshot_hash: string | null
          logs: Json | null
          registry_checksum_after: string | null
          registry_checksum_before: string | null
          scoring_version: string
          started_at: string
          status: string
          top_find_cjpi: number | null
          top_find_name: string | null
          total_candidates: number
        }
        Insert: {
          accepted_count?: number
          created_at?: string
          created_by?: string | null
          dry_run?: boolean
          exploratory_mode?: boolean
          finished_at?: string | null
          id?: string
          input_snapshot_hash?: string | null
          logs?: Json | null
          registry_checksum_after?: string | null
          registry_checksum_before?: string | null
          scoring_version?: string
          started_at?: string
          status?: string
          top_find_cjpi?: number | null
          top_find_name?: string | null
          total_candidates?: number
        }
        Update: {
          accepted_count?: number
          created_at?: string
          created_by?: string | null
          dry_run?: boolean
          exploratory_mode?: boolean
          finished_at?: string | null
          id?: string
          input_snapshot_hash?: string | null
          logs?: Json | null
          registry_checksum_after?: string | null
          registry_checksum_before?: string | null
          scoring_version?: string
          started_at?: string
          status?: string
          top_find_cjpi?: number | null
          top_find_name?: string | null
          total_candidates?: number
        }
        Relationships: []
      }
      dream_anomalies: {
        Row: {
          anomaly_type: string
          context: Json | null
          created_at: string
          id: string
          message: string
          resolved: boolean | null
          resolved_at: string | null
          severity: string
        }
        Insert: {
          anomaly_type: string
          context?: Json | null
          created_at?: string
          id?: string
          message: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string
        }
        Update: {
          anomaly_type?: string
          context?: Json | null
          created_at?: string
          id?: string
          message?: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string
        }
        Relationships: []
      }
      dream_archaeology: {
        Row: {
          created_at: string
          id: string
          insight: string | null
          mood_distribution: Json | null
          nightmare_ratio: number | null
          period_end: string
          period_start: string
          theme_clusters: Json | null
          total_consumed: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          insight?: string | null
          mood_distribution?: Json | null
          nightmare_ratio?: number | null
          period_end: string
          period_start: string
          theme_clusters?: Json | null
          total_consumed?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          insight?: string | null
          mood_distribution?: Json | null
          nightmare_ratio?: number | null
          period_end?: string
          period_start?: string
          theme_clusters?: Json | null
          total_consumed?: number | null
        }
        Relationships: []
      }
      dream_artifacts: {
        Row: {
          artifact_date: string
          created_at: string
          dreams_compressed: number | null
          id: string
          is_immutable: boolean | null
          mood: string
          nightmares_compressed: number | null
          sentence: string
          visual_seed: string | null
        }
        Insert: {
          artifact_date: string
          created_at?: string
          dreams_compressed?: number | null
          id?: string
          is_immutable?: boolean | null
          mood: string
          nightmares_compressed?: number | null
          sentence: string
          visual_seed?: string | null
        }
        Update: {
          artifact_date?: string
          created_at?: string
          dreams_compressed?: number | null
          id?: string
          is_immutable?: boolean | null
          mood?: string
          nightmares_compressed?: number | null
          sentence?: string
          visual_seed?: string | null
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
      dream_eater_audit: {
        Row: {
          created_at: string
          event_type: string
          id: string
          mood_after: string | null
          mood_before: string | null
          mutation_delta: number | null
          nightmare_intensity: number | null
          session_hash: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          mood_after?: string | null
          mood_before?: string | null
          mutation_delta?: number | null
          nightmare_intensity?: number | null
          session_hash?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          mood_after?: string | null
          mood_before?: string | null
          mutation_delta?: number | null
          nightmare_intensity?: number | null
          session_hash?: string | null
        }
        Relationships: []
      }
      dream_eater_features: {
        Row: {
          enabled: boolean | null
          feature_key: string
          id: string
          metadata: Json | null
          updated_at: string
        }
        Insert: {
          enabled?: boolean | null
          feature_key: string
          id?: string
          metadata?: Json | null
          updated_at?: string
        }
        Update: {
          enabled?: boolean | null
          feature_key?: string
          id?: string
          metadata?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      dream_eater_milestones: {
        Row: {
          animation_triggered: boolean | null
          created_at: string
          description: string | null
          id: string
          milestone_level: number
          milestone_name: string
          unlocked_at: string | null
        }
        Insert: {
          animation_triggered?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          milestone_level: number
          milestone_name: string
          unlocked_at?: string | null
        }
        Update: {
          animation_triggered?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          milestone_level?: number
          milestone_name?: string
          unlocked_at?: string | null
        }
        Relationships: []
      }
      dream_eater_state: {
        Row: {
          awaken_count: number | null
          current_mood: string
          cycle_count_today: number | null
          dreams_consumed_today: number | null
          id: string
          instability_score: number | null
          last_awaken_at: string | null
          last_cycle_at: string | null
          last_daily_reset: string | null
          last_decay_at: string | null
          last_fed_at: string | null
          mood_score: number | null
          mutation_history: Json | null
          mutation_level: number | null
          nightmares_consumed_today: number | null
          reset_reason: string | null
          updated_at: string
        }
        Insert: {
          awaken_count?: number | null
          current_mood?: string
          cycle_count_today?: number | null
          dreams_consumed_today?: number | null
          id?: string
          instability_score?: number | null
          last_awaken_at?: string | null
          last_cycle_at?: string | null
          last_daily_reset?: string | null
          last_decay_at?: string | null
          last_fed_at?: string | null
          mood_score?: number | null
          mutation_history?: Json | null
          mutation_level?: number | null
          nightmares_consumed_today?: number | null
          reset_reason?: string | null
          updated_at?: string
        }
        Update: {
          awaken_count?: number | null
          current_mood?: string
          cycle_count_today?: number | null
          dreams_consumed_today?: number | null
          id?: string
          instability_score?: number | null
          last_awaken_at?: string | null
          last_cycle_at?: string | null
          last_daily_reset?: string | null
          last_decay_at?: string | null
          last_fed_at?: string | null
          mood_score?: number | null
          mutation_history?: Json | null
          mutation_level?: number | null
          nightmares_consumed_today?: number | null
          reset_reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dream_echo_templates: {
        Row: {
          created_at: string
          echo_type: string
          id: string
          mood_affinity: string[] | null
          template: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          echo_type: string
          id?: string
          mood_affinity?: string[] | null
          template: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          echo_type?: string
          id?: string
          mood_affinity?: string[] | null
          template?: string
          weight?: number | null
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
      dream_stream: {
        Row: {
          created_at: string
          id: string
          mood_after: string
          mood_before: string
          mutation_delta: number | null
          opted_in_excerpt: string | null
          stream_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          mood_after: string
          mood_before: string
          mutation_delta?: number | null
          opted_in_excerpt?: string | null
          stream_type: string
        }
        Update: {
          created_at?: string
          id?: string
          mood_after?: string
          mood_before?: string
          mutation_delta?: number | null
          opted_in_excerpt?: string | null
          stream_type?: string
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
      evolution_autonomy_config: {
        Row: {
          autonomy_mode: string
          config_id: string
          created_at: string
          max_auto_runs_per_day: number
          min_confidence_prod: number
          require_confidence_threshold: boolean
          updated_at: string
        }
        Insert: {
          autonomy_mode?: string
          config_id?: string
          created_at?: string
          max_auto_runs_per_day?: number
          min_confidence_prod?: number
          require_confidence_threshold?: boolean
          updated_at?: string
        }
        Update: {
          autonomy_mode?: string
          config_id?: string
          created_at?: string
          max_auto_runs_per_day?: number
          min_confidence_prod?: number
          require_confidence_threshold?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      evolution_circuit: {
        Row: {
          auto_reset_after: unknown
          circuit_id: string
          created_at: string
          last_trip_at: string | null
          reason: string | null
          state: string
          updated_at: string
        }
        Insert: {
          auto_reset_after?: unknown
          circuit_id?: string
          created_at?: string
          last_trip_at?: string | null
          reason?: string | null
          state?: string
          updated_at?: string
        }
        Update: {
          auto_reset_after?: unknown
          circuit_id?: string
          created_at?: string
          last_trip_at?: string | null
          reason?: string | null
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      evolution_entropy_ledger: {
        Row: {
          created_at: string
          debt_flags_count: number
          entropy_delta: number | null
          entropy_score: number
          event_type: string
          health_delta: number | null
          health_score: number
          id: string
          is_restoration: boolean
          metadata: Json | null
          proposal_id: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          debt_flags_count?: number
          entropy_delta?: number | null
          entropy_score?: number
          event_type?: string
          health_delta?: number | null
          health_score?: number
          id?: string
          is_restoration?: boolean
          metadata?: Json | null
          proposal_id?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          debt_flags_count?: number
          entropy_delta?: number | null
          entropy_score?: number
          event_type?: string
          health_delta?: number | null
          health_score?: number
          id?: string
          is_restoration?: boolean
          metadata?: Json | null
          proposal_id?: string | null
          tenant_id?: string
        }
        Relationships: []
      }
      evolution_pre_metrics: {
        Row: {
          audit_percent: number
          created_at: string
          debt_flags_count: number
          entropy_score: number
          health_score: number
          id: string
          memory_total_vectors: number
          open_circuit_count: number
          proposal_id: string | null
          raw_scan_data: Json | null
          snapshot_id: string
          tenant_id: string | null
        }
        Insert: {
          audit_percent?: number
          created_at?: string
          debt_flags_count?: number
          entropy_score?: number
          health_score?: number
          id?: string
          memory_total_vectors?: number
          open_circuit_count?: number
          proposal_id?: string | null
          raw_scan_data?: Json | null
          snapshot_id: string
          tenant_id?: string | null
        }
        Update: {
          audit_percent?: number
          created_at?: string
          debt_flags_count?: number
          entropy_score?: number
          health_score?: number
          id?: string
          memory_total_vectors?: number
          open_circuit_count?: number
          proposal_id?: string | null
          raw_scan_data?: Json | null
          snapshot_id?: string
          tenant_id?: string | null
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
      evolution_receipts: {
        Row: {
          backup_id: string | null
          changes_applied: Json
          delta: Json | null
          health_after: Json | null
          health_before: Json | null
          phase: Database["public"]["Enums"]["evolution_phase"]
          plan_id: string
          post_metrics: Json | null
          pre_metrics: Json | null
          receipt_id: string
          reverted_at: string | null
          run_id: string
          snapshot_id: string | null
          status: string
          tenant_id: string | null
          tests_passed: number | null
          tests_run: number | null
          timestamp: string
        }
        Insert: {
          backup_id?: string | null
          changes_applied?: Json
          delta?: Json | null
          health_after?: Json | null
          health_before?: Json | null
          phase: Database["public"]["Enums"]["evolution_phase"]
          plan_id: string
          post_metrics?: Json | null
          pre_metrics?: Json | null
          receipt_id?: string
          reverted_at?: string | null
          run_id: string
          snapshot_id?: string | null
          status?: string
          tenant_id?: string | null
          tests_passed?: number | null
          tests_run?: number | null
          timestamp?: string
        }
        Update: {
          backup_id?: string | null
          changes_applied?: Json
          delta?: Json | null
          health_after?: Json | null
          health_before?: Json | null
          phase?: Database["public"]["Enums"]["evolution_phase"]
          plan_id?: string
          post_metrics?: Json | null
          pre_metrics?: Json | null
          receipt_id?: string
          reverted_at?: string | null
          run_id?: string
          snapshot_id?: string | null
          status?: string
          tenant_id?: string | null
          tests_passed?: number | null
          tests_run?: number | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "evolution_receipts_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "evolution_runs"
            referencedColumns: ["run_id"]
          },
        ]
      }
      evolution_repair_log: {
        Row: {
          actions_taken: Json
          completed_at: string | null
          outcome: string | null
          repair_id: string
          run_id: string | null
          started_at: string
          trigger_reason: string
        }
        Insert: {
          actions_taken?: Json
          completed_at?: string | null
          outcome?: string | null
          repair_id?: string
          run_id?: string | null
          started_at?: string
          trigger_reason: string
        }
        Update: {
          actions_taken?: Json
          completed_at?: string | null
          outcome?: string | null
          repair_id?: string
          run_id?: string | null
          started_at?: string
          trigger_reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "evolution_repair_log_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "evolution_runs"
            referencedColumns: ["run_id"]
          },
        ]
      }
      evolution_runs: {
        Row: {
          auto_initiated: boolean | null
          completed_at: string | null
          confidence_score: number | null
          created_at: string
          initiated_by: Database["public"]["Enums"]["evolution_initiator"]
          metadata: Json | null
          phase: Database["public"]["Enums"]["evolution_phase"]
          plan_id: string
          receipt_id: string | null
          risk_level: Database["public"]["Enums"]["evolution_risk_level"] | null
          run_id: string
          tsac_drift_detected: boolean | null
          tsac_pre_criteria: Json | null
          tsac_pre_score: number | null
          tsac_pre_verdict: string | null
          tsac_production_score: number | null
          tsac_production_verdict: string | null
          tsac_shadow_score: number | null
          tsac_shadow_verdict: string | null
          tsac_verification_ids: string[] | null
          updated_at: string
        }
        Insert: {
          auto_initiated?: boolean | null
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string
          initiated_by?: Database["public"]["Enums"]["evolution_initiator"]
          metadata?: Json | null
          phase?: Database["public"]["Enums"]["evolution_phase"]
          plan_id: string
          receipt_id?: string | null
          risk_level?:
            | Database["public"]["Enums"]["evolution_risk_level"]
            | null
          run_id?: string
          tsac_drift_detected?: boolean | null
          tsac_pre_criteria?: Json | null
          tsac_pre_score?: number | null
          tsac_pre_verdict?: string | null
          tsac_production_score?: number | null
          tsac_production_verdict?: string | null
          tsac_shadow_score?: number | null
          tsac_shadow_verdict?: string | null
          tsac_verification_ids?: string[] | null
          updated_at?: string
        }
        Update: {
          auto_initiated?: boolean | null
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string
          initiated_by?: Database["public"]["Enums"]["evolution_initiator"]
          metadata?: Json | null
          phase?: Database["public"]["Enums"]["evolution_phase"]
          plan_id?: string
          receipt_id?: string | null
          risk_level?:
            | Database["public"]["Enums"]["evolution_risk_level"]
            | null
          run_id?: string
          tsac_drift_detected?: boolean | null
          tsac_pre_criteria?: Json | null
          tsac_pre_score?: number | null
          tsac_pre_verdict?: string | null
          tsac_production_score?: number | null
          tsac_production_verdict?: string | null
          tsac_shadow_score?: number | null
          tsac_shadow_verdict?: string | null
          tsac_verification_ids?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      evolution_snapshots: {
        Row: {
          created_at: string
          id: string
          pre_metrics: Json | null
          proposal_id: string | null
          restorable: boolean
          restored_at: string | null
          restored_by: string | null
          snapshot_id: string
          state_hash: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pre_metrics?: Json | null
          proposal_id?: string | null
          restorable?: boolean
          restored_at?: string | null
          restored_by?: string | null
          snapshot_id: string
          state_hash?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pre_metrics?: Json | null
          proposal_id?: string | null
          restorable?: boolean
          restored_at?: string | null
          restored_by?: string | null
          snapshot_id?: string
          state_hash?: string | null
          tenant_id?: string
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
      gate_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_ms: number | null
          failed_count: number
          git_branch: string | null
          git_sha: string | null
          id: string
          metadata: Json | null
          pass_results: Json
          passed_count: number
          skipped_count: number
          status: string
          total_passes: number
          triggered_by: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          failed_count?: number
          git_branch?: string | null
          git_sha?: string | null
          id?: string
          metadata?: Json | null
          pass_results?: Json
          passed_count?: number
          skipped_count?: number
          status?: string
          total_passes?: number
          triggered_by?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          failed_count?: number
          git_branch?: string | null
          git_sha?: string | null
          id?: string
          metadata?: Json | null
          pass_results?: Json
          passed_count?: number
          skipped_count?: number
          status?: string
          total_passes?: number
          triggered_by?: string | null
        }
        Relationships: []
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
      governance_audit_log: {
        Row: {
          affected_subsystems: Json
          auto_reverted: boolean
          changed_by: string | null
          created_at: string
          id: string
          new_mode: string
          previous_mode: string
          reason: string
          ttl_minutes: number | null
        }
        Insert: {
          affected_subsystems?: Json
          auto_reverted?: boolean
          changed_by?: string | null
          created_at?: string
          id?: string
          new_mode: string
          previous_mode: string
          reason: string
          ttl_minutes?: number | null
        }
        Update: {
          affected_subsystems?: Json
          auto_reverted?: boolean
          changed_by?: string | null
          created_at?: string
          id?: string
          new_mode?: string
          previous_mode?: string
          reason?: string
          ttl_minutes?: number | null
        }
        Relationships: []
      }
      governance_compliance_reports: {
        Row: {
          checks_performed: number
          compliant: boolean
          created_at: string
          id: string
          mode: string
          score: number
          violations: Json
        }
        Insert: {
          checks_performed?: number
          compliant?: boolean
          created_at?: string
          id?: string
          mode: string
          score?: number
          violations?: Json
        }
        Update: {
          checks_performed?: number
          compliant?: boolean
          created_at?: string
          id?: string
          mode?: string
          score?: number
          violations?: Json
        }
        Relationships: []
      }
      governance_issued_vetoes: {
        Row: {
          created_at: string
          id: string
          scope: string
          veto_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          scope: string
          veto_id: string
        }
        Update: {
          created_at?: string
          id?: string
          scope?: string
          veto_id?: string
        }
        Relationships: []
      }
      governance_mode: {
        Row: {
          changed_at: string
          changed_by: string | null
          created_at: string
          expires_at: string | null
          id: string
          mode: string
          reason: string
          ttl_minutes: number | null
          updated_at: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          mode?: string
          reason?: string
          ttl_minutes?: number | null
          updated_at?: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          mode?: string
          reason?: string
          ttl_minutes?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      governance_transition_approvals: {
        Row: {
          approvals: Json
          approvals_required: number
          created_at: string
          expires_at: string
          from_mode: string
          id: string
          requested_by: string
          status: string
          to_mode: string
        }
        Insert: {
          approvals?: Json
          approvals_required?: number
          created_at?: string
          expires_at?: string
          from_mode: string
          id?: string
          requested_by: string
          status?: string
          to_mode: string
        }
        Update: {
          approvals?: Json
          approvals_required?: number
          created_at?: string
          expires_at?: string
          from_mode?: string
          id?: string
          requested_by?: string
          status?: string
          to_mode?: string
        }
        Relationships: []
      }
      governance_transition_log: {
        Row: {
          actor: string
          created_at: string
          from_mode: string
          id: string
          to_mode: string
        }
        Insert: {
          actor: string
          created_at?: string
          from_mode: string
          id?: string
          to_mode: string
        }
        Update: {
          actor?: string
          created_at?: string
          from_mode?: string
          id?: string
          to_mode?: string
        }
        Relationships: []
      }
      governance_transition_votes: {
        Row: {
          approved_at: string
          approver: string
          id: string
          request_id: string
        }
        Insert: {
          approved_at?: string
          approver: string
          id?: string
          request_id: string
        }
        Update: {
          approved_at?: string
          approver?: string
          id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "governance_transition_votes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "governance_transition_approvals"
            referencedColumns: ["id"]
          },
        ]
      }
      immune_escalations: {
        Row: {
          claimed_by: string | null
          created_at: string
          executor: string
          id: string
          module: string
          payload: Json
          resolution_note: string | null
          resolved_at: string | null
          scope: string
          severity: string
          status: string
        }
        Insert: {
          claimed_by?: string | null
          created_at?: string
          executor: string
          id?: string
          module: string
          payload?: Json
          resolution_note?: string | null
          resolved_at?: string | null
          scope: string
          severity: string
          status?: string
        }
        Update: {
          claimed_by?: string | null
          created_at?: string
          executor?: string
          id?: string
          module?: string
          payload?: Json
          resolution_note?: string | null
          resolved_at?: string | null
          scope?: string
          severity?: string
          status?: string
        }
        Relationships: []
      }
      immune_intelligence_events: {
        Row: {
          created_at: string
          duration_ms: number | null
          escalation_severity: string | null
          executor_id: string
          failure_signature_hash: string | null
          id: string
          is_shadow_mesh: boolean
          meta: Json | null
          mode: string
          outcome: string
          repair_type: string | null
          rule_id: string | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          escalation_severity?: string | null
          executor_id: string
          failure_signature_hash?: string | null
          id?: string
          is_shadow_mesh?: boolean
          meta?: Json | null
          mode?: string
          outcome: string
          repair_type?: string | null
          rule_id?: string | null
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          escalation_severity?: string | null
          executor_id?: string
          failure_signature_hash?: string | null
          id?: string
          is_shadow_mesh?: boolean
          meta?: Json | null
          mode?: string
          outcome?: string
          repair_type?: string | null
          rule_id?: string | null
        }
        Relationships: []
      }
      immune_metrics: {
        Row: {
          escalations: number
          executor: string
          id: string
          repair_attempted: boolean
          repair_success: boolean
          repair_successes: number
          repair_type: string | null
          retry_attempted: boolean
          run_at: string
          safe_failures: number
          total_runs: number
        }
        Insert: {
          escalations?: number
          executor: string
          id?: string
          repair_attempted?: boolean
          repair_success?: boolean
          repair_successes?: number
          repair_type?: string | null
          retry_attempted?: boolean
          run_at?: string
          safe_failures?: number
          total_runs?: number
        }
        Update: {
          escalations?: number
          executor?: string
          id?: string
          repair_attempted?: boolean
          repair_success?: boolean
          repair_successes?: number
          repair_type?: string | null
          retry_attempted?: boolean
          run_at?: string
          safe_failures?: number
          total_runs?: number
        }
        Relationships: []
      }
      immunity_mesh_runs: {
        Row: {
          ended_at: string | null
          escalations: number
          id: string
          mode: string
          notes: string | null
          repair_failures: number
          repaired: number
          run_window: string
          safe_fails: number
          started_at: string
          total_events: number
        }
        Insert: {
          ended_at?: string | null
          escalations?: number
          id?: string
          mode?: string
          notes?: string | null
          repair_failures?: number
          repaired?: number
          run_window?: string
          safe_fails?: number
          started_at?: string
          total_events?: number
        }
        Update: {
          ended_at?: string | null
          escalations?: number
          id?: string
          mode?: string
          notes?: string | null
          repair_failures?: number
          repaired?: number
          run_window?: string
          safe_fails?: number
          started_at?: string
          total_events?: number
        }
        Relationships: []
      }
      immunity_rule_conflicts: {
        Row: {
          conflict_type: string
          detected_at: string
          id: string
          notes: string | null
          resolution: string
          rule_a_id: string
          rule_b_id: string
        }
        Insert: {
          conflict_type?: string
          detected_at?: string
          id?: string
          notes?: string | null
          resolution?: string
          rule_a_id: string
          rule_b_id: string
        }
        Update: {
          conflict_type?: string
          detected_at?: string
          id?: string
          notes?: string | null
          resolution?: string
          rule_a_id?: string
          rule_b_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "immunity_rule_conflicts_rule_a_id_fkey"
            columns: ["rule_a_id"]
            isOneToOne: false
            referencedRelation: "immunity_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "immunity_rule_conflicts_rule_b_id_fkey"
            columns: ["rule_b_id"]
            isOneToOne: false
            referencedRelation: "immunity_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      immunity_rule_invocations: {
        Row: {
          cost_units: number
          created_at: string
          duration_ms: number
          executor: string
          id: string
          outcome: string
          rule_id: string
        }
        Insert: {
          cost_units?: number
          created_at?: string
          duration_ms?: number
          executor: string
          id?: string
          outcome?: string
          rule_id: string
        }
        Update: {
          cost_units?: number
          created_at?: string
          duration_ms?: number
          executor?: string
          id?: string
          outcome?: string
          rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "immunity_rule_invocations_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "immunity_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      immunity_rule_lineage: {
        Row: {
          child_rule_id: string
          created_at: string
          id: string
          parent_rule_id: string
          relation: string
        }
        Insert: {
          child_rule_id: string
          created_at?: string
          id?: string
          parent_rule_id: string
          relation?: string
        }
        Update: {
          child_rule_id?: string
          created_at?: string
          id?: string
          parent_rule_id?: string
          relation?: string
        }
        Relationships: [
          {
            foreignKeyName: "immunity_rule_lineage_child_rule_id_fkey"
            columns: ["child_rule_id"]
            isOneToOne: false
            referencedRelation: "immunity_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "immunity_rule_lineage_parent_rule_id_fkey"
            columns: ["parent_rule_id"]
            isOneToOne: false
            referencedRelation: "immunity_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      immunity_rule_propagation: {
        Row: {
          adopted_at: string
          adoption_confidence: number
          from_executor: string
          id: string
          rule_id: string
          to_executor: string
        }
        Insert: {
          adopted_at?: string
          adoption_confidence?: number
          from_executor: string
          id?: string
          rule_id: string
          to_executor: string
        }
        Update: {
          adopted_at?: string
          adoption_confidence?: number
          from_executor?: string
          id?: string
          rule_id?: string
          to_executor?: string
        }
        Relationships: [
          {
            foreignKeyName: "immunity_rule_propagation_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "immunity_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      immunity_rules: {
        Row: {
          category: string
          confidence: number
          created_at: string
          id: string
          invocations_24h: number
          invocations_7d: number
          last_seen_at: string | null
          promoted_at: string | null
          retired_at: string | null
          rule_key: string
          source_executor: string
          status: string
          success_rate: number
        }
        Insert: {
          category?: string
          confidence?: number
          created_at?: string
          id?: string
          invocations_24h?: number
          invocations_7d?: number
          last_seen_at?: string | null
          promoted_at?: string | null
          retired_at?: string | null
          rule_key: string
          source_executor: string
          status?: string
          success_rate?: number
        }
        Update: {
          category?: string
          confidence?: number
          created_at?: string
          id?: string
          invocations_24h?: number
          invocations_7d?: number
          last_seen_at?: string | null
          promoted_at?: string | null
          retired_at?: string | null
          rule_key?: string
          source_executor?: string
          status?: string
          success_rate?: number
        }
        Relationships: []
      }
      integration_audit_log: {
        Row: {
          adapter_id: string | null
          command: string | null
          connection_id: string | null
          created_at: string
          entry_type: string
          error_message: string | null
          governance: Json | null
          id: string
          outcome: string
          params: Json | null
        }
        Insert: {
          adapter_id?: string | null
          command?: string | null
          connection_id?: string | null
          created_at?: string
          entry_type: string
          error_message?: string | null
          governance?: Json | null
          id?: string
          outcome: string
          params?: Json | null
        }
        Update: {
          adapter_id?: string | null
          command?: string | null
          connection_id?: string | null
          created_at?: string
          entry_type?: string
          error_message?: string | null
          governance?: Json | null
          id?: string
          outcome?: string
          params?: Json | null
        }
        Relationships: []
      }
      integration_command_mappings: {
        Row: {
          active: boolean
          adapter_id: string
          created_at: string
          description: string | null
          execution_count: number | null
          governance_level: string
          id: string
          last_executed_at: string | null
          terminal_command: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          adapter_id: string
          created_at?: string
          description?: string | null
          execution_count?: number | null
          governance_level?: string
          id?: string
          last_executed_at?: string | null
          terminal_command: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          adapter_id?: string
          created_at?: string
          description?: string | null
          execution_count?: number | null
          governance_level?: string
          id?: string
          last_executed_at?: string | null
          terminal_command?: string
          updated_at?: string
        }
        Relationships: []
      }
      integration_connections: {
        Row: {
          adapter_category: string
          adapter_name: string
          adapter_type: string
          adapter_version: string | null
          capabilities: Json | null
          config: Json | null
          created_at: string
          credentials_ref: string | null
          error_message: string | null
          id: string
          last_latency_ms: number | null
          last_tested_at: string | null
          mode: string
          status: string
          updated_at: string
        }
        Insert: {
          adapter_category: string
          adapter_name: string
          adapter_type: string
          adapter_version?: string | null
          capabilities?: Json | null
          config?: Json | null
          created_at?: string
          credentials_ref?: string | null
          error_message?: string | null
          id?: string
          last_latency_ms?: number | null
          last_tested_at?: string | null
          mode?: string
          status?: string
          updated_at?: string
        }
        Update: {
          adapter_category?: string
          adapter_name?: string
          adapter_type?: string
          adapter_version?: string | null
          capabilities?: Json | null
          config?: Json | null
          created_at?: string
          credentials_ref?: string | null
          error_message?: string | null
          id?: string
          last_latency_ms?: number | null
          last_tested_at?: string | null
          mode?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      integration_discoveries: {
        Row: {
          adapter_id: string
          depth: string
          discovered_at: string
          id: string
          metadata: Json | null
          status: string | null
          target: string
        }
        Insert: {
          adapter_id: string
          depth?: string
          discovered_at?: string
          id?: string
          metadata?: Json | null
          status?: string | null
          target: string
        }
        Update: {
          adapter_id?: string
          depth?: string
          discovered_at?: string
          id?: string
          metadata?: Json | null
          status?: string | null
          target?: string
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
      integrity_findings: {
        Row: {
          category: string
          created_at: string
          file_path: string | null
          id: string
          message: string
          scan_id: string
          severity: string
          suggested_fix: string | null
        }
        Insert: {
          category: string
          created_at?: string
          file_path?: string | null
          id?: string
          message: string
          scan_id: string
          severity: string
          suggested_fix?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          file_path?: string | null
          id?: string
          message?: string
          scan_id?: string
          severity?: string
          suggested_fix?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrity_findings_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "integrity_scan_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      integrity_scan_runs: {
        Row: {
          created_at: string
          duration_ms: number | null
          errors_found: number
          health_score: number
          id: string
          mode: string
          warnings_found: number
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          errors_found?: number
          health_score?: number
          id?: string
          mode?: string
          warnings_found?: number
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          errors_found?: number
          health_score?: number
          id?: string
          mode?: string
          warnings_found?: number
        }
        Relationships: []
      }
      ip_reputation: {
        Row: {
          blocked_count: number | null
          challenge_count: number | null
          country: string | null
          created_at: string
          fingerprint_family: string | null
          id: string
          ip: string
          last_seen: string
          metadata: Json | null
          provider: string | null
          risk_level: string | null
          score: number
          total_requests: number | null
          updated_at: string
        }
        Insert: {
          blocked_count?: number | null
          challenge_count?: number | null
          country?: string | null
          created_at?: string
          fingerprint_family?: string | null
          id?: string
          ip: string
          last_seen?: string
          metadata?: Json | null
          provider?: string | null
          risk_level?: string | null
          score?: number
          total_requests?: number | null
          updated_at?: string
        }
        Update: {
          blocked_count?: number | null
          challenge_count?: number | null
          country?: string | null
          created_at?: string
          fingerprint_family?: string | null
          id?: string
          ip?: string
          last_seen?: string
          metadata?: Json | null
          provider?: string | null
          risk_level?: string | null
          score?: number
          total_requests?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      lead_captures: {
        Row: {
          created_at: string
          email: string
          id: string
          page_url: string | null
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          page_url?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          page_url?: string | null
          source?: string | null
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
      licensing_inquiries: {
        Row: {
          created_at: string | null
          email: string
          id: string
          license_interest: string | null
          message: string | null
          name: string
          organization: string | null
          responded_at: string | null
          role: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          license_interest?: string | null
          message?: string | null
          name: string
          organization?: string | null
          responded_at?: string | null
          role?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          license_interest?: string | null
          message?: string | null
          name?: string
          organization?: string | null
          responded_at?: string | null
          role?: string | null
          status?: string | null
        }
        Relationships: []
      }
      lovable_ai_usage: {
        Row: {
          calls_used: number
          category: string | null
          created_at: string
          date: string
          id: string
          tokens_used: number
          updated_at: string
        }
        Insert: {
          calls_used?: number
          category?: string | null
          created_at?: string
          date?: string
          id?: string
          tokens_used?: number
          updated_at?: string
        }
        Update: {
          calls_used?: number
          category?: string | null
          created_at?: string
          date?: string
          id?: string
          tokens_used?: number
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_notification_config: {
        Row: {
          atlas_notifications: boolean
          created_at: string
          cron_schedule: string | null
          email_recipients: string[]
          enabled: boolean
          id: string
          notify_on_failure: boolean
          notify_on_partial: boolean
          notify_on_success: boolean
          updated_at: string
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          atlas_notifications?: boolean
          created_at?: string
          cron_schedule?: string | null
          email_recipients?: string[]
          enabled?: boolean
          id?: string
          notify_on_failure?: boolean
          notify_on_partial?: boolean
          notify_on_success?: boolean
          updated_at?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          atlas_notifications?: boolean
          created_at?: string
          cron_schedule?: string | null
          email_recipients?: string[]
          enabled?: boolean
          id?: string
          notify_on_failure?: boolean
          notify_on_partial?: boolean
          notify_on_success?: boolean
          updated_at?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      maintenance_reports: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_ms: number | null
          engine: string
          findings: Json
          id: string
          metadata: Json | null
          pass_results: Json | null
          status: string
          summary: Json
          trigger_source: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          engine: string
          findings?: Json
          id?: string
          metadata?: Json | null
          pass_results?: Json | null
          status?: string
          summary?: Json
          trigger_source?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          engine?: string
          findings?: Json
          id?: string
          metadata?: Json | null
          pass_results?: Json | null
          status?: string
          summary?: Json
          trigger_source?: string
        }
        Relationships: []
      }
      marketplace_generated_templates: {
        Row: {
          ai_provider: string | null
          category: string
          code: string
          created_at: string
          description: string | null
          difficulty: string
          download_count: number | null
          downloaded_at: string | null
          estimated_value_cents: number | null
          features: string[] | null
          id: string
          metadata: Json | null
          name: string
          rarity: string
          session_id: string
          user_id: string
        }
        Insert: {
          ai_provider?: string | null
          category: string
          code: string
          created_at?: string
          description?: string | null
          difficulty: string
          download_count?: number | null
          downloaded_at?: string | null
          estimated_value_cents?: number | null
          features?: string[] | null
          id: string
          metadata?: Json | null
          name: string
          rarity: string
          session_id: string
          user_id: string
        }
        Update: {
          ai_provider?: string | null
          category?: string
          code?: string
          created_at?: string
          description?: string | null
          difficulty?: string
          download_count?: number | null
          downloaded_at?: string | null
          estimated_value_cents?: number | null
          features?: string[] | null
          id?: string
          metadata?: Json | null
          name?: string
          rarity?: string
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      marketplace_licenses: {
        Row: {
          activated: boolean | null
          activated_at: string | null
          activated_domain: string | null
          amount_paid: number | null
          created_at: string
          id: string
          license_key_hash: string
          license_key_prefix: string
          product_id: string | null
          product_type: string
          purchaser_email: string
          stripe_customer_id: string | null
          stripe_session_id: string
          template_name: string | null
          updated_at: string
        }
        Insert: {
          activated?: boolean | null
          activated_at?: string | null
          activated_domain?: string | null
          amount_paid?: number | null
          created_at?: string
          id?: string
          license_key_hash: string
          license_key_prefix: string
          product_id?: string | null
          product_type: string
          purchaser_email: string
          stripe_customer_id?: string | null
          stripe_session_id: string
          template_name?: string | null
          updated_at?: string
        }
        Update: {
          activated?: boolean | null
          activated_at?: string | null
          activated_domain?: string | null
          amount_paid?: number | null
          created_at?: string
          id?: string
          license_key_hash?: string
          license_key_prefix?: string
          product_id?: string | null
          product_type?: string
          purchaser_email?: string
          stripe_customer_id?: string | null
          stripe_session_id?: string
          template_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      marketplace_mailing_list: {
        Row: {
          email: string
          id: string
          is_active: boolean | null
          preferences: Json | null
          subscribed_at: string | null
          unsubscribed_at: string | null
          user_id: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean | null
          preferences?: Json | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
          user_id?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean | null
          preferences?: Json | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      marketplace_purchases: {
        Row: {
          download_count: number | null
          id: string
          last_downloaded_at: string | null
          license_key: string | null
          metadata: Json | null
          price_cents: number
          purchased_at: string | null
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          template_id: string
          template_name: string
          user_id: string
        }
        Insert: {
          download_count?: number | null
          id?: string
          last_downloaded_at?: string | null
          license_key?: string | null
          metadata?: Json | null
          price_cents: number
          purchased_at?: string | null
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          template_id: string
          template_name: string
          user_id: string
        }
        Update: {
          download_count?: number | null
          id?: string
          last_downloaded_at?: string | null
          license_key?: string | null
          metadata?: Json | null
          price_cents?: number
          purchased_at?: string | null
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          template_id?: string
          template_name?: string
          user_id?: string
        }
        Relationships: []
      }
      marketplace_release_alerts: {
        Row: {
          alert_method: string | null
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          user_id: string
        }
        Insert: {
          alert_method?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id: string
        }
        Update: {
          alert_method?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      marketplace_saved_templates: {
        Row: {
          id: string
          notes: string | null
          saved_at: string | null
          template_id: string
          user_id: string
        }
        Insert: {
          id?: string
          notes?: string | null
          saved_at?: string | null
          template_id: string
          user_id: string
        }
        Update: {
          id?: string
          notes?: string | null
          saved_at?: string | null
          template_id?: string
          user_id?: string
        }
        Relationships: []
      }
      marketplace_template_stats: {
        Row: {
          id: string
          like_count: number | null
          preview_count: number | null
          purchase_count: number | null
          template_id: string
          trending_score: number | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          id?: string
          like_count?: number | null
          preview_count?: number | null
          purchase_count?: number | null
          template_id: string
          trending_score?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          id?: string
          like_count?: number | null
          preview_count?: number | null
          purchase_count?: number | null
          template_id?: string
          trending_score?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      marketplace_user_interests: {
        Row: {
          created_at: string | null
          id: string
          interaction_type: string
          metadata: Json | null
          template_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_type: string
          metadata?: Json | null
          template_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_type?: string
          metadata?: Json | null
          template_id?: string
          user_id?: string
        }
        Relationships: []
      }
      mesh_capability_recommendations: {
        Row: {
          applied_at: string | null
          confidence_score: number
          created_at: string
          gap_id: string | null
          id: string
          proposed_accepts: string[]
          proposed_description: string
          proposed_domains: string[]
          proposed_produces: string[]
          proposed_resolver_id: string
          reasoning: string | null
          status: string
          target_module: string
        }
        Insert: {
          applied_at?: string | null
          confidence_score?: number
          created_at?: string
          gap_id?: string | null
          id?: string
          proposed_accepts?: string[]
          proposed_description: string
          proposed_domains?: string[]
          proposed_produces?: string[]
          proposed_resolver_id: string
          reasoning?: string | null
          status?: string
          target_module: string
        }
        Update: {
          applied_at?: string | null
          confidence_score?: number
          created_at?: string
          gap_id?: string | null
          id?: string
          proposed_accepts?: string[]
          proposed_description?: string
          proposed_domains?: string[]
          proposed_produces?: string[]
          proposed_resolver_id?: string
          reasoning?: string | null
          status?: string
          target_module?: string
        }
        Relationships: [
          {
            foreignKeyName: "mesh_capability_recommendations_gap_id_fkey"
            columns: ["gap_id"]
            isOneToOne: false
            referencedRelation: "mesh_discovery_gaps"
            referencedColumns: ["id"]
          },
        ]
      }
      mesh_discovery_gaps: {
        Row: {
          available_resolvers: number
          created_at: string
          domains: string[]
          frequency: number
          gap_severity: string
          id: string
          intent_type: string
          last_seen_at: string
          missing_modules: string[]
          needed_outputs: string[]
          resolved_by_capability: string | null
          responding_resolvers: number
          source_module: string
          status: string
        }
        Insert: {
          available_resolvers?: number
          created_at?: string
          domains?: string[]
          frequency?: number
          gap_severity?: string
          id?: string
          intent_type: string
          last_seen_at?: string
          missing_modules?: string[]
          needed_outputs?: string[]
          resolved_by_capability?: string | null
          responding_resolvers?: number
          source_module: string
          status?: string
        }
        Update: {
          available_resolvers?: number
          created_at?: string
          domains?: string[]
          frequency?: number
          gap_severity?: string
          id?: string
          intent_type?: string
          last_seen_at?: string
          missing_modules?: string[]
          needed_outputs?: string[]
          resolved_by_capability?: string | null
          responding_resolvers?: number
          source_module?: string
          status?: string
        }
        Relationships: []
      }
      mesh_discovery_runs: {
        Row: {
          capabilities_expanded: number
          created_at: string
          duration_ms: number
          gaps_found: number
          id: string
          modules_analyzed: number
          recommendations_generated: number
          run_type: string
          summary: Json | null
        }
        Insert: {
          capabilities_expanded?: number
          created_at?: string
          duration_ms?: number
          gaps_found?: number
          id?: string
          modules_analyzed?: number
          recommendations_generated?: number
          run_type?: string
          summary?: Json | null
        }
        Update: {
          capabilities_expanded?: number
          created_at?: string
          duration_ms?: number
          gaps_found?: number
          id?: string
          modules_analyzed?: number
          recommendations_generated?: number
          run_type?: string
          summary?: Json | null
        }
        Relationships: []
      }
      mesh_intents: {
        Row: {
          created_at: string
          duration_ms: number | null
          error_message: string | null
          governance_mode: string
          id: string
          input_summary: Json | null
          intent_type: string
          output_summary: Json | null
          resolved_by: string[]
          source_module: string
          success: boolean
          target_modules: string[]
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          governance_mode?: string
          id?: string
          input_summary?: Json | null
          intent_type: string
          output_summary?: Json | null
          resolved_by?: string[]
          source_module: string
          success?: boolean
          target_modules?: string[]
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          governance_mode?: string
          id?: string
          input_summary?: Json | null
          intent_type?: string
          output_summary?: Json | null
          resolved_by?: string[]
          source_module?: string
          success?: boolean
          target_modules?: string[]
        }
        Relationships: []
      }
      mesh_saved_pipelines: {
        Row: {
          created_at: string
          description: string | null
          discovered_from: string | null
          domains: string[]
          governance_mode: string
          id: string
          input_template: Json | null
          intent_type: string
          is_active: boolean | null
          last_run_at: string | null
          name: string
          resolver_chain: string[]
          run_count: number | null
          source_module: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discovered_from?: string | null
          domains?: string[]
          governance_mode?: string
          id?: string
          input_template?: Json | null
          intent_type: string
          is_active?: boolean | null
          last_run_at?: string | null
          name: string
          resolver_chain?: string[]
          run_count?: number | null
          source_module: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discovered_from?: string | null
          domains?: string[]
          governance_mode?: string
          id?: string
          input_template?: Json | null
          intent_type?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name?: string
          resolver_chain?: string[]
          run_count?: number | null
          source_module?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mesh_saved_pipelines_discovered_from_fkey"
            columns: ["discovered_from"]
            isOneToOne: false
            referencedRelation: "mesh_intents"
            referencedColumns: ["id"]
          },
        ]
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
      modernizer_autonomy_log: {
        Row: {
          action: string
          auto_approved: boolean
          confidence: number
          created_at: string
          id: string
          mode: string | null
          plan_id: string | null
          reason: string | null
          result: Json | null
          system_health_after: number | null
          system_health_before: number | null
        }
        Insert: {
          action: string
          auto_approved?: boolean
          confidence: number
          created_at?: string
          id?: string
          mode?: string | null
          plan_id?: string | null
          reason?: string | null
          result?: Json | null
          system_health_after?: number | null
          system_health_before?: number | null
        }
        Update: {
          action?: string
          auto_approved?: boolean
          confidence?: number
          created_at?: string
          id?: string
          mode?: string | null
          plan_id?: string | null
          reason?: string | null
          result?: Json | null
          system_health_after?: number | null
          system_health_before?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "modernizer_autonomy_log_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "substrate_upgrade_plans"
            referencedColumns: ["id"]
          },
        ]
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
      module_registry: {
        Row: {
          boot_order: number
          capabilities: string[] | null
          category: string
          circuit_state: string
          config: Json | null
          created_at: string
          dependencies: string[] | null
          dependents: string[] | null
          eligible_for_upgrade: boolean | null
          file_paths: Json | null
          health_score: number
          id: string
          last_error: string | null
          last_seen: string | null
          last_success: string | null
          metadata: Json | null
          name: string
          production_supported: boolean | null
          roles: string[] | null
          shadow_supported: boolean | null
          status: string
          updated_at: string
          version: string
        }
        Insert: {
          boot_order?: number
          capabilities?: string[] | null
          category?: string
          circuit_state?: string
          config?: Json | null
          created_at?: string
          dependencies?: string[] | null
          dependents?: string[] | null
          eligible_for_upgrade?: boolean | null
          file_paths?: Json | null
          health_score?: number
          id?: string
          last_error?: string | null
          last_seen?: string | null
          last_success?: string | null
          metadata?: Json | null
          name: string
          production_supported?: boolean | null
          roles?: string[] | null
          shadow_supported?: boolean | null
          status?: string
          updated_at?: string
          version?: string
        }
        Update: {
          boot_order?: number
          capabilities?: string[] | null
          category?: string
          circuit_state?: string
          config?: Json | null
          created_at?: string
          dependencies?: string[] | null
          dependents?: string[] | null
          eligible_for_upgrade?: boolean | null
          file_paths?: Json | null
          health_score?: number
          id?: string
          last_error?: string | null
          last_seen?: string | null
          last_success?: string | null
          metadata?: Json | null
          name?: string
          production_supported?: boolean | null
          roles?: string[] | null
          shadow_supported?: boolean | null
          status?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      module_sounding_board: {
        Row: {
          body: string
          confidence: number | null
          created_at: string
          governor_action_at: string | null
          governor_rationale: string | null
          governor_status: string | null
          id: string
          metadata: Json | null
          module_slug: string
          post_type: string
          severity: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          confidence?: number | null
          created_at?: string
          governor_action_at?: string | null
          governor_rationale?: string | null
          governor_status?: string | null
          id?: string
          metadata?: Json | null
          module_slug: string
          post_type: string
          severity?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          confidence?: number | null
          created_at?: string
          governor_action_at?: string | null
          governor_rationale?: string | null
          governor_status?: string | null
          id?: string
          metadata?: Json | null
          module_slug?: string
          post_type?: string
          severity?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mutation_proposals: {
        Row: {
          artifact_id: string
          auto_promote: boolean
          canary_pct: number | null
          created_at: string
          decided_at: string | null
          expected_delta: Json | null
          gate_state: string
          hypothesis: string | null
          id: string
          metadata: Json | null
          promoted_at: string | null
          proposer_executor_id: string | null
          risk_score: number | null
          rolled_back_at: string | null
          updated_at: string
        }
        Insert: {
          artifact_id: string
          auto_promote?: boolean
          canary_pct?: number | null
          created_at?: string
          decided_at?: string | null
          expected_delta?: Json | null
          gate_state?: string
          hypothesis?: string | null
          id?: string
          metadata?: Json | null
          promoted_at?: string | null
          proposer_executor_id?: string | null
          risk_score?: number | null
          rolled_back_at?: string | null
          updated_at?: string
        }
        Update: {
          artifact_id?: string
          auto_promote?: boolean
          canary_pct?: number | null
          created_at?: string
          decided_at?: string | null
          expected_delta?: Json | null
          gate_state?: string
          hypothesis?: string | null
          id?: string
          metadata?: Json | null
          promoted_at?: string | null
          proposer_executor_id?: string | null
          risk_score?: number | null
          rolled_back_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mutation_proposals_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "change_artifacts"
            referencedColumns: ["id"]
          },
        ]
      }
      mutation_receipts: {
        Row: {
          created_at: string
          details_json: Json | null
          id: string
          outcome: string
          promotion_id: string | null
          stage: string
        }
        Insert: {
          created_at?: string
          details_json?: Json | null
          id?: string
          outcome: string
          promotion_id?: string | null
          stage: string
        }
        Update: {
          created_at?: string
          details_json?: Json | null
          id?: string
          outcome?: string
          promotion_id?: string | null
          stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "mutation_receipts_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "production_promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      mutation_runs: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          metrics_baseline: Json | null
          metrics_candidate: Json | null
          metrics_delta: Json | null
          mutation_id: string
          regressions: Json | null
          run_duration_ms: number | null
          shadow_run_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          metrics_baseline?: Json | null
          metrics_candidate?: Json | null
          metrics_delta?: Json | null
          mutation_id: string
          regressions?: Json | null
          run_duration_ms?: number | null
          shadow_run_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          metrics_baseline?: Json | null
          metrics_candidate?: Json | null
          metrics_delta?: Json | null
          mutation_id?: string
          regressions?: Json | null
          run_duration_ms?: number | null
          shadow_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mutation_runs_mutation_id_fkey"
            columns: ["mutation_id"]
            isOneToOne: false
            referencedRelation: "mutation_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      nexus_anomalies: {
        Row: {
          anomaly_type: string
          created_at: string
          description: string
          id: string
          metrics: Json | null
          provider_id: string | null
          resolved: boolean
          resolved_at: string | null
          severity: string
        }
        Insert: {
          anomaly_type: string
          created_at?: string
          description: string
          id?: string
          metrics?: Json | null
          provider_id?: string | null
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
        }
        Update: {
          anomaly_type?: string
          created_at?: string
          description?: string
          id?: string
          metrics?: Json | null
          provider_id?: string | null
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
        }
        Relationships: []
      }
      nexus_cost_ledger: {
        Row: {
          date: string
          estimated_cost_usd: number
          id: string
          provider_id: string
          task_breakdown: Json
          total_calls: number
          total_tokens: number
          updated_at: string
        }
        Insert: {
          date?: string
          estimated_cost_usd?: number
          id?: string
          provider_id: string
          task_breakdown?: Json
          total_calls?: number
          total_tokens?: number
          updated_at?: string
        }
        Update: {
          date?: string
          estimated_cost_usd?: number
          id?: string
          provider_id?: string
          task_breakdown?: Json
          total_calls?: number
          total_tokens?: number
          updated_at?: string
        }
        Relationships: []
      }
      nexus_hourly_snapshots: {
        Row: {
          active_developer_count: number | null
          available_for_clm: number
          clm_calls_dispatched: number | null
          created_at: string | null
          id: string
          optimization_strategy: string | null
          provider_breakdown: Json | null
          reserved_for_active_devs: number
          reserved_for_chatbots: number
          reserved_for_substrate: number
          snapshot_hour: string
          total_capacity: number
          used_today: number
        }
        Insert: {
          active_developer_count?: number | null
          available_for_clm?: number
          clm_calls_dispatched?: number | null
          created_at?: string | null
          id?: string
          optimization_strategy?: string | null
          provider_breakdown?: Json | null
          reserved_for_active_devs?: number
          reserved_for_chatbots?: number
          reserved_for_substrate?: number
          snapshot_hour: string
          total_capacity?: number
          used_today?: number
        }
        Update: {
          active_developer_count?: number | null
          available_for_clm?: number
          clm_calls_dispatched?: number | null
          created_at?: string | null
          id?: string
          optimization_strategy?: string | null
          provider_breakdown?: Json | null
          reserved_for_active_devs?: number
          reserved_for_chatbots?: number
          reserved_for_substrate?: number
          snapshot_hour?: string
          total_capacity?: number
          used_today?: number
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
      nexus_provider_affinity: {
        Row: {
          avg_latency_ms: number | null
          avg_quality_score: number | null
          failure_count: number
          id: string
          provider_id: string
          success_count: number
          task_type: string
          updated_at: string
          weight: number
        }
        Insert: {
          avg_latency_ms?: number | null
          avg_quality_score?: number | null
          failure_count?: number
          id?: string
          provider_id: string
          success_count?: number
          task_type: string
          updated_at?: string
          weight?: number
        }
        Update: {
          avg_latency_ms?: number | null
          avg_quality_score?: number | null
          failure_count?: number
          id?: string
          provider_id?: string
          success_count?: number
          task_type?: string
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      nexus_provider_health: {
        Row: {
          circuit_opened_at: string | null
          circuit_state: string
          consecutive_failures: number
          error_counts: Json
          health_score: number
          id: string
          last_fail_time: string | null
          last_success_time: string | null
          latency_samples: number[] | null
          p50_latency_ms: number | null
          p95_latency_ms: number | null
          p99_latency_ms: number | null
          provider_id: string
          task_affinity: Json
          total_calls: number
          total_successes: number
          updated_at: string
        }
        Insert: {
          circuit_opened_at?: string | null
          circuit_state?: string
          consecutive_failures?: number
          error_counts?: Json
          health_score?: number
          id?: string
          last_fail_time?: string | null
          last_success_time?: string | null
          latency_samples?: number[] | null
          p50_latency_ms?: number | null
          p95_latency_ms?: number | null
          p99_latency_ms?: number | null
          provider_id: string
          task_affinity?: Json
          total_calls?: number
          total_successes?: number
          updated_at?: string
        }
        Update: {
          circuit_opened_at?: string | null
          circuit_state?: string
          consecutive_failures?: number
          error_counts?: Json
          health_score?: number
          id?: string
          last_fail_time?: string | null
          last_success_time?: string | null
          latency_samples?: number[] | null
          p50_latency_ms?: number | null
          p95_latency_ms?: number | null
          p99_latency_ms?: number | null
          provider_id?: string
          task_affinity?: Json
          total_calls?: number
          total_successes?: number
          updated_at?: string
        }
        Relationships: []
      }
      nexus_provider_limits: {
        Row: {
          avg_failure_threshold: number | null
          confidence: number | null
          discovered_rpd: number | null
          discovered_rpm: number | null
          discovery_phase: string | null
          exhaustion_count: number | null
          id: string
          last_exhaustion_at: string | null
          last_updated: string | null
          metadata: Json | null
          provider: string
          stated_rpd: number
        }
        Insert: {
          avg_failure_threshold?: number | null
          confidence?: number | null
          discovered_rpd?: number | null
          discovered_rpm?: number | null
          discovery_phase?: string | null
          exhaustion_count?: number | null
          id?: string
          last_exhaustion_at?: string | null
          last_updated?: string | null
          metadata?: Json | null
          provider: string
          stated_rpd?: number
        }
        Update: {
          avg_failure_threshold?: number | null
          confidence?: number | null
          discovered_rpd?: number | null
          discovered_rpm?: number | null
          discovery_phase?: string | null
          exhaustion_count?: number | null
          id?: string
          last_exhaustion_at?: string | null
          last_updated?: string | null
          metadata?: Json | null
          provider?: string
          stated_rpd?: number
        }
        Relationships: []
      }
      nexus_traces: {
        Row: {
          attempt_number: number | null
          completion_tokens: number | null
          cost_estimate_usd: number | null
          created_at: string
          error_category: string | null
          error_message: string | null
          fallback_chain: string[] | null
          id: string
          latency_ms: number | null
          metadata: Json | null
          model: string | null
          priority: string | null
          prompt_hash: string | null
          prompt_tokens: number | null
          provider_id: string
          quality_score: number | null
          status: string
          task_type: string | null
          temperature: number | null
          total_tokens: number | null
          trace_id: string
        }
        Insert: {
          attempt_number?: number | null
          completion_tokens?: number | null
          cost_estimate_usd?: number | null
          created_at?: string
          error_category?: string | null
          error_message?: string | null
          fallback_chain?: string[] | null
          id?: string
          latency_ms?: number | null
          metadata?: Json | null
          model?: string | null
          priority?: string | null
          prompt_hash?: string | null
          prompt_tokens?: number | null
          provider_id: string
          quality_score?: number | null
          status?: string
          task_type?: string | null
          temperature?: number | null
          total_tokens?: number | null
          trace_id: string
        }
        Update: {
          attempt_number?: number | null
          completion_tokens?: number | null
          cost_estimate_usd?: number | null
          created_at?: string
          error_category?: string | null
          error_message?: string | null
          fallback_chain?: string[] | null
          id?: string
          latency_ms?: number | null
          metadata?: Json | null
          model?: string | null
          priority?: string | null
          prompt_hash?: string | null
          prompt_tokens?: number | null
          provider_id?: string
          quality_score?: number | null
          status?: string
          task_type?: string | null
          temperature?: number | null
          total_tokens?: number | null
          trace_id?: string
        }
        Relationships: []
      }
      owner_reports: {
        Row: {
          created_at: string
          full_html: string
          full_plaintext: string
          generation_time_ms: number | null
          id: string
          metrics: Json
          report_window_end: string
          report_window_start: string
          status: string
          subject: string
          system_status: string
          version: string | null
        }
        Insert: {
          created_at?: string
          full_html: string
          full_plaintext: string
          generation_time_ms?: number | null
          id?: string
          metrics?: Json
          report_window_end: string
          report_window_start: string
          status?: string
          subject: string
          system_status?: string
          version?: string | null
        }
        Update: {
          created_at?: string
          full_html?: string
          full_plaintext?: string
          generation_time_ms?: number | null
          id?: string
          metrics?: Json
          report_window_end?: string
          report_window_start?: string
          status?: string
          subject?: string
          system_status?: string
          version?: string | null
        }
        Relationships: []
      }
      passkey_challenges: {
        Row: {
          challenge: string
          created_at: string
          expires_at: string
          id: string
          used: boolean | null
        }
        Insert: {
          challenge: string
          created_at?: string
          expires_at?: string
          id?: string
          used?: boolean | null
        }
        Update: {
          challenge?: string
          created_at?: string
          expires_at?: string
          id?: string
          used?: boolean | null
        }
        Relationships: []
      }
      passkey_credentials: {
        Row: {
          created_at: string
          credential_id: string
          device_type: string | null
          email: string
          id: string
          last_used_at: string | null
          public_key: string
          sign_count: number | null
          transports: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          credential_id: string
          device_type?: string | null
          email: string
          id?: string
          last_used_at?: string | null
          public_key: string
          sign_count?: number | null
          transports?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          credential_id?: string
          device_type?: string | null
          email?: string
          id?: string
          last_used_at?: string | null
          public_key?: string
          sign_count?: number | null
          transports?: string[] | null
          user_id?: string
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
          secret_hash: string
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
          secret_hash: string
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
          secret_hash?: string
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
      production_promotions: {
        Row: {
          completed_at: string | null
          created_at: string
          failure_reason: string | null
          id: string
          integrity_scan_id: string | null
          post_snapshot_id: string | null
          pre_snapshot_id: string | null
          rollback_triggered: boolean | null
          shadow_run_id: string | null
          status: string
          verification_passed: boolean | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          failure_reason?: string | null
          id?: string
          integrity_scan_id?: string | null
          post_snapshot_id?: string | null
          pre_snapshot_id?: string | null
          rollback_triggered?: boolean | null
          shadow_run_id?: string | null
          status?: string
          verification_passed?: boolean | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          failure_reason?: string | null
          id?: string
          integrity_scan_id?: string | null
          post_snapshot_id?: string | null
          pre_snapshot_id?: string | null
          rollback_triggered?: boolean | null
          shadow_run_id?: string | null
          status?: string
          verification_passed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "production_promotions_post_snapshot_id_fkey"
            columns: ["post_snapshot_id"]
            isOneToOne: false
            referencedRelation: "system_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_promotions_pre_snapshot_id_fkey"
            columns: ["pre_snapshot_id"]
            isOneToOne: false
            referencedRelation: "system_snapshots"
            referencedColumns: ["id"]
          },
        ]
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
      proposal_meta: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          authority_required: string | null
          confidence: number | null
          created_at: string | null
          dependencies: string[] | null
          evidentiary_basis: Json | null
          id: string
          impact_estimate: string | null
          module_target: string | null
          proposal_id: string
          proposal_origin: string | null
          proposal_scope: string | null
          proposal_type: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          reverse_dependencies: string[] | null
          risk_level: string | null
          rollback_strategy: string | null
          test_coverage: number | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          authority_required?: string | null
          confidence?: number | null
          created_at?: string | null
          dependencies?: string[] | null
          evidentiary_basis?: Json | null
          id?: string
          impact_estimate?: string | null
          module_target?: string | null
          proposal_id: string
          proposal_origin?: string | null
          proposal_scope?: string | null
          proposal_type?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          reverse_dependencies?: string[] | null
          risk_level?: string | null
          rollback_strategy?: string | null
          test_coverage?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          authority_required?: string | null
          confidence?: number | null
          created_at?: string | null
          dependencies?: string[] | null
          evidentiary_basis?: Json | null
          id?: string
          impact_estimate?: string | null
          module_target?: string | null
          proposal_id?: string
          proposal_origin?: string | null
          proposal_scope?: string | null
          proposal_type?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          reverse_dependencies?: string[] | null
          risk_level?: string | null
          rollback_strategy?: string | null
          test_coverage?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quarry_assets: {
        Row: {
          asset_key: string
          asset_type: Database["public"]["Enums"]["quarry_asset_type"]
          category: string | null
          created_at: string
          description: string | null
          differentiation: number | null
          future_release: boolean | null
          id: string
          maintenance_load: number | null
          metadata: Json | null
          name: string
          revenue_impact: number | null
          stability: number | null
          strategic_weight: number | null
          tags: string[] | null
          tier: Database["public"]["Enums"]["quarry_tier"]
          updated_at: string
          value_density: number | null
          visibility: Database["public"]["Enums"]["quarry_visibility"]
        }
        Insert: {
          asset_key: string
          asset_type: Database["public"]["Enums"]["quarry_asset_type"]
          category?: string | null
          created_at?: string
          description?: string | null
          differentiation?: number | null
          future_release?: boolean | null
          id?: string
          maintenance_load?: number | null
          metadata?: Json | null
          name: string
          revenue_impact?: number | null
          stability?: number | null
          strategic_weight?: number | null
          tags?: string[] | null
          tier?: Database["public"]["Enums"]["quarry_tier"]
          updated_at?: string
          value_density?: number | null
          visibility?: Database["public"]["Enums"]["quarry_visibility"]
        }
        Update: {
          asset_key?: string
          asset_type?: Database["public"]["Enums"]["quarry_asset_type"]
          category?: string | null
          created_at?: string
          description?: string | null
          differentiation?: number | null
          future_release?: boolean | null
          id?: string
          maintenance_load?: number | null
          metadata?: Json | null
          name?: string
          revenue_impact?: number | null
          stability?: number | null
          strategic_weight?: number | null
          tags?: string[] | null
          tier?: Database["public"]["Enums"]["quarry_tier"]
          updated_at?: string
          value_density?: number | null
          visibility?: Database["public"]["Enums"]["quarry_visibility"]
        }
        Relationships: []
      }
      radio_broadcasts: {
        Row: {
          audio_url: string | null
          broadcast_date: string
          created_at: string
          duration_seconds: number | null
          error_message: string | null
          generation_cost_estimate: number | null
          id: string
          regeneration_attempts: number | null
          script_json: Json
          status: string
          tts_duration_ms: number | null
          updated_at: string
          voice_mapping: Json | null
        }
        Insert: {
          audio_url?: string | null
          broadcast_date?: string
          created_at?: string
          duration_seconds?: number | null
          error_message?: string | null
          generation_cost_estimate?: number | null
          id?: string
          regeneration_attempts?: number | null
          script_json?: Json
          status?: string
          tts_duration_ms?: number | null
          updated_at?: string
          voice_mapping?: Json | null
        }
        Update: {
          audio_url?: string | null
          broadcast_date?: string
          created_at?: string
          duration_seconds?: number | null
          error_message?: string | null
          generation_cost_estimate?: number | null
          id?: string
          regeneration_attempts?: number | null
          script_json?: Json
          status?: string
          tts_duration_ms?: number | null
          updated_at?: string
          voice_mapping?: Json | null
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
      ripple_circuit_breakers: {
        Row: {
          created_at: string | null
          failure_count: number | null
          half_open_at: string | null
          id: string
          last_failure_at: string | null
          last_success_at: string | null
          opened_at: string | null
          state: string | null
          subscriber_action: string
          subscriber_key: string
          subscriber_module: string
          success_count: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          failure_count?: number | null
          half_open_at?: string | null
          id?: string
          last_failure_at?: string | null
          last_success_at?: string | null
          opened_at?: string | null
          state?: string | null
          subscriber_action: string
          subscriber_key: string
          subscriber_module: string
          success_count?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          failure_count?: number | null
          half_open_at?: string | null
          id?: string
          last_failure_at?: string | null
          last_success_at?: string | null
          opened_at?: string | null
          state?: string | null
          subscriber_action?: string
          subscriber_key?: string
          subscriber_module?: string
          success_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ripple_events: {
        Row: {
          correlation_id: string | null
          created_at: string | null
          event_type: string
          fan_out_count: number | null
          id: string
          last_fan_out_at: string | null
          payload: Json | null
          processed: boolean | null
          processed_at: string | null
          publisher_module: string | null
          status: string | null
          topic: string
        }
        Insert: {
          correlation_id?: string | null
          created_at?: string | null
          event_type: string
          fan_out_count?: number | null
          id?: string
          last_fan_out_at?: string | null
          payload?: Json | null
          processed?: boolean | null
          processed_at?: string | null
          publisher_module?: string | null
          status?: string | null
          topic: string
        }
        Update: {
          correlation_id?: string | null
          created_at?: string | null
          event_type?: string
          fan_out_count?: number | null
          id?: string
          last_fan_out_at?: string | null
          payload?: Json | null
          processed?: boolean | null
          processed_at?: string | null
          publisher_module?: string | null
          status?: string | null
          topic?: string
        }
        Relationships: []
      }
      ripple_jobs: {
        Row: {
          attempts: number | null
          completed_at: string | null
          correlation_id: string | null
          created_at: string | null
          error_log: Json | null
          event_id: string | null
          id: string
          max_attempts: number | null
          payload: Json | null
          priority: number | null
          queue_name: string
          result: Json | null
          scheduled_for: string | null
          started_at: string | null
          status: string | null
          subscriber_action: string | null
          subscriber_module: string | null
          updated_at: string | null
        }
        Insert: {
          attempts?: number | null
          completed_at?: string | null
          correlation_id?: string | null
          created_at?: string | null
          error_log?: Json | null
          event_id?: string | null
          id?: string
          max_attempts?: number | null
          payload?: Json | null
          priority?: number | null
          queue_name: string
          result?: Json | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: string | null
          subscriber_action?: string | null
          subscriber_module?: string | null
          updated_at?: string | null
        }
        Update: {
          attempts?: number | null
          completed_at?: string | null
          correlation_id?: string | null
          created_at?: string | null
          error_log?: Json | null
          event_id?: string | null
          id?: string
          max_attempts?: number | null
          payload?: Json | null
          priority?: number | null
          queue_name?: string
          result?: Json | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: string | null
          subscriber_action?: string | null
          subscriber_module?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ripple_subscriptions: {
        Row: {
          backoff_strategy: string | null
          circuit_state: string | null
          consecutive_failures: number | null
          created_at: string | null
          filter_conditions: Json | null
          id: string
          is_active: boolean | null
          last_failure_at: string | null
          last_triggered_at: string | null
          max_attempts: number | null
          subscriber_action: string
          subscriber_module: string
          topic_id: string | null
          topic_name: string | null
          trigger_count: number | null
          updated_at: string | null
        }
        Insert: {
          backoff_strategy?: string | null
          circuit_state?: string | null
          consecutive_failures?: number | null
          created_at?: string | null
          filter_conditions?: Json | null
          id?: string
          is_active?: boolean | null
          last_failure_at?: string | null
          last_triggered_at?: string | null
          max_attempts?: number | null
          subscriber_action: string
          subscriber_module: string
          topic_id?: string | null
          topic_name?: string | null
          trigger_count?: number | null
          updated_at?: string | null
        }
        Update: {
          backoff_strategy?: string | null
          circuit_state?: string | null
          consecutive_failures?: number | null
          created_at?: string | null
          filter_conditions?: Json | null
          id?: string
          is_active?: boolean | null
          last_failure_at?: string | null
          last_triggered_at?: string | null
          max_attempts?: number | null
          subscriber_action?: string
          subscriber_module?: string
          topic_id?: string | null
          topic_name?: string | null
          trigger_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ripple_subscriptions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ripple_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      ripple_topics: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          retention_days: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          retention_days?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          retention_days?: number | null
        }
        Relationships: []
      }
      scan_finding_trends: {
        Row: {
          category_breakdown: Json | null
          created_at: string
          critical_count: number | null
          domain: string
          high_count: number | null
          id: string
          low_count: number | null
          medium_count: number | null
          scan_date: string
          score: number | null
          total_findings: number | null
        }
        Insert: {
          category_breakdown?: Json | null
          created_at?: string
          critical_count?: number | null
          domain: string
          high_count?: number | null
          id?: string
          low_count?: number | null
          medium_count?: number | null
          scan_date?: string
          score?: number | null
          total_findings?: number | null
        }
        Update: {
          category_breakdown?: Json | null
          created_at?: string
          critical_count?: number | null
          domain?: string
          high_count?: number | null
          id?: string
          low_count?: number | null
          medium_count?: number | null
          scan_date?: string
          score?: number | null
          total_findings?: number | null
        }
        Relationships: []
      }
      scan_results_cache: {
        Row: {
          created_at: string
          domain: string
          expires_at: string
          findings_count: number | null
          id: string
          metadata: Json | null
          result_data: Json
          scan_mode: string
          score: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          domain: string
          expires_at?: string
          findings_count?: number | null
          id?: string
          metadata?: Json | null
          result_data?: Json
          scan_mode?: string
          score?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          domain?: string
          expires_at?: string
          findings_count?: number | null
          id?: string
          metadata?: Json | null
          result_data?: Json
          scan_mode?: string
          score?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      scan_schedules: {
        Row: {
          created_at: string
          domain: string
          frequency: string
          id: string
          is_active: boolean | null
          last_run_at: string | null
          last_score: number | null
          next_run_at: string
          notify_email: string | null
          notify_on_change: boolean | null
          scan_mode: string
          score_delta: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          domain: string
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          last_score?: number | null
          next_run_at: string
          notify_email?: string | null
          notify_on_change?: boolean | null
          scan_mode?: string
          score_delta?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          domain?: string
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          last_score?: number | null
          next_run_at?: string
          notify_email?: string | null
          notify_on_change?: boolean | null
          scan_mode?: string
          score_delta?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scan_webhooks: {
        Row: {
          created_at: string
          events: string[]
          failure_count: number | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          secret: string | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          events?: string[]
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          secret?: string | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          events?: string[]
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          secret?: string | null
          updated_at?: string
          url?: string
          user_id?: string
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
      site_analytics_exclusions: {
        Row: {
          created_at: string
          exclusion_type: string
          id: string
          reason: string | null
          value: string
        }
        Insert: {
          created_at?: string
          exclusion_type: string
          id?: string
          reason?: string | null
          value: string
        }
        Update: {
          created_at?: string
          exclusion_type?: string
          id?: string
          reason?: string | null
          value?: string
        }
        Relationships: []
      }
      site_page_views: {
        Row: {
          browser: string | null
          browser_version: string | null
          city: string | null
          connection_type: string | null
          country: string | null
          created_at: string
          device_type: string | null
          entry_page: boolean | null
          exit_page: boolean | null
          fingerprint_hash: string | null
          id: string
          is_bounce: boolean | null
          language: string | null
          os: string | null
          os_version: string | null
          page_path: string
          page_title: string | null
          referrer: string | null
          referrer_domain: string | null
          screen_height: number | null
          screen_width: number | null
          scroll_depth_pct: number | null
          session_id: string
          time_on_page_ms: number | null
          timezone: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          viewport_height: number | null
          viewport_width: number | null
        }
        Insert: {
          browser?: string | null
          browser_version?: string | null
          city?: string | null
          connection_type?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          entry_page?: boolean | null
          exit_page?: boolean | null
          fingerprint_hash?: string | null
          id?: string
          is_bounce?: boolean | null
          language?: string | null
          os?: string | null
          os_version?: string | null
          page_path: string
          page_title?: string | null
          referrer?: string | null
          referrer_domain?: string | null
          screen_height?: number | null
          screen_width?: number | null
          scroll_depth_pct?: number | null
          session_id: string
          time_on_page_ms?: number | null
          timezone?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Update: {
          browser?: string | null
          browser_version?: string | null
          city?: string | null
          connection_type?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          entry_page?: boolean | null
          exit_page?: boolean | null
          fingerprint_hash?: string | null
          id?: string
          is_bounce?: boolean | null
          language?: string | null
          os?: string | null
          os_version?: string | null
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          referrer_domain?: string | null
          screen_height?: number | null
          screen_width?: number | null
          scroll_depth_pct?: number | null
          session_id?: string
          time_on_page_ms?: number | null
          timezone?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Relationships: []
      }
      site_sessions: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          device_type: string | null
          ended_at: string
          fingerprint_hash: string | null
          first_page: string | null
          id: string
          is_bounce: boolean | null
          language: string | null
          last_page: string | null
          os: string | null
          page_count: number | null
          referrer: string | null
          referrer_domain: string | null
          screen_height: number | null
          screen_width: number | null
          started_at: string
          timezone: string | null
          total_duration_ms: number | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          ended_at?: string
          fingerprint_hash?: string | null
          first_page?: string | null
          id: string
          is_bounce?: boolean | null
          language?: string | null
          last_page?: string | null
          os?: string | null
          page_count?: number | null
          referrer?: string | null
          referrer_domain?: string | null
          screen_height?: number | null
          screen_width?: number | null
          started_at?: string
          timezone?: string | null
          total_duration_ms?: number | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          ended_at?: string
          fingerprint_hash?: string | null
          first_page?: string | null
          id?: string
          is_bounce?: boolean | null
          language?: string | null
          last_page?: string | null
          os?: string | null
          page_count?: number | null
          referrer?: string | null
          referrer_domain?: string | null
          screen_height?: number | null
          screen_width?: number | null
          started_at?: string
          timezone?: string | null
          total_duration_ms?: number | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
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
      substrate_applied_improvements: {
        Row: {
          applied_at: string | null
          applied_in_plan: string | null
          applied_mode: string
          change_type: string
          created_at: string | null
          description: string | null
          id: string
          improvement_id: string | null
          improvement_key: string
          is_active: boolean | null
          module: string
          rolled_back_at: string | null
        }
        Insert: {
          applied_at?: string | null
          applied_in_plan?: string | null
          applied_mode?: string
          change_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          improvement_id?: string | null
          improvement_key: string
          is_active?: boolean | null
          module: string
          rolled_back_at?: string | null
        }
        Update: {
          applied_at?: string | null
          applied_in_plan?: string | null
          applied_mode?: string
          change_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          improvement_id?: string | null
          improvement_key?: string
          is_active?: boolean | null
          module?: string
          rolled_back_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "substrate_applied_improvements_applied_in_plan_fkey"
            columns: ["applied_in_plan"]
            isOneToOne: false
            referencedRelation: "substrate_upgrade_plans"
            referencedColumns: ["id"]
          },
        ]
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
      substrate_audit_log: {
        Row: {
          actor: string | null
          actor_role: string | null
          dry_run: boolean | null
          execution_ms: number | null
          id: string
          op: string
          payload_redacted: Json | null
          result_summary: string | null
          status: string
          target: string | null
          trace_id: string
          ts: string
        }
        Insert: {
          actor?: string | null
          actor_role?: string | null
          dry_run?: boolean | null
          execution_ms?: number | null
          id?: string
          op: string
          payload_redacted?: Json | null
          result_summary?: string | null
          status: string
          target?: string | null
          trace_id: string
          ts?: string
        }
        Update: {
          actor?: string | null
          actor_role?: string | null
          dry_run?: boolean | null
          execution_ms?: number | null
          id?: string
          op?: string
          payload_redacted?: Json | null
          result_summary?: string | null
          status?: string
          target?: string | null
          trace_id?: string
          ts?: string
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
      substrate_canaries: {
        Row: {
          created_at: string
          enabled: boolean
          env: string | null
          id: string
          metrics_json: Json | null
          percent: number
          revision_id: number | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          env?: string | null
          id: string
          metrics_json?: Json | null
          percent?: number
          revision_id?: number | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          env?: string | null
          id?: string
          metrics_json?: Json | null
          percent?: number
          revision_id?: number | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      substrate_capabilities: {
        Row: {
          enabled: boolean
          key: string
          notes: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          enabled?: boolean
          key: string
          notes?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          enabled?: boolean
          key?: string
          notes?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      substrate_cascade_history: {
        Row: {
          chain_json: Json
          confidence: number
          detected_at: string
          env: string | null
          id: string
          origin: string
          revision_id: number | null
          tenant_id: string | null
        }
        Insert: {
          chain_json?: Json
          confidence?: number
          detected_at?: string
          env?: string | null
          id?: string
          origin: string
          revision_id?: number | null
          tenant_id?: string | null
        }
        Update: {
          chain_json?: Json
          confidence?: number
          detected_at?: string
          env?: string | null
          id?: string
          origin?: string
          revision_id?: number | null
          tenant_id?: string | null
        }
        Relationships: []
      }
      substrate_changes: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          author: string | null
          change_type: string
          commit_hash: string | null
          created_at: string
          declined_reason: string | null
          description: string | null
          diff_summary: Json | null
          dispatched_at: string | null
          files_changed: string[] | null
          id: string
          lnchbl_status: string
          metadata: Json | null
          patch_id: string | null
          source: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          author?: string | null
          change_type?: string
          commit_hash?: string | null
          created_at?: string
          declined_reason?: string | null
          description?: string | null
          diff_summary?: Json | null
          dispatched_at?: string | null
          files_changed?: string[] | null
          id?: string
          lnchbl_status?: string
          metadata?: Json | null
          patch_id?: string | null
          source?: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          author?: string | null
          change_type?: string
          commit_hash?: string | null
          created_at?: string
          declined_reason?: string | null
          description?: string | null
          diff_summary?: Json | null
          dispatched_at?: string | null
          files_changed?: string[] | null
          id?: string
          lnchbl_status?: string
          metadata?: Json | null
          patch_id?: string | null
          source?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      substrate_chaos_rules: {
        Row: {
          config_json: Json | null
          created_at: string
          enabled: boolean
          env: string | null
          id: string
          probability: number
          revision_id: number | null
          target: string
          tenant_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          config_json?: Json | null
          created_at?: string
          enabled?: boolean
          env?: string | null
          id: string
          probability?: number
          revision_id?: number | null
          target: string
          tenant_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          config_json?: Json | null
          created_at?: string
          enabled?: boolean
          env?: string | null
          id?: string
          probability?: number
          revision_id?: number | null
          target?: string
          tenant_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      substrate_config: {
        Row: {
          env: string | null
          key: string
          revision_id: number | null
          tenant_id: string | null
          updated_at: string
          value: Json
        }
        Insert: {
          env?: string | null
          key: string
          revision_id?: number | null
          tenant_id?: string | null
          updated_at?: string
          value?: Json
        }
        Update: {
          env?: string | null
          key?: string
          revision_id?: number | null
          tenant_id?: string | null
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      substrate_cp_restore_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          env: string
          error_message: string | null
          id: string
          initiated_by: string | null
          replay_wal: boolean | null
          started_at: string | null
          status: string
          target_revision_id: number
          tenant_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          env?: string
          error_message?: string | null
          id?: string
          initiated_by?: string | null
          replay_wal?: boolean | null
          started_at?: string | null
          status?: string
          target_revision_id: number
          tenant_id?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          env?: string
          error_message?: string | null
          id?: string
          initiated_by?: string | null
          replay_wal?: boolean | null
          started_at?: string | null
          status?: string
          target_revision_id?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "substrate_cp_restore_jobs_target_revision_id_fkey"
            columns: ["target_revision_id"]
            isOneToOne: false
            referencedRelation: "substrate_cp_revisions"
            referencedColumns: ["revision_id"]
          },
        ]
      }
      substrate_cp_revisions: {
        Row: {
          created_at: string
          created_by: string | null
          domain_counts: Json | null
          env: string
          metadata: Json | null
          parent_revision_id: number | null
          revision_id: number
          snapshot_hash: string | null
          status: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          domain_counts?: Json | null
          env?: string
          metadata?: Json | null
          parent_revision_id?: number | null
          revision_id?: never
          snapshot_hash?: string | null
          status?: string
          tenant_id?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          domain_counts?: Json | null
          env?: string
          metadata?: Json | null
          parent_revision_id?: number | null
          revision_id?: never
          snapshot_hash?: string | null
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "substrate_cp_revisions_parent_revision_id_fkey"
            columns: ["parent_revision_id"]
            isOneToOne: false
            referencedRelation: "substrate_cp_revisions"
            referencedColumns: ["revision_id"]
          },
        ]
      }
      substrate_cp_snapshot_manifest: {
        Row: {
          created_at: string
          domain_counts: Json
          env: string
          id: string
          payload_hash: string | null
          revision_id: number
          tenant_id: string
        }
        Insert: {
          created_at?: string
          domain_counts?: Json
          env?: string
          id?: string
          payload_hash?: string | null
          revision_id: number
          tenant_id?: string
        }
        Update: {
          created_at?: string
          domain_counts?: Json
          env?: string
          id?: string
          payload_hash?: string | null
          revision_id?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "substrate_cp_snapshot_manifest_revision_id_fkey"
            columns: ["revision_id"]
            isOneToOne: false
            referencedRelation: "substrate_cp_revisions"
            referencedColumns: ["revision_id"]
          },
        ]
      }
      substrate_cp_wal: {
        Row: {
          action: string
          after_value: Json | null
          before_value: Json | null
          created_at: string
          domain: string
          env: string
          id: number
          key: string | null
          metadata: Json | null
          revision_id: number | null
          tenant_id: string
        }
        Insert: {
          action: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          domain: string
          env?: string
          id?: never
          key?: string | null
          metadata?: Json | null
          revision_id?: number | null
          tenant_id?: string
        }
        Update: {
          action?: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          domain?: string
          env?: string
          id?: never
          key?: string | null
          metadata?: Json | null
          revision_id?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "substrate_cp_wal_revision_id_fkey"
            columns: ["revision_id"]
            isOneToOne: false
            referencedRelation: "substrate_cp_revisions"
            referencedColumns: ["revision_id"]
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
      substrate_flags: {
        Row: {
          enabled: boolean
          env: string | null
          key: string
          metadata: Json | null
          revision_id: number | null
          rollout_percent: number
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          env?: string | null
          key: string
          metadata?: Json | null
          revision_id?: number | null
          rollout_percent?: number
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          env?: string | null
          key?: string
          metadata?: Json | null
          revision_id?: number | null
          rollout_percent?: number
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      substrate_health_log: {
        Row: {
          check_id: string
          created_at: string
          duration_ms: number | null
          id: string
          layers_checked: number
          layers_passed: number
          overall_verdict: string
          report: Json | null
          structural_issues: number
        }
        Insert: {
          check_id: string
          created_at?: string
          duration_ms?: number | null
          id?: string
          layers_checked?: number
          layers_passed?: number
          overall_verdict?: string
          report?: Json | null
          structural_issues?: number
        }
        Update: {
          check_id?: string
          created_at?: string
          duration_ms?: number | null
          id?: string
          layers_checked?: number
          layers_passed?: number
          overall_verdict?: string
          report?: Json | null
          structural_issues?: number
        }
        Relationships: []
      }
      substrate_heuristics: {
        Row: {
          category: string
          confidence: number | null
          created_at: string | null
          description: string | null
          heuristic_type: string
          id: string
          is_active: boolean | null
          is_global: boolean | null
          payload: Json | null
          source_agency_id: string | null
          source_task_id: string | null
          success_rate: number | null
          title: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category: string
          confidence?: number | null
          created_at?: string | null
          description?: string | null
          heuristic_type: string
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          payload?: Json | null
          source_agency_id?: string | null
          source_task_id?: string | null
          success_rate?: number | null
          title: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string
          confidence?: number | null
          created_at?: string | null
          description?: string | null
          heuristic_type?: string
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          payload?: Json | null
          source_agency_id?: string | null
          source_task_id?: string | null
          success_rate?: number | null
          title?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "substrate_heuristics_source_agency_id_fkey"
            columns: ["source_agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      substrate_idempotency: {
        Row: {
          created_at: string
          env: string | null
          expires_at: string
          key: string
          result_json: Json | null
          revision_id: number | null
          status: string
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          env?: string | null
          expires_at?: string
          key: string
          result_json?: Json | null
          revision_id?: number | null
          status?: string
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          env?: string | null
          expires_at?: string
          key?: string
          result_json?: Json | null
          revision_id?: number | null
          status?: string
          tenant_id?: string | null
        }
        Relationships: []
      }
      substrate_install_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value?: Json
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string
          id?: string
          updated_at?: string
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
          webhook_secret_hash: string | null
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
          webhook_secret_hash?: string | null
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
          webhook_secret_hash?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      substrate_leases: {
        Row: {
          acquired_at: string
          env: string
          expires_at: string
          lease_key: string
          owner_id: string
          renewed_at: string
          tenant_id: string
        }
        Insert: {
          acquired_at?: string
          env?: string
          expires_at: string
          lease_key: string
          owner_id: string
          renewed_at?: string
          tenant_id?: string
        }
        Update: {
          acquired_at?: string
          env?: string
          expires_at?: string
          lease_key?: string
          owner_id?: string
          renewed_at?: string
          tenant_id?: string
        }
        Relationships: []
      }
      substrate_licenses: {
        Row: {
          activated_at: string | null
          created_at: string | null
          customer_email: string
          customer_name: string | null
          expires_at: string | null
          id: string
          license_type: string
          organization: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_session_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          activated_at?: string | null
          created_at?: string | null
          customer_email: string
          customer_name?: string | null
          expires_at?: string | null
          id?: string
          license_type?: string
          organization?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          activated_at?: string | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string | null
          expires_at?: string | null
          id?: string
          license_type?: string
          organization?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      substrate_metrics_snapshot: {
        Row: {
          env: string | null
          labels_json: Json
          name: string
          revision_id: number | null
          tenant_id: string | null
          updated_at: string
          value: number
        }
        Insert: {
          env?: string | null
          labels_json?: Json
          name: string
          revision_id?: number | null
          tenant_id?: string | null
          updated_at?: string
          value?: number
        }
        Update: {
          env?: string | null
          labels_json?: Json
          name?: string
          revision_id?: number | null
          tenant_id?: string | null
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      substrate_queue_snapshot: {
        Row: {
          env: string | null
          id: string
          revision_id: number | null
          serialized_heap_json: Json
          stats_json: Json | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          env?: string | null
          id?: string
          revision_id?: number | null
          serialized_heap_json?: Json
          stats_json?: Json | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          env?: string | null
          id?: string
          revision_id?: number | null
          serialized_heap_json?: Json
          stats_json?: Json | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      substrate_retry_buckets: {
        Row: {
          env: string | null
          max_tokens: number
          module: string
          refill_rate: number
          revision_id: number | null
          stats_json: Json | null
          tenant_id: string | null
          tokens: number
          updated_at: string
        }
        Insert: {
          env?: string | null
          max_tokens?: number
          module: string
          refill_rate?: number
          revision_id?: number | null
          stats_json?: Json | null
          tenant_id?: string | null
          tokens?: number
          updated_at?: string
        }
        Update: {
          env?: string | null
          max_tokens?: number
          module?: string
          refill_rate?: number
          revision_id?: number | null
          stats_json?: Json | null
          tenant_id?: string | null
          tokens?: number
          updated_at?: string
        }
        Relationships: []
      }
      substrate_schema_registry: {
        Row: {
          entity: string
          env: string | null
          fields_json: Json
          migrations_json: Json
          registered_at: string
          revision_id: number | null
          tenant_id: string | null
          version: number
        }
        Insert: {
          entity: string
          env?: string | null
          fields_json?: Json
          migrations_json?: Json
          registered_at?: string
          revision_id?: number | null
          tenant_id?: string | null
          version?: number
        }
        Update: {
          entity?: string
          env?: string | null
          fields_json?: Json
          migrations_json?: Json
          registered_at?: string
          revision_id?: number | null
          tenant_id?: string | null
          version?: number
        }
        Relationships: []
      }
      substrate_sequence_outcomes: {
        Row: {
          created_at: string | null
          health_after: Json | null
          health_before: Json | null
          id: string
          metrics: Json | null
          notes: string | null
          outcome: string
          sequence_id: string | null
          step_id: string | null
        }
        Insert: {
          created_at?: string | null
          health_after?: Json | null
          health_before?: Json | null
          id?: string
          metrics?: Json | null
          notes?: string | null
          outcome: string
          sequence_id?: string | null
          step_id?: string | null
        }
        Update: {
          created_at?: string | null
          health_after?: Json | null
          health_before?: Json | null
          id?: string
          metrics?: Json | null
          notes?: string | null
          outcome?: string
          sequence_id?: string | null
          step_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "substrate_sequence_outcomes_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "substrate_sequences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substrate_sequence_outcomes_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "substrate_sequence_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      substrate_sequence_steps: {
        Row: {
          action: string
          completed_at: string | null
          depends_on: string[] | null
          estimated_cost: number | null
          estimated_value: number | null
          execution_time_ms: number | null
          id: string
          last_error: string | null
          metadata: Json | null
          module: string
          payload_template: Json | null
          risk_level: string | null
          sequence_id: string | null
          started_at: string | null
          status: string | null
          step_index: number
        }
        Insert: {
          action: string
          completed_at?: string | null
          depends_on?: string[] | null
          estimated_cost?: number | null
          estimated_value?: number | null
          execution_time_ms?: number | null
          id?: string
          last_error?: string | null
          metadata?: Json | null
          module: string
          payload_template?: Json | null
          risk_level?: string | null
          sequence_id?: string | null
          started_at?: string | null
          status?: string | null
          step_index: number
        }
        Update: {
          action?: string
          completed_at?: string | null
          depends_on?: string[] | null
          estimated_cost?: number | null
          estimated_value?: number | null
          execution_time_ms?: number | null
          id?: string
          last_error?: string | null
          metadata?: Json | null
          module?: string
          payload_template?: Json | null
          risk_level?: string | null
          sequence_id?: string | null
          started_at?: string | null
          status?: string | null
          step_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "substrate_sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "substrate_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      substrate_sequences: {
        Row: {
          completed_at: string | null
          completed_steps: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          failed_steps: number | null
          id: string
          metadata: Json | null
          mode: string | null
          name: string
          plan_id: string | null
          priority_score: number | null
          risk_level: string | null
          started_at: string | null
          status: string
          strategy_type: string
          total_steps: number | null
        }
        Insert: {
          completed_at?: string | null
          completed_steps?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          failed_steps?: number | null
          id?: string
          metadata?: Json | null
          mode?: string | null
          name: string
          plan_id?: string | null
          priority_score?: number | null
          risk_level?: string | null
          started_at?: string | null
          status?: string
          strategy_type?: string
          total_steps?: number | null
        }
        Update: {
          completed_at?: string | null
          completed_steps?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          failed_steps?: number | null
          id?: string
          metadata?: Json | null
          mode?: string | null
          name?: string
          plan_id?: string | null
          priority_score?: number | null
          risk_level?: string | null
          started_at?: string | null
          status?: string
          strategy_type?: string
          total_steps?: number | null
        }
        Relationships: []
      }
      substrate_templates: {
        Row: {
          action_sequence: Json | null
          created_at: string | null
          description: string | null
          id: string
          input_schema: Json | null
          is_active: boolean | null
          is_global: boolean | null
          name: string
          output_schema: Json | null
          preset_id: string | null
          source_agency_id: string | null
          success_rate: number | null
          template_type: string
          updated_at: string | null
          usage_count: number | null
          version: number | null
        }
        Insert: {
          action_sequence?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          input_schema?: Json | null
          is_active?: boolean | null
          is_global?: boolean | null
          name: string
          output_schema?: Json | null
          preset_id?: string | null
          source_agency_id?: string | null
          success_rate?: number | null
          template_type: string
          updated_at?: string | null
          usage_count?: number | null
          version?: number | null
        }
        Update: {
          action_sequence?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          input_schema?: Json | null
          is_active?: boolean | null
          is_global?: boolean | null
          name?: string
          output_schema?: Json | null
          preset_id?: string | null
          source_agency_id?: string | null
          success_rate?: number | null
          template_type?: string
          updated_at?: string | null
          usage_count?: number | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "substrate_templates_preset_id_fkey"
            columns: ["preset_id"]
            isOneToOne: false
            referencedRelation: "task_presets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substrate_templates_source_agency_id_fkey"
            columns: ["source_agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
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
          applied_at: string | null
          applied_by: string | null
          backup_id: string | null
          before_health_snapshot: Json | null
          confidence_score: number | null
          created_at: string
          diff_summary: Json | null
          estimated_blast_radius: string | null
          failsafe_backup_id: string | null
          id: string
          is_shadow: boolean | null
          mode: string
          operator_id: string | null
          operator_notes: string | null
          plan_type: string | null
          proposed_changes: Json | null
          risk_level: string | null
          safety_checks_passed: boolean | null
          scope: string
          status: string
          suggested_patches: Json | null
          updated_at: string | null
        }
        Insert: {
          after_health_snapshot?: Json | null
          applied_at?: string | null
          applied_by?: string | null
          backup_id?: string | null
          before_health_snapshot?: Json | null
          confidence_score?: number | null
          created_at?: string
          diff_summary?: Json | null
          estimated_blast_radius?: string | null
          failsafe_backup_id?: string | null
          id?: string
          is_shadow?: boolean | null
          mode?: string
          operator_id?: string | null
          operator_notes?: string | null
          plan_type?: string | null
          proposed_changes?: Json | null
          risk_level?: string | null
          safety_checks_passed?: boolean | null
          scope?: string
          status?: string
          suggested_patches?: Json | null
          updated_at?: string | null
        }
        Update: {
          after_health_snapshot?: Json | null
          applied_at?: string | null
          applied_by?: string | null
          backup_id?: string | null
          before_health_snapshot?: Json | null
          confidence_score?: number | null
          created_at?: string
          diff_summary?: Json | null
          estimated_blast_radius?: string | null
          failsafe_backup_id?: string | null
          id?: string
          is_shadow?: boolean | null
          mode?: string
          operator_id?: string | null
          operator_notes?: string | null
          plan_type?: string | null
          proposed_changes?: Json | null
          risk_level?: string | null
          safety_checks_passed?: boolean | null
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
      system_diffs: {
        Row: {
          created_at: string
          diff_patch_text: string | null
          diff_summary_json: Json | null
          from_snapshot_id: string | null
          id: string
          shadow_run_id: string | null
          to_snapshot_id: string | null
        }
        Insert: {
          created_at?: string
          diff_patch_text?: string | null
          diff_summary_json?: Json | null
          from_snapshot_id?: string | null
          id?: string
          shadow_run_id?: string | null
          to_snapshot_id?: string | null
        }
        Update: {
          created_at?: string
          diff_patch_text?: string | null
          diff_summary_json?: Json | null
          from_snapshot_id?: string | null
          id?: string
          shadow_run_id?: string | null
          to_snapshot_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_diffs_from_snapshot_id_fkey"
            columns: ["from_snapshot_id"]
            isOneToOne: false
            referencedRelation: "system_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_diffs_to_snapshot_id_fkey"
            columns: ["to_snapshot_id"]
            isOneToOne: false
            referencedRelation: "system_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      system_flags: {
        Row: {
          enabled: boolean
          key: string
          updated_at: string
          updated_by: string | null
          value: string | null
        }
        Insert: {
          enabled?: boolean
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: string | null
        }
        Update: {
          enabled?: boolean
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string | null
        }
        Relationships: []
      }
      system_metrics_history: {
        Row: {
          avg_executor_health: number | null
          cost_index: number | null
          encode_assist_rate: number | null
          escalation_rate: number | null
          id: string
          integrity_health_score: number | null
          latency_p95: number | null
          promoted_rule_count: number | null
          recorded_at: string
          retired_rule_count: number | null
          rollback_count: number | null
          rule_count: number | null
          success_rate: number | null
        }
        Insert: {
          avg_executor_health?: number | null
          cost_index?: number | null
          encode_assist_rate?: number | null
          escalation_rate?: number | null
          id?: string
          integrity_health_score?: number | null
          latency_p95?: number | null
          promoted_rule_count?: number | null
          recorded_at?: string
          retired_rule_count?: number | null
          rollback_count?: number | null
          rule_count?: number | null
          success_rate?: number | null
        }
        Update: {
          avg_executor_health?: number | null
          cost_index?: number | null
          encode_assist_rate?: number | null
          escalation_rate?: number | null
          id?: string
          integrity_health_score?: number | null
          latency_p95?: number | null
          promoted_rule_count?: number | null
          recorded_at?: string
          retired_rule_count?: number | null
          rollback_count?: number | null
          rule_count?: number | null
          success_rate?: number | null
        }
        Relationships: []
      }
      system_snapshots: {
        Row: {
          commit_hash: string | null
          created_at: string
          executor_hash: string | null
          file_manifest_hash: string | null
          id: string
          metrics_json: Json | null
          rule_hash: string | null
          type: string
        }
        Insert: {
          commit_hash?: string | null
          created_at?: string
          executor_hash?: string | null
          file_manifest_hash?: string | null
          id?: string
          metrics_json?: Json | null
          rule_hash?: string | null
          type: string
        }
        Update: {
          commit_hash?: string | null
          created_at?: string
          executor_hash?: string | null
          file_manifest_hash?: string | null
          id?: string
          metrics_json?: Json | null
          rule_hash?: string | null
          type?: string
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
      task_presets: {
        Row: {
          action_sequence: Json | null
          category: string
          created_at: string | null
          description: string | null
          estimated_cost_cents: number | null
          estimated_time_minutes: number | null
          estimated_value_cents: number | null
          id: string
          integrations_used: string[] | null
          is_active: boolean | null
          name: string
          output_format: string | null
          skill_required: string | null
          tags: string[] | null
          updated_at: string | null
          uses_execution_layer: boolean | null
        }
        Insert: {
          action_sequence?: Json | null
          category: string
          created_at?: string | null
          description?: string | null
          estimated_cost_cents?: number | null
          estimated_time_minutes?: number | null
          estimated_value_cents?: number | null
          id: string
          integrations_used?: string[] | null
          is_active?: boolean | null
          name: string
          output_format?: string | null
          skill_required?: string | null
          tags?: string[] | null
          updated_at?: string | null
          uses_execution_layer?: boolean | null
        }
        Update: {
          action_sequence?: Json | null
          category?: string
          created_at?: string | null
          description?: string | null
          estimated_cost_cents?: number | null
          estimated_time_minutes?: number | null
          estimated_value_cents?: number | null
          id?: string
          integrations_used?: string[] | null
          is_active?: boolean | null
          name?: string
          output_format?: string | null
          skill_required?: string | null
          tags?: string[] | null
          updated_at?: string | null
          uses_execution_layer?: boolean | null
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
      tsac_training_feedback: {
        Row: {
          created_at: string
          criteria_snapshot: Json
          drift_details: string | null
          drift_detected: boolean | null
          evolution_run_id: string | null
          executor_id: string
          failure_patterns: Json | null
          id: string
          learning_rule_generated: boolean | null
          learning_rule_id: string | null
          pre_score: number | null
          pre_verdict: string | null
          production_score: number | null
          production_verdict: string | null
          shadow_score: number | null
          shadow_verdict: string | null
          task_description: string
        }
        Insert: {
          created_at?: string
          criteria_snapshot?: Json
          drift_details?: string | null
          drift_detected?: boolean | null
          evolution_run_id?: string | null
          executor_id: string
          failure_patterns?: Json | null
          id?: string
          learning_rule_generated?: boolean | null
          learning_rule_id?: string | null
          pre_score?: number | null
          pre_verdict?: string | null
          production_score?: number | null
          production_verdict?: string | null
          shadow_score?: number | null
          shadow_verdict?: string | null
          task_description: string
        }
        Update: {
          created_at?: string
          criteria_snapshot?: Json
          drift_details?: string | null
          drift_detected?: boolean | null
          evolution_run_id?: string | null
          executor_id?: string
          failure_patterns?: Json | null
          id?: string
          learning_rule_generated?: boolean | null
          learning_rule_id?: string | null
          pre_score?: number | null
          pre_verdict?: string | null
          production_score?: number | null
          production_verdict?: string | null
          shadow_score?: number | null
          shadow_verdict?: string | null
          task_description?: string
        }
        Relationships: []
      }
      tsac_verifications: {
        Row: {
          acceptance_criteria: Json
          code_quality_score: number | null
          created_at: string
          criteria_results: Json
          evolution_run_id: string | null
          executor_id: string
          id: string
          intent_match_reasoning: string | null
          intent_match_score: number | null
          metadata: Json | null
          overall_verdict: string
          source: string
          task_description: string
          task_id: string
          verification_stage: string | null
        }
        Insert: {
          acceptance_criteria?: Json
          code_quality_score?: number | null
          created_at?: string
          criteria_results?: Json
          evolution_run_id?: string | null
          executor_id: string
          id?: string
          intent_match_reasoning?: string | null
          intent_match_score?: number | null
          metadata?: Json | null
          overall_verdict?: string
          source?: string
          task_description: string
          task_id: string
          verification_stage?: string | null
        }
        Update: {
          acceptance_criteria?: Json
          code_quality_score?: number | null
          created_at?: string
          criteria_results?: Json
          evolution_run_id?: string | null
          executor_id?: string
          id?: string
          intent_match_reasoning?: string | null
          intent_match_score?: number | null
          metadata?: Json | null
          overall_verdict?: string
          source?: string
          task_description?: string
          task_id?: string
          verification_stage?: string | null
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
      user_crystallized_entitlements: {
        Row: {
          asset_key: string
          granted_at: string
          id: string
          source: string
          user_id: string
        }
        Insert: {
          asset_key: string
          granted_at?: string
          id?: string
          source?: string
          user_id: string
        }
        Update: {
          asset_key?: string
          granted_at?: string
          id?: string
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_crystallized_entitlements_asset_key_fkey"
            columns: ["asset_key"]
            isOneToOne: false
            referencedRelation: "crystallized_assets"
            referencedColumns: ["asset_key"]
          },
        ]
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
      user_onboarding: {
        Row: {
          completed_at: string | null
          completed_steps: string[] | null
          created_at: string | null
          id: string
          step: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_steps?: string[] | null
          created_at?: string | null
          id?: string
          step?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_steps?: string[] | null
          created_at?: string | null
          id?: string
          step?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_pack_activations: {
        Row: {
          activated_at: string
          active: boolean
          created_at: string
          deactivated_at: string | null
          id: string
          pack_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string
          active?: boolean
          created_at?: string
          deactivated_at?: string | null
          id?: string
          pack_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string
          active?: boolean
          created_at?: string
          deactivated_at?: string | null
          id?: string
          pack_id?: string
          updated_at?: string
          user_id?: string
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
      vault_promotions: {
        Row: {
          category: string | null
          cjpi: number
          created_at: string
          description: string | null
          discovery_id: string
          export_ready: boolean | null
          id: string
          module_chain: string[] | null
          name: string
          promoted_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          run_id: string | null
          status: string | null
          tier: string | null
        }
        Insert: {
          category?: string | null
          cjpi: number
          created_at?: string
          description?: string | null
          discovery_id: string
          export_ready?: boolean | null
          id?: string
          module_chain?: string[] | null
          name: string
          promoted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          run_id?: string | null
          status?: string | null
          tier?: string | null
        }
        Update: {
          category?: string | null
          cjpi?: number
          created_at?: string
          description?: string | null
          discovery_id?: string
          export_ready?: boolean | null
          id?: string
          module_chain?: string[] | null
          name?: string
          promoted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          run_id?: string | null
          status?: string | null
          tier?: string | null
        }
        Relationships: []
      }
      verification_scans: {
        Row: {
          completed_at: string | null
          created_at: string
          gaps_found: number | null
          id: string
          mutation_id: string
          new_gaps: Json | null
          post_baseline: Json | null
          pre_baseline: Json | null
          scan_results: Json | null
          status: string
          tasks_created: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          gaps_found?: number | null
          id?: string
          mutation_id: string
          new_gaps?: Json | null
          post_baseline?: Json | null
          pre_baseline?: Json | null
          scan_results?: Json | null
          status?: string
          tasks_created?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          gaps_found?: number | null
          id?: string
          mutation_id?: string
          new_gaps?: Json | null
          post_baseline?: Json | null
          pre_baseline?: Json | null
          scan_results?: Json | null
          status?: string
          tasks_created?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_scans_mutation_id_fkey"
            columns: ["mutation_id"]
            isOneToOne: false
            referencedRelation: "mutation_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      vision_anomalies: {
        Row: {
          anomaly_type: string
          auto_action_taken: string | null
          baseline_value: number | null
          created_at: string
          details: Json
          detected_at: string
          detected_value: number | null
          deviation_percent: number | null
          id: string
          module: string
          resolution_action: string | null
          resolved: boolean
          resolved_at: string | null
          severity: string
        }
        Insert: {
          anomaly_type: string
          auto_action_taken?: string | null
          baseline_value?: number | null
          created_at?: string
          details?: Json
          detected_at?: string
          detected_value?: number | null
          deviation_percent?: number | null
          id?: string
          module: string
          resolution_action?: string | null
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
        }
        Update: {
          anomaly_type?: string
          auto_action_taken?: string | null
          baseline_value?: number | null
          created_at?: string
          details?: Json
          detected_at?: string
          detected_value?: number | null
          deviation_percent?: number | null
          id?: string
          module?: string
          resolution_action?: string | null
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
        }
        Relationships: []
      }
    }
    Views: {
      tsac_executor_stats: {
        Row: {
          avg_intent_score: number | null
          avg_quality_score: number | null
          executor_id: string | null
          fail_count: number | null
          last_verified: string | null
          partial_count: number | null
          pass_count: number | null
          pass_rate: number | null
          source: string | null
          total_verifications: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      activate_pack: {
        Args: { p_capacity: number; p_pack_id: string; p_user_id: string }
        Returns: Json
      }
      apply_confidence_decay: {
        Args: { p_agent_id: string; p_user_id: string }
        Returns: Json
      }
      calculate_memory_salience: {
        Args: {
          p_agent_id: string
          p_content: string
          p_memory_type: string
          p_user_id: string
        }
        Returns: number
      }
      calculate_memory_value: {
        Args: {
          p_access_count: number
          p_age_days: number
          p_decay_rate: number
          p_importance_score: number
        }
        Returns: number
      }
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
      can_use_crystallized: {
        Args: { p_asset_key: string; p_user_id: string }
        Returns: boolean
      }
      check_clarity_rate_limit: {
        Args: { p_api_key_hash: string }
        Returns: boolean
      }
      check_modernizer_quota: { Args: { p_user_id: string }; Returns: boolean }
      cleanup_expired_cache: { Args: never; Returns: undefined }
      cleanup_expired_challenges: { Args: never; Returns: undefined }
      cleanup_old_analytics: { Args: never; Returns: undefined }
      cleanup_old_daily_state: { Args: never; Returns: undefined }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      cleanup_retention: { Args: never; Returns: Json }
      compress_warm_memories: {
        Args: { p_agent_id: string; p_max_words?: number; p_user_id: string }
        Returns: Json
      }
      cp_acquire_lease: {
        Args: {
          p_env?: string
          p_lease_key: string
          p_owner_id: string
          p_tenant_id?: string
          p_ttl_seconds?: number
        }
        Returns: boolean
      }
      cp_commit_snapshot: {
        Args: {
          p_created_by?: string
          p_env?: string
          p_parent_revision_id?: number
          p_payload?: Json
          p_tenant_id?: string
          p_wal_events?: Json
        }
        Returns: Json
      }
      cp_release_lease: {
        Args: { p_lease_key: string; p_owner_id: string }
        Returns: boolean
      }
      cp_renew_lease: {
        Args: {
          p_lease_key: string
          p_owner_id: string
          p_ttl_seconds?: number
        }
        Returns: boolean
      }
      deactivate_pack: {
        Args: { p_pack_id: string; p_user_id: string }
        Returns: Json
      }
      detect_memory_contradictions: {
        Args: {
          p_agent_id: string
          p_new_content: string
          p_new_memory_id: string
          p_user_id: string
        }
        Returns: Json
      }
      detect_orphan_records: { Args: never; Returns: Json }
      detect_stale_scheduled_tasks: {
        Args: never
        Returns: {
          agency_id: string
          hours_overdue: number
          id: string
          last_run_at: string
          next_run_at: string
          task_type: string
          title: string
        }[]
      }
      generate_bot_sniper_api_key: {
        Args: { p_key_name: string; p_user_id: string }
        Returns: string
      }
      generate_clarity_api_key: {
        Args: { p_key_name: string; p_rate_limit?: number; p_user_id: string }
        Returns: Json
      }
      get_adaptive_memory_limits: {
        Args: { p_agent_id: string; p_user_id: string }
        Returns: {
          cold_limit: number
          hot_limit: number
          warm_limit: number
        }[]
      }
      get_discovery_stats: { Args: never; Returns: Json }
      get_public_live_stats: { Args: never; Returns: Json }
      governance_auto_revert: { Args: never; Returns: undefined }
      has_role:
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
        | { Args: { role_name: string }; Returns: boolean }
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
      increment_dream_rate_limit: {
        Args: { p_session_hash: string }
        Returns: undefined
      }
      increment_lovable_ai_usage: {
        Args: { p_calls?: number; p_category?: string; p_tokens?: number }
        Returns: undefined
      }
      is_clarity_team_admin: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_clarity_team_member: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_clarity_team_owner: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      nexus_cleanup_traces: { Args: never; Returns: undefined }
      nexus_record_cost: {
        Args: {
          p_cost_usd: number
          p_provider_id: string
          p_task_type: string
          p_tokens: number
        }
        Returns: undefined
      }
      nexus_update_affinity: {
        Args: {
          p_latency_ms: number
          p_provider_id: string
          p_quality: number
          p_success: boolean
          p_task_type: string
        }
        Returns: undefined
      }
      nexus_upsert_health: {
        Args: {
          p_circuit_state: string
          p_consecutive_failures: number
          p_error_counts: Json
          p_health_score: number
          p_p50: number
          p_p95: number
          p_p99: number
          p_provider_id: string
          p_task_affinity: Json
          p_total_calls: number
          p_total_successes: number
        }
        Returns: undefined
      }
      reset_daily_quotas: { Args: never; Returns: undefined }
      resolve_evolution_run: {
        Args: { p_ref: string }
        Returns: {
          plan_id: string
          run_id: string
        }[]
      }
      resolve_upgrade_plan_id: { Args: { p_ref: string }; Returns: string }
      run_memory_tiering: {
        Args: { p_agent_id: string; p_user_id: string }
        Returns: Json
      }
      run_metacognitive_assessment: {
        Args: { p_agent_id: string; p_user_id: string }
        Returns: Json
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      sm2_update_memory: {
        Args: { p_memory_id: string; p_quality: number; p_tier: string }
        Returns: Json
      }
      track_memory_recall: {
        Args: { p_agent_id: string; p_hit: boolean; p_user_id: string }
        Returns: undefined
      }
      track_template_interaction: {
        Args: { p_interaction_type: string; p_template_id: string }
        Returns: undefined
      }
      update_ip_reputation: {
        Args: { p_action: string; p_ip: string; p_risk_score?: number }
        Returns: undefined
      }
      update_user_fingerprint: {
        Args: {
          p_agent_id: string
          p_keywords?: string[]
          p_message_length: number
          p_user_id: string
        }
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
      vector_memory_search: {
        Args: {
          p_agent_id: string
          p_limit?: number
          p_min_similarity?: number
          p_query_embedding: string
          p_user_id: string
        }
        Returns: {
          content: string
          created_at: string
          id: string
          memory_type: string
          similarity: number
          tier: string
          value_score: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      dream_eater_mood:
        | "calm"
        | "curious"
        | "agitated"
        | "fractured"
        | "dormant"
        | "feral"
      evolution_initiator: "system" | "human"
      evolution_phase:
        | "planning"
        | "shadow_applied"
        | "production_applied"
        | "verified"
        | "aborted"
        | "failed"
      evolution_risk_level: "low" | "medium" | "high"
      quarry_asset_type:
        | "capability"
        | "engine"
        | "meta_engine"
        | "pipeline"
        | "template"
        | "agent"
        | "deployment_right"
        | "governance_tool"
        | "artifact_pack"
      quarry_tier: "free" | "creator" | "architect" | "enterprise" | "internal"
      quarry_visibility:
        | "hidden"
        | "tier_exposed"
        | "public_curated"
        | "baseline"
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
      dream_eater_mood: [
        "calm",
        "curious",
        "agitated",
        "fractured",
        "dormant",
        "feral",
      ],
      evolution_initiator: ["system", "human"],
      evolution_phase: [
        "planning",
        "shadow_applied",
        "production_applied",
        "verified",
        "aborted",
        "failed",
      ],
      evolution_risk_level: ["low", "medium", "high"],
      quarry_asset_type: [
        "capability",
        "engine",
        "meta_engine",
        "pipeline",
        "template",
        "agent",
        "deployment_right",
        "governance_tool",
        "artifact_pack",
      ],
      quarry_tier: ["free", "creator", "architect", "enterprise", "internal"],
      quarry_visibility: [
        "hidden",
        "tier_exposed",
        "public_curated",
        "baseline",
      ],
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
