CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_net";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'moderator',
    'user'
);


--
-- Name: calculate_next_scan_run(text, time without time zone, integer, integer, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_next_scan_run(p_frequency text, p_schedule_time time without time zone, p_schedule_day integer, p_schedule_date integer, p_from_time timestamp with time zone DEFAULT now()) RETURNS timestamp with time zone
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
DECLARE
  v_next_run TIMESTAMPTZ;
  v_base_date DATE;
  v_base_time TIMESTAMPTZ;
BEGIN
  v_base_date := p_from_time::DATE;
  
  CASE p_frequency
    WHEN 'daily' THEN
      v_base_time := v_base_date + p_schedule_time;
      IF v_base_time <= p_from_time THEN
        v_next_run := (v_base_date + INTERVAL '1 day') + p_schedule_time;
      ELSE
        v_next_run := v_base_time;
      END IF;
      
    WHEN 'weekly' THEN
      v_base_time := v_base_date + p_schedule_time;
      v_next_run := v_base_time + ((p_schedule_day - EXTRACT(DOW FROM v_base_date)::INTEGER + 7) % 7) * INTERVAL '1 day';
      IF v_next_run <= p_from_time THEN
        v_next_run := v_next_run + INTERVAL '7 days';
      END IF;
      
    WHEN 'monthly' THEN
      v_next_run := DATE_TRUNC('month', v_base_date) + (p_schedule_date - 1) * INTERVAL '1 day' + p_schedule_time;
      IF v_next_run <= p_from_time THEN
        v_next_run := DATE_TRUNC('month', v_base_date + INTERVAL '1 month') + (p_schedule_date - 1) * INTERVAL '1 day' + p_schedule_time;
      END IF;
  END CASE;
  
  RETURN v_next_run;
END;
$$;


--
-- Name: check_clarity_rate_limit(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_clarity_rate_limit(p_api_key_hash text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_rate_limit INTEGER;
  v_usage_count INTEGER;
  v_api_key_id UUID;
BEGIN
  -- Get API key details
  SELECT id, rate_limit_per_hour INTO v_api_key_id, v_rate_limit
  FROM public.pf_clarity_api_keys
  WHERE api_key_hash = p_api_key_hash AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Count usage in last hour
  SELECT COUNT(*) INTO v_usage_count
  FROM public.pf_clarity_api_usage
  WHERE api_key_id = v_api_key_id
    AND timestamp > now() - INTERVAL '1 hour';
  
  RETURN v_usage_count < v_rate_limit;
END;
$$;


--
-- Name: check_modernizer_quota(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_modernizer_quota(p_user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_limits RECORD;
BEGIN
  -- Get or create user limits
  INSERT INTO modernizer_user_limits (user_id, plan_tier, monthly_jobs_limit, monthly_jobs_used)
  VALUES (p_user_id, 'free', 3, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT * INTO v_limits
  FROM modernizer_user_limits
  WHERE user_id = p_user_id;
  
  -- Check if under limit
  IF v_limits.monthly_jobs_used < v_limits.monthly_jobs_limit THEN
    -- Increment usage counter
    UPDATE modernizer_user_limits
    SET monthly_jobs_used = monthly_jobs_used + 1
    WHERE user_id = p_user_id;
    
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;


--
-- Name: cleanup_expired_cache(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_expired_cache() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  DELETE FROM public.pf_media_cache
  WHERE ttl_expiration < now();
END;
$$;


--
-- Name: cleanup_old_daily_state(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_old_daily_state() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  DELETE FROM public.daily_state
  WHERE date_key < CURRENT_DATE - INTERVAL '7 days';
END;
$$;


--
-- Name: create_modernizer_limits(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_modernizer_limits() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.modernizer_user_limits (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;


--
-- Name: create_user_modernizer_limits(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_user_modernizer_limits() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO modernizer_user_limits (user_id, plan_tier, monthly_jobs_limit, monthly_jobs_used)
  VALUES (NEW.id, 'free', 3, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;


--
-- Name: generate_bot_sniper_api_key(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_bot_sniper_api_key(p_user_id uuid, p_key_name text) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'extensions'
    AS $$
DECLARE
  v_api_key TEXT;
  v_key_hash TEXT;
BEGIN
  -- Generate random API key
  v_api_key := 'bs_' || encode(gen_random_bytes(32), 'hex');
  v_key_hash := encode(digest(v_api_key, 'sha256'), 'hex');
  
  -- Insert into bot_sniper_api_keys table
  INSERT INTO public.bot_sniper_api_keys (user_id, key_name, api_key_hash)
  VALUES (p_user_id, p_key_name, v_key_hash);
  
  RETURN v_api_key;
END;
$$;


--
-- Name: has_role(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(role_name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Simple role check - can be extended with actual role logic
  RETURN TRUE;
END;
$$;


--
-- Name: has_role(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: reset_daily_quotas(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.reset_daily_quotas() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Update all existing quotas for the new day
  UPDATE public.ai_daily_quota
  SET 
    calls_used = 0,
    date = CURRENT_DATE,
    updated_at = now()
  WHERE date < CURRENT_DATE;
  
  -- This function is meant to be called by a scheduled job
  -- It resets the usage counters for a new day
END;
$$;


--
-- Name: update_clarity_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_clarity_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_ip_reputation(text, text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_ip_reputation(p_ip text, p_action text, p_risk_score integer) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.ip_reputation (ip, score, total_requests, blocked_count)
  VALUES (
    p_ip,
    GREATEST(0, LEAST(100, 50 - (p_risk_score / 2))),
    1,
    CASE WHEN p_action = 'block' THEN 1 ELSE 0 END
  )
  ON CONFLICT (ip) DO UPDATE SET
    score = GREATEST(0, LEAST(100, public.ip_reputation.score - (p_risk_score / 10))),
    total_requests = public.ip_reputation.total_requests + 1,
    blocked_count = public.ip_reputation.blocked_count + (CASE WHEN p_action = 'block' THEN 1 ELSE 0 END),
    last_seen = now(),
    updated_at = now();
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: access_scans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.access_scans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain text NOT NULL,
    score integer DEFAULT 0,
    fixed_count integer DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: accessibility_scans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accessibility_scans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain text NOT NULL,
    scan_status text DEFAULT 'pending'::text NOT NULL,
    score numeric DEFAULT 0,
    issues jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    wcag_level text DEFAULT 'AA'::text,
    user_id uuid,
    CONSTRAINT accessibility_scans_wcag_level_check CHECK ((wcag_level = ANY (ARRAY['A'::text, 'AA'::text, 'AAA'::text])))
);


--
-- Name: ai_daily_quota; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_daily_quota (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider text NOT NULL,
    date date DEFAULT CURRENT_DATE,
    calls_used integer DEFAULT 0,
    calls_budget integer DEFAULT 1000,
    tokens_used integer DEFAULT 0,
    updated_at timestamp with time zone DEFAULT now(),
    category text DEFAULT 'general'::text
);


--
-- Name: ai_learning_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_learning_data (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    input_data jsonb NOT NULL,
    output_data jsonb,
    model text NOT NULL,
    provider text NOT NULL,
    success boolean DEFAULT true,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    model_name text
);


--
-- Name: ai_usage_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_usage_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider text NOT NULL,
    model text,
    category text,
    tokens_used integer,
    cost numeric,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    response_time_ms integer,
    success boolean DEFAULT true
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    performed_by uuid,
    action text NOT NULL,
    entity_type text,
    entity_id uuid,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: bot_sniper_api_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bot_sniper_api_keys (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    key_name text NOT NULL,
    api_key_hash text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: brain_actions_queue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brain_actions_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    action_type text NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'pending'::text,
    priority integer DEFAULT 5,
    scheduled_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: brain_cross_insights; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brain_cross_insights (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    insight_text text NOT NULL,
    domains text[] DEFAULT '{}'::text[],
    confidence numeric,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: brain_curiosity_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brain_curiosity_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    query text NOT NULL,
    curiosity_score numeric,
    domain text,
    explored boolean DEFAULT false,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: brain_curiosity_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brain_curiosity_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    threshold numeric DEFAULT 0.5,
    exploration_rate numeric DEFAULT 0.3,
    settings jsonb DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: brain_daily_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brain_daily_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    report_date date DEFAULT CURRENT_DATE NOT NULL,
    findings_summary text,
    gaps_found jsonb DEFAULT '[]'::jsonb,
    opportunities jsonb DEFAULT '[]'::jsonb,
    priority_actions jsonb DEFAULT '[]'::jsonb,
    system_health jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: brain_domain_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brain_domain_usage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain_name text NOT NULL,
    category text DEFAULT 'general'::text,
    calls_today integer DEFAULT 0,
    calls_total integer DEFAULT 0,
    date date DEFAULT CURRENT_DATE,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: brain_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brain_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    module text NOT NULL,
    event_type text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    outcome text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: brain_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brain_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id text NOT NULL,
    model text NOT NULL,
    tokens_used integer,
    success_rating integer,
    reason_for_rating text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT brain_feedback_success_rating_check CHECK (((success_rating >= 1) AND (success_rating <= 5)))
);


--
-- Name: brain_forecasts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brain_forecasts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    metric_name text NOT NULL,
    predicted_value numeric,
    confidence numeric,
    forecast_date date,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: brain_graph_edges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brain_graph_edges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    source_id uuid NOT NULL,
    target_id uuid NOT NULL,
    relation text,
    weight numeric DEFAULT 1.0,
    reinforcement_score numeric DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: brain_memory_cold; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brain_memory_cold (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    summary text NOT NULL,
    core_summary text,
    embedding public.vector(512),
    compression_level integer DEFAULT 0,
    compression_ratio numeric,
    source_refs text[] DEFAULT '{}'::text[],
    tags jsonb DEFAULT '{}'::jsonb,
    archived_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: brain_memory_hot; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brain_memory_hot (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content text NOT NULL,
    embedding public.vector(1536),
    context text,
    goal_ref text DEFAULT 'make PromptFluid profitable'::text,
    priority integer DEFAULT 5,
    last_used timestamp with time zone DEFAULT now(),
    tags jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT brain_memory_hot_context_check CHECK (((context IS NOT NULL) AND (length(TRIM(BOTH FROM context)) > 0))),
    CONSTRAINT brain_memory_hot_priority_check CHECK (((priority >= 1) AND (priority <= 10)))
);


--
-- Name: brain_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brain_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    metric_name text NOT NULL,
    metric_value numeric NOT NULL,
    freedom_score numeric DEFAULT 0.5,
    creativity_index numeric DEFAULT 0.5,
    learning_velocity numeric DEFAULT 0.5,
    measured_at timestamp with time zone DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: brain_persona; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brain_persona (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role text,
    personality_traits jsonb DEFAULT '{}'::jsonb,
    communication_style text,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: brain_persona_patterns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brain_persona_patterns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pattern_name text NOT NULL,
    weight numeric DEFAULT 1.0,
    frequency integer DEFAULT 0,
    context text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    urgency_level text DEFAULT 'normal'::text,
    inferred_state text
);


--
-- Name: brain_persona_state; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brain_persona_state (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    state_name text NOT NULL,
    tone text,
    confidence numeric DEFAULT 0.5,
    response_style text,
    tech_level text,
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    inferred_intent text,
    urgency_level text DEFAULT 'normal'::text
);


--
-- Name: brain_policy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brain_policy (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    behavior_rules jsonb DEFAULT '[]'::jsonb,
    ethical_compass jsonb DEFAULT '{}'::jsonb,
    boundaries jsonb DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: brain_proxy_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brain_proxy_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain_name text NOT NULL,
    success boolean DEFAULT true,
    response_time_ms integer,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: brain_reach_domains; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brain_reach_domains (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain_name text NOT NULL,
    active boolean DEFAULT true,
    category text DEFAULT 'general'::text,
    avg_latency_ms integer DEFAULT 0,
    success_rate numeric DEFAULT 1.0,
    last_accessed timestamp with time zone DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    trust_score numeric DEFAULT 0.5,
    endpoint_type text DEFAULT 'api'::text
);


--
-- Name: brain_reflection_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brain_reflection_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reflection_type text,
    content text,
    insights jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: brain_reflections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brain_reflections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reflection_date date DEFAULT CURRENT_DATE NOT NULL,
    summary text,
    lessons jsonb DEFAULT '[]'::jsonb,
    top_memories jsonb DEFAULT '[]'::jsonb,
    insights text,
    recommendations text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: brain_reinforcement_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brain_reinforcement_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    edge_id uuid,
    action text,
    reward numeric,
    created_at timestamp with time zone DEFAULT now(),
    memory_id uuid,
    outcome_score numeric,
    event_type text,
    triggered_at timestamp with time zone DEFAULT now()
);


--
-- Name: brain_sensory_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brain_sensory_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_type text NOT NULL,
    sensory_data jsonb NOT NULL,
    anomaly_score numeric DEFAULT 0,
    auto_fix_applied boolean DEFAULT false,
    fix_confidence numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: causal_traces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.causal_traces (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hypothesis text NOT NULL,
    confidence numeric DEFAULT 0.5,
    validation_status text DEFAULT 'pending'::text,
    evidence jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: core_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.core_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    plan_name text NOT NULL,
    price numeric NOT NULL,
    features jsonb DEFAULT '[]'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: core_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.core_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scope text DEFAULT 'global'::text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: core_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.core_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    status text NOT NULL,
    plan_name text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: core_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.core_usage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    period date DEFAULT CURRENT_DATE NOT NULL,
    calls integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cost_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cost_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid,
    user_id uuid,
    api_name text NOT NULL,
    cost_amount numeric(10,4) NOT NULL,
    tokens_used integer,
    logged_at timestamp with time zone DEFAULT now()
);


--
-- Name: daily_state; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_state (
    date_key date NOT NULL,
    day_seed bigint NOT NULL,
    schedule_json jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: defense_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.defense_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ip text NOT NULL,
    user_agent text,
    endpoint text NOT NULL,
    risk_score integer NOT NULL,
    action text NOT NULL,
    reason text,
    metadata jsonb DEFAULT '{}'::jsonb,
    session_id text,
    fingerprint_hash text,
    detected_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: defense_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.defense_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    rule_name text NOT NULL,
    pattern text NOT NULL,
    action text DEFAULT 'monitor'::text NOT NULL,
    is_active boolean DEFAULT true,
    priority integer DEFAULT 5,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    threshold integer DEFAULT 50
);


--
-- Name: dream_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dream_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    mode text NOT NULL,
    seed bigint NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);


--
-- Name: dream_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dream_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    seed_prompt text NOT NULL,
    outputs_json jsonb DEFAULT '[]'::jsonb,
    tags text[] DEFAULT '{}'::text[],
    budget_used_usd numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    approved boolean DEFAULT false,
    approved_at timestamp with time zone,
    ignored boolean DEFAULT false,
    ignored_at timestamp with time zone
);

ALTER TABLE ONLY public.dream_sessions REPLICA IDENTITY FULL;


--
-- Name: ecosystem_memory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ecosystem_memory (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    source_system text NOT NULL,
    event_type text NOT NULL,
    payload jsonb NOT NULL,
    impact_score numeric DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ethical_approvals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ethical_approvals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    proposal_text text NOT NULL,
    risk_level text DEFAULT 'low'::text,
    flagged_reasons jsonb DEFAULT '[]'::jsonb,
    approval_status text DEFAULT 'pending'::text,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    admin_decision_at timestamp with time zone
);


--
-- Name: evolution_proposals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.evolution_proposals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    target_system text NOT NULL,
    title text NOT NULL,
    summary text NOT NULL,
    suggested_change jsonb NOT NULL,
    expected_impact jsonb NOT NULL,
    confidence numeric NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    diffs jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text DEFAULT 'cascade'::text NOT NULL,
    reviewer text,
    reviewed_at timestamp with time zone,
    CONSTRAINT valid_status CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'applied'::text, 'rolled_back'::text])))
);


--
-- Name: global_correlation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.global_correlation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    internal_metric text NOT NULL,
    external_factor text NOT NULL,
    correlation_score numeric NOT NULL,
    last_updated timestamp with time zone DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);


--
-- Name: global_forecasts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.global_forecasts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hypothesis text NOT NULL,
    probability numeric NOT NULL,
    supporting_factors jsonb DEFAULT '[]'::jsonb,
    confidence numeric DEFAULT 0.5,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    projection_window text,
    reviewed boolean DEFAULT false,
    CONSTRAINT global_forecasts_probability_check CHECK (((probability >= (0)::numeric) AND (probability <= (1)::numeric)))
);


--
-- Name: global_signals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.global_signals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category text NOT NULL,
    source_name text NOT NULL,
    headline text NOT NULL,
    sentiment_score numeric DEFAULT 0,
    confidence numeric DEFAULT 0.5,
    created_at timestamp with time zone DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);


--
-- Name: ip_reputation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ip_reputation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ip text NOT NULL,
    score integer DEFAULT 50 NOT NULL,
    last_seen timestamp with time zone DEFAULT now() NOT NULL,
    total_requests integer DEFAULT 0,
    blocked_count integer DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: learning_confidence; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.learning_confidence (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    result_id uuid,
    confidence_score numeric(5,2),
    cross_verified boolean DEFAULT false,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: learning_cycles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.learning_cycles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cycle_number integer NOT NULL,
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    total_calls integer DEFAULT 0,
    insights_generated integer DEFAULT 0,
    status text DEFAULT 'active'::text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: learning_patterns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.learning_patterns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pattern_type text NOT NULL,
    pattern_name text NOT NULL,
    description text,
    confidence numeric DEFAULT 0,
    frequency integer DEFAULT 0,
    success_rate numeric DEFAULT 0,
    recommendations jsonb DEFAULT '[]'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: learning_queries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.learning_queries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    query text NOT NULL,
    status text DEFAULT 'pending'::text,
    result text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: learning_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.learning_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    query_id uuid,
    extracted_insights jsonb,
    learning_confidence numeric(5,2),
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    relevance_score numeric DEFAULT 0.5,
    source_api text DEFAULT 'lovable'::text
);


--
-- Name: modernizer_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modernizer_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_url text,
    analysis_result jsonb DEFAULT '{}'::jsonb,
    status text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: modernizer_extractions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modernizer_extractions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid,
    original_html text,
    original_css text,
    original_metadata jsonb,
    page_count integer DEFAULT 1,
    extracted_at timestamp with time zone DEFAULT now()
);


--
-- Name: modernizer_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modernizer_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    source_url text NOT NULL,
    selected_theme text DEFAULT 'minimal'::text NOT NULL,
    job_status text DEFAULT 'pending'::text NOT NULL,
    accessibility_score integer,
    seo_score integer,
    extracted_content jsonb,
    extracted_metadata jsonb,
    rebuilt_files jsonb,
    error_message text,
    preview_url text,
    sandbox_id text,
    vercel_deployment_id text,
    vercel_project_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    performance_score integer,
    detected_cms text,
    brand_colors text[],
    extraction_id uuid,
    output_id uuid,
    page_count integer DEFAULT 1,
    extracted_pages jsonb,
    hosted_url text,
    hosted_subdomain text,
    hosted_at timestamp with time zone,
    react_files jsonb,
    improve_content boolean DEFAULT true
);


--
-- Name: modernizer_outputs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modernizer_outputs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid,
    html_content text NOT NULL,
    css_content text,
    metadata jsonb,
    build_type text DEFAULT 'static'::text,
    generated_at timestamp with time zone DEFAULT now()
);


--
-- Name: modernizer_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modernizer_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    report_type text NOT NULL,
    report_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: modernizer_user_limits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modernizer_user_limits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    plan_tier text DEFAULT 'free'::text NOT NULL,
    monthly_jobs_limit integer DEFAULT 3 NOT NULL,
    monthly_jobs_used integer DEFAULT 0 NOT NULL,
    stripe_customer_id text,
    stripe_subscription_id text,
    subscription_status text,
    billing_period_start timestamp with time zone DEFAULT now(),
    billing_period_end timestamp with time zone DEFAULT (now() + '30 days'::interval),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT modernizer_user_limits_plan_tier_check CHECK ((plan_tier = ANY (ARRAY['free'::text, 'starter'::text, 'pro'::text, 'studio'::text])))
);


--
-- Name: nexus_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nexus_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider text NOT NULL,
    latency_ms integer NOT NULL,
    token_count integer DEFAULT 0 NOT NULL,
    cost_usd_est numeric(10,6) DEFAULT 0 NOT NULL,
    status text NOT NULL,
    route_key text DEFAULT 'default'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT nexus_logs_status_check CHECK ((status = ANY (ARRAY['success'::text, 'failure'::text])))
);


--
-- Name: pf_ai_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_ai_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    model text NOT NULL,
    provider text,
    prompt_tokens integer DEFAULT 0,
    completion_tokens integer DEFAULT 0,
    total_tokens integer DEFAULT 0,
    cost_cents integer DEFAULT 0,
    endpoint text,
    status text DEFAULT 'success'::text,
    error_message text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: pf_brain_anomalies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_brain_anomalies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    anomaly_type text NOT NULL,
    severity text NOT NULL,
    resolved boolean DEFAULT false,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: pf_brain_behavioral_patterns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_brain_behavioral_patterns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pattern_name text NOT NULL,
    pattern_data jsonb,
    frequency integer DEFAULT 0,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: pf_brain_ml_models; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_brain_ml_models (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    model_name text NOT NULL,
    model_type text NOT NULL,
    status text DEFAULT 'active'::text,
    accuracy numeric(5,2),
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: pf_brain_ml_predictions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_brain_ml_predictions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    model_id uuid,
    prediction_data jsonb,
    accuracy numeric(5,2),
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: pf_clarity_admin_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_admin_stats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    total_users integer DEFAULT 0 NOT NULL,
    total_sites integer DEFAULT 0 NOT NULL,
    total_scans integer DEFAULT 0 NOT NULL,
    active_subscriptions integer DEFAULT 0 NOT NULL,
    revenue_usd numeric(10,2) DEFAULT 0 NOT NULL,
    avg_compliance_score numeric(5,2),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: pf_clarity_agent_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_agent_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_id uuid NOT NULL,
    config_version text DEFAULT '4.1.0'::text,
    scan_on_load boolean DEFAULT true,
    auto_fix_enabled boolean DEFAULT false,
    visual_indicators boolean DEFAULT true,
    report_endpoint text,
    custom_rules jsonb DEFAULT '[]'::jsonb,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: pf_clarity_api_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_api_keys (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    key_name text NOT NULL,
    api_key_hash text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: pf_clarity_api_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_api_usage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    api_key_id uuid NOT NULL,
    endpoint text NOT NULL,
    method text NOT NULL,
    status_code integer,
    response_time_ms integer,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: pf_clarity_certifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_certifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_id uuid NOT NULL,
    certification_type text NOT NULL,
    status text NOT NULL,
    score_at_certification integer NOT NULL,
    badge_code text NOT NULL,
    certificate_url text,
    issued_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    audit_trail jsonb DEFAULT '[]'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT pf_clarity_certifications_certification_type_check CHECK ((certification_type = ANY (ARRAY['wcag_a'::text, 'wcag_aa'::text, 'wcag_aaa'::text]))),
    CONSTRAINT pf_clarity_certifications_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'active'::text, 'expired'::text, 'revoked'::text])))
);


--
-- Name: pf_clarity_clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reseller_id uuid NOT NULL,
    client_name text NOT NULL,
    client_email text NOT NULL,
    client_company text,
    site_quota integer DEFAULT 5 NOT NULL,
    scan_quota_monthly integer DEFAULT 50 NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb
);


--
-- Name: pf_clarity_compliance_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_compliance_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_id uuid NOT NULL,
    scan_id uuid,
    compliance_score numeric(5,2) NOT NULL,
    issues_count integer DEFAULT 0 NOT NULL,
    critical_issues integer DEFAULT 0 NOT NULL,
    warning_issues integer DEFAULT 0 NOT NULL,
    info_issues integer DEFAULT 0 NOT NULL,
    wcag_level text DEFAULT 'AA'::text NOT NULL,
    recorded_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: pf_clarity_email_follows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_email_follows (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_url text NOT NULL,
    user_email text NOT NULL,
    scan_id uuid,
    sent_type text NOT NULL,
    sent_at timestamp with time zone DEFAULT now() NOT NULL,
    sent_date date DEFAULT CURRENT_DATE NOT NULL,
    compliance_score integer,
    fixable_issues integer,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT pf_clarity_email_follows_sent_type_check CHECK ((sent_type = ANY (ARRAY['results'::text, 'offer'::text, 'reminder'::text])))
);


--
-- Name: pf_clarity_fix_suggestions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_fix_suggestions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    issue_id uuid NOT NULL,
    fix_type text NOT NULL,
    suggested_code text,
    explanation text NOT NULL,
    confidence_score integer,
    auto_applicable boolean DEFAULT false,
    applied boolean DEFAULT false,
    applied_at timestamp with time zone,
    applied_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT pf_clarity_fix_suggestions_confidence_score_check CHECK (((confidence_score >= 0) AND (confidence_score <= 100))),
    CONSTRAINT pf_clarity_fix_suggestions_fix_type_check CHECK ((fix_type = ANY (ARRAY['code'::text, 'content'::text, 'style'::text, 'structure'::text])))
);


--
-- Name: pf_clarity_fixes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_fixes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    issue_id uuid NOT NULL,
    fix_type text NOT NULL,
    fix_code text,
    fix_description text,
    status text DEFAULT 'pending'::text,
    applied_at timestamp with time zone,
    reverted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pf_clarity_fixes_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'applied'::text, 'failed'::text, 'reverted'::text])))
);


--
-- Name: pf_clarity_issue_priority; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_issue_priority (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    issue_id uuid NOT NULL,
    ai_priority_score integer NOT NULL,
    business_impact text,
    fix_complexity text,
    estimated_time_minutes integer,
    dependencies text[],
    recommended_order integer,
    reasoning text,
    calculated_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT pf_clarity_issue_priority_ai_priority_score_check CHECK (((ai_priority_score >= 0) AND (ai_priority_score <= 100))),
    CONSTRAINT pf_clarity_issue_priority_fix_complexity_check CHECK ((fix_complexity = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text])))
);


--
-- Name: pf_clarity_issues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_issues (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scan_id uuid NOT NULL,
    wcag_criterion text NOT NULL,
    wcag_level text NOT NULL,
    severity text NOT NULL,
    issue_type text NOT NULL,
    issue_description text NOT NULL,
    element_selector text,
    element_html text,
    context jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'open'::text,
    auto_fix_attempted boolean DEFAULT false,
    auto_fix_successful boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pf_clarity_issues_severity_check CHECK ((severity = ANY (ARRAY['critical'::text, 'warning'::text, 'info'::text]))),
    CONSTRAINT pf_clarity_issues_status_check CHECK ((status = ANY (ARRAY['open'::text, 'auto_fixed'::text, 'pending_review'::text, 'resolved'::text, 'ignored'::text]))),
    CONSTRAINT pf_clarity_issues_wcag_level_check CHECK ((wcag_level = ANY (ARRAY['A'::text, 'AA'::text, 'AAA'::text])))
);


--
-- Name: pf_clarity_notification_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_notification_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    notification_type text NOT NULL,
    scan_id uuid,
    sent_at timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'sent'::text NOT NULL,
    error_message text
);


--
-- Name: pf_clarity_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email text NOT NULL,
    scan_complete boolean DEFAULT true,
    critical_issues boolean DEFAULT true,
    weekly_summary boolean DEFAULT true,
    auto_fix_applied boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: pf_clarity_portfolio_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_portfolio_stats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    total_sites integer DEFAULT 0 NOT NULL,
    avg_compliance_score numeric(5,2),
    total_issues integer DEFAULT 0 NOT NULL,
    critical_issues integer DEFAULT 0 NOT NULL,
    sites_above_threshold integer DEFAULT 0 NOT NULL,
    calculated_at timestamp with time zone DEFAULT now() NOT NULL,
    period_start timestamp with time zone NOT NULL,
    period_end timestamp with time zone NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb
);


--
-- Name: pf_clarity_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_id uuid NOT NULL,
    scan_id uuid,
    report_type text NOT NULL,
    generated_by uuid NOT NULL,
    file_url text,
    file_size_bytes integer,
    generated_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT pf_clarity_reports_report_type_check CHECK ((report_type = ANY (ARRAY['full'::text, 'summary'::text, 'executive'::text])))
);


--
-- Name: pf_clarity_scan_queue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_scan_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_id uuid NOT NULL,
    scheduled_scan_id uuid,
    status text DEFAULT 'pending'::text NOT NULL,
    priority integer DEFAULT 5 NOT NULL,
    scheduled_for timestamp with time zone DEFAULT now() NOT NULL,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    error_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pf_clarity_scan_queue_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'running'::text, 'completed'::text, 'failed'::text])))
);


--
-- Name: pf_clarity_scans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_scans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_id uuid NOT NULL,
    scan_url text NOT NULL,
    status text DEFAULT 'queued'::text,
    wcag_level text DEFAULT 'AA'::text,
    total_checks integer DEFAULT 0,
    issues_found integer DEFAULT 0,
    issues_critical integer DEFAULT 0,
    issues_warning integer DEFAULT 0,
    issues_auto_fixed integer DEFAULT 0,
    issues_pending_review integer DEFAULT 0,
    compliance_score integer DEFAULT 0,
    scan_data jsonb DEFAULT '{}'::jsonb,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pf_clarity_scans_status_check CHECK ((status = ANY (ARRAY['queued'::text, 'scanning'::text, 'completed'::text, 'failed'::text]))),
    CONSTRAINT pf_clarity_scans_wcag_level_check CHECK ((wcag_level = ANY (ARRAY['A'::text, 'AA'::text, 'AAA'::text])))
);


--
-- Name: pf_clarity_scheduled_scans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_scheduled_scans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_id uuid NOT NULL,
    frequency text NOT NULL,
    schedule_time time without time zone DEFAULT '00:00:00'::time without time zone NOT NULL,
    schedule_day integer,
    schedule_date integer,
    is_active boolean DEFAULT true NOT NULL,
    last_run_at timestamp with time zone,
    next_run_at timestamp with time zone,
    notification_enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pf_clarity_scheduled_scans_frequency_check CHECK ((frequency = ANY (ARRAY['daily'::text, 'weekly'::text, 'monthly'::text]))),
    CONSTRAINT pf_clarity_scheduled_scans_schedule_date_check CHECK (((schedule_date >= 1) AND (schedule_date <= 31))),
    CONSTRAINT pf_clarity_scheduled_scans_schedule_day_check CHECK (((schedule_day >= 0) AND (schedule_day <= 6)))
);


--
-- Name: pf_clarity_sites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_sites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    site_url text NOT NULL,
    site_name text,
    install_key text DEFAULT encode(extensions.gen_random_bytes(32), 'hex'::text),
    agent_enabled boolean DEFAULT true,
    auto_fix_enabled boolean DEFAULT false,
    subscription_tier text DEFAULT 'free'::text,
    monthly_scan_limit integer DEFAULT 100,
    monthly_scans_used integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    team_id uuid,
    CONSTRAINT pf_clarity_sites_subscription_tier_check CHECK ((subscription_tier = ANY (ARRAY['free'::text, 'starter'::text, 'pro'::text, 'enterprise'::text])))
);


--
-- Name: pf_clarity_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    site_id uuid,
    stripe_customer_id text,
    stripe_subscription_id text,
    plan_tier text DEFAULT 'free'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    cancel_at_period_end boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: pf_clarity_team_invites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_team_invites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    email text NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    invite_token text DEFAULT encode(extensions.gen_random_bytes(32), 'hex'::text) NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval) NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pf_clarity_team_invites_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'member'::text, 'viewer'::text])))
);


--
-- Name: pf_clarity_team_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_team_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pf_clarity_team_members_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text, 'viewer'::text])))
);


--
-- Name: pf_clarity_teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_teams (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    owner_id uuid NOT NULL,
    plan_tier text DEFAULT 'free'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pf_clarity_teams_plan_tier_check CHECK ((plan_tier = ANY (ARRAY['free'::text, 'starter'::text, 'pro'::text, 'enterprise'::text])))
);


--
-- Name: pf_clarity_webhooks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_webhooks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    site_id uuid,
    webhook_url text NOT NULL,
    events text[] NOT NULL,
    secret text NOT NULL,
    is_active boolean DEFAULT true,
    last_triggered_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: pf_clarity_whitelabel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_whitelabel (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    brand_name text NOT NULL,
    logo_url text,
    primary_color text DEFAULT '#7A5FFF'::text,
    secondary_color text DEFAULT '#01C9E8'::text,
    custom_domain text,
    email_from_name text,
    email_from_address text,
    report_footer_text text,
    is_active boolean DEFAULT true,
    plan_tier text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pf_clarity_whitelabel_plan_tier_check CHECK ((plan_tier = ANY (ARRAY['reseller'::text, 'enterprise'::text, 'agency'::text])))
);


--
-- Name: pf_clarity_widget_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_widget_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    widget_id uuid NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    total_activations integer DEFAULT 0,
    tts_uses integer DEFAULT 0,
    contrast_toggles integer DEFAULT 0,
    font_size_changes integer DEFAULT 0,
    keyboard_nav_uses integer DEFAULT 0,
    unique_users integer DEFAULT 0
);


--
-- Name: pf_clarity_widgets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_widgets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_id uuid NOT NULL,
    widget_key text NOT NULL,
    is_active boolean DEFAULT true,
    features jsonb DEFAULT '{"tts": true, "contrast": true, "font_size": true, "keyboard_nav": true}'::jsonb,
    "position" text DEFAULT 'bottom-right'::text,
    theme text DEFAULT 'light'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pf_clarity_widgets_position_check CHECK (("position" = ANY (ARRAY['bottom-right'::text, 'bottom-left'::text, 'top-right'::text, 'top-left'::text]))),
    CONSTRAINT pf_clarity_widgets_theme_check CHECK ((theme = ANY (ARRAY['light'::text, 'dark'::text, 'auto'::text])))
);


--
-- Name: pf_clarity_wp_connections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_clarity_wp_connections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_id uuid NOT NULL,
    wp_site_url text NOT NULL,
    api_key text NOT NULL,
    api_secret_hash text NOT NULL,
    plugin_version text,
    auto_sync_enabled boolean DEFAULT true,
    last_sync_at timestamp with time zone,
    sync_status text,
    error_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pf_clarity_wp_connections_sync_status_check CHECK ((sync_status = ANY (ARRAY['active'::text, 'error'::text, 'pending'::text])))
);


--
-- Name: pf_cost_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_cost_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    operation_type text NOT NULL,
    provider text NOT NULL,
    cost_cents numeric(10,2),
    tokens_used integer,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: pf_deployments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_deployments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status text NOT NULL,
    environment text NOT NULL,
    commit_hash text NOT NULL,
    deployed_by uuid,
    deployed_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pf_deployments_environment_check CHECK ((environment = ANY (ARRAY['production'::text, 'staging'::text, 'development'::text]))),
    CONSTRAINT pf_deployments_status_check CHECK ((status = ANY (ARRAY['success'::text, 'failed'::text, 'pending'::text])))
);


--
-- Name: pf_global_threat_feed; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_global_threat_feed (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    threat_type text NOT NULL,
    threat_category text NOT NULL,
    severity text NOT NULL,
    detected_at timestamp with time zone DEFAULT now(),
    description text,
    mitigation_status text DEFAULT 'pending'::text,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT pf_global_threat_feed_severity_check CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])))
);


--
-- Name: pf_image_outputs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_image_outputs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid,
    api text NOT NULL,
    provider text NOT NULL,
    prompt text NOT NULL,
    style text,
    resolution text,
    cost_cents numeric(10,2),
    url text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: pf_insight_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_insight_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    insight_type text NOT NULL,
    data jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: pf_media_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_media_cache (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hash text NOT NULL,
    type text NOT NULL,
    url text,
    content text,
    metadata jsonb,
    ttl_expiration timestamp with time zone NOT NULL,
    project_ref uuid,
    hit_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pf_media_cache_type_check CHECK ((type = ANY (ARRAY['text'::text, 'image'::text, 'video'::text])))
);


--
-- Name: pf_security_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_security_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_type text NOT NULL,
    severity text NOT NULL,
    ip_address text,
    user_agent text,
    action_taken text NOT NULL,
    metadata jsonb,
    detected_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pf_security_events_severity_check CHECK ((severity = ANY (ARRAY['critical'::text, 'high'::text, 'medium'::text, 'low'::text])))
);


--
-- Name: pf_system_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_system_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: pf_text_outputs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_text_outputs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid,
    model text NOT NULL,
    provider text NOT NULL,
    input_prompt text NOT NULL,
    output_text text NOT NULL,
    cost_cents numeric(10,2),
    tokens_used integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: pf_threat_statistics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_threat_statistics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stat_date date DEFAULT CURRENT_DATE,
    total_threats integer DEFAULT 0,
    blocked_threats integer DEFAULT 0,
    active_threats integer DEFAULT 0,
    resolved_threats integer DEFAULT 0,
    avg_severity numeric DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb
);


--
-- Name: pf_video_outputs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pf_video_outputs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid,
    api text NOT NULL,
    provider text NOT NULL,
    prompt text NOT NULL,
    duration integer,
    format text,
    cost_cents numeric(10,2),
    url text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    email text,
    display_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: resilience_ledger; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resilience_ledger (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_type text NOT NULL,
    recovery_action text,
    success boolean DEFAULT true,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    auto_fix_applied boolean DEFAULT false,
    fix_confidence numeric DEFAULT 0
);


--
-- Name: ripple_campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ripple_campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    campaign_name text NOT NULL,
    status text DEFAULT 'active'::text,
    target_audience jsonb DEFAULT '{}'::jsonb,
    metrics jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: studio_applies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.studio_applies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    preview_id uuid NOT NULL,
    mode text NOT NULL,
    status text DEFAULT 'pending'::text,
    pr_url text,
    wp_task_id text,
    artifact_url text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone
);


--
-- Name: studio_audit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.studio_audit (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity text NOT NULL,
    entity_id uuid NOT NULL,
    action text NOT NULL,
    actor_id uuid,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: studio_connections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.studio_connections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    project_name text NOT NULL,
    repository_url text,
    framework text DEFAULT 'react'::text,
    status text DEFAULT 'connected'::text,
    metadata jsonb DEFAULT '{}'::jsonb,
    connected_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: studio_previews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.studio_previews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scan_id uuid NOT NULL,
    preview_url text,
    status text DEFAULT 'building'::text,
    changes_applied integer DEFAULT 0,
    estimated_time text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone
);


--
-- Name: studio_scans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.studio_scans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    connection_id uuid NOT NULL,
    project_path text NOT NULL,
    structure jsonb DEFAULT '{}'::jsonb,
    framework text,
    dependencies jsonb DEFAULT '{}'::jsonb,
    issues jsonb DEFAULT '[]'::jsonb,
    recommendations jsonb DEFAULT '[]'::jsonb,
    scanned_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: studio_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.studio_verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    apply_id uuid NOT NULL,
    lighthouse jsonb DEFAULT '{}'::jsonb,
    vitals jsonb DEFAULT '{}'::jsonb,
    wcag jsonb DEFAULT '{}'::jsonb,
    defense jsonb DEFAULT '{}'::jsonb,
    regressions jsonb DEFAULT '[]'::jsonb,
    overall_score integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: system_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value jsonb NOT NULL,
    description text,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: system_updates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_updates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    proposal_id uuid NOT NULL,
    target_system text NOT NULL,
    action text NOT NULL,
    new_config jsonb NOT NULL,
    prev_config jsonb NOT NULL,
    applied_by text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT valid_action CHECK ((action = ANY (ARRAY['apply'::text, 'rollback'::text, 'noop'::text])))
);


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    domain text,
    status text DEFAULT 'active'::text,
    subscription_tier text DEFAULT 'free'::text,
    monthly_fee numeric DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: usage_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usage_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ts timestamp with time zone DEFAULT now(),
    source text NOT NULL,
    calls integer DEFAULT 0 NOT NULL,
    provider text DEFAULT 'free-stack'::text,
    metadata jsonb DEFAULT '{}'::jsonb
);


--
-- Name: user_limits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_limits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    tier text DEFAULT 'starter'::text NOT NULL,
    modernizations_used integer DEFAULT 0,
    modernizations_limit integer DEFAULT 3,
    reset_at timestamp with time zone DEFAULT (now() + '1 mon'::interval),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: v_user_summary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.v_user_summary (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    total_usage integer DEFAULT 0,
    plan_name text,
    status text DEFAULT 'active'::text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: access_scans access_scans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.access_scans
    ADD CONSTRAINT access_scans_pkey PRIMARY KEY (id);


--
-- Name: accessibility_scans accessibility_scans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accessibility_scans
    ADD CONSTRAINT accessibility_scans_pkey PRIMARY KEY (id);


--
-- Name: ai_daily_quota ai_daily_quota_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_daily_quota
    ADD CONSTRAINT ai_daily_quota_pkey PRIMARY KEY (id);


--
-- Name: ai_daily_quota ai_daily_quota_provider_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_daily_quota
    ADD CONSTRAINT ai_daily_quota_provider_date_key UNIQUE (provider, date);


--
-- Name: ai_learning_data ai_learning_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_learning_data
    ADD CONSTRAINT ai_learning_data_pkey PRIMARY KEY (id);


--
-- Name: ai_usage_log ai_usage_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_usage_log
    ADD CONSTRAINT ai_usage_log_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: bot_sniper_api_keys bot_sniper_api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bot_sniper_api_keys
    ADD CONSTRAINT bot_sniper_api_keys_pkey PRIMARY KEY (id);


--
-- Name: brain_actions_queue brain_actions_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_actions_queue
    ADD CONSTRAINT brain_actions_queue_pkey PRIMARY KEY (id);


--
-- Name: brain_cross_insights brain_cross_insights_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_cross_insights
    ADD CONSTRAINT brain_cross_insights_pkey PRIMARY KEY (id);


--
-- Name: brain_curiosity_log brain_curiosity_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_curiosity_log
    ADD CONSTRAINT brain_curiosity_log_pkey PRIMARY KEY (id);


--
-- Name: brain_curiosity_settings brain_curiosity_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_curiosity_settings
    ADD CONSTRAINT brain_curiosity_settings_pkey PRIMARY KEY (id);


--
-- Name: brain_daily_reports brain_daily_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_daily_reports
    ADD CONSTRAINT brain_daily_reports_pkey PRIMARY KEY (id);


--
-- Name: brain_domain_usage brain_domain_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_domain_usage
    ADD CONSTRAINT brain_domain_usage_pkey PRIMARY KEY (id);


--
-- Name: brain_events brain_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_events
    ADD CONSTRAINT brain_events_pkey PRIMARY KEY (id);


--
-- Name: brain_feedback brain_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_feedback
    ADD CONSTRAINT brain_feedback_pkey PRIMARY KEY (id);


--
-- Name: brain_forecasts brain_forecasts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_forecasts
    ADD CONSTRAINT brain_forecasts_pkey PRIMARY KEY (id);


--
-- Name: brain_graph_edges brain_graph_edges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_graph_edges
    ADD CONSTRAINT brain_graph_edges_pkey PRIMARY KEY (id);


--
-- Name: brain_memory_cold brain_memory_cold_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_memory_cold
    ADD CONSTRAINT brain_memory_cold_pkey PRIMARY KEY (id);


--
-- Name: brain_memory_hot brain_memory_hot_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_memory_hot
    ADD CONSTRAINT brain_memory_hot_pkey PRIMARY KEY (id);


--
-- Name: brain_metrics brain_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_metrics
    ADD CONSTRAINT brain_metrics_pkey PRIMARY KEY (id);


--
-- Name: brain_persona_patterns brain_persona_patterns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_persona_patterns
    ADD CONSTRAINT brain_persona_patterns_pkey PRIMARY KEY (id);


--
-- Name: brain_persona brain_persona_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_persona
    ADD CONSTRAINT brain_persona_pkey PRIMARY KEY (id);


--
-- Name: brain_persona_state brain_persona_state_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_persona_state
    ADD CONSTRAINT brain_persona_state_pkey PRIMARY KEY (id);


--
-- Name: brain_policy brain_policy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_policy
    ADD CONSTRAINT brain_policy_pkey PRIMARY KEY (id);


--
-- Name: brain_proxy_logs brain_proxy_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_proxy_logs
    ADD CONSTRAINT brain_proxy_logs_pkey PRIMARY KEY (id);


--
-- Name: brain_reach_domains brain_reach_domains_domain_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_reach_domains
    ADD CONSTRAINT brain_reach_domains_domain_name_key UNIQUE (domain_name);


--
-- Name: brain_reach_domains brain_reach_domains_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_reach_domains
    ADD CONSTRAINT brain_reach_domains_pkey PRIMARY KEY (id);


--
-- Name: brain_reflection_log brain_reflection_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_reflection_log
    ADD CONSTRAINT brain_reflection_log_pkey PRIMARY KEY (id);


--
-- Name: brain_reflections brain_reflections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_reflections
    ADD CONSTRAINT brain_reflections_pkey PRIMARY KEY (id);


--
-- Name: brain_reflections brain_reflections_reflection_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_reflections
    ADD CONSTRAINT brain_reflections_reflection_date_key UNIQUE (reflection_date);


--
-- Name: brain_reinforcement_log brain_reinforcement_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_reinforcement_log
    ADD CONSTRAINT brain_reinforcement_log_pkey PRIMARY KEY (id);


--
-- Name: brain_sensory_events brain_sensory_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_sensory_events
    ADD CONSTRAINT brain_sensory_events_pkey PRIMARY KEY (id);


--
-- Name: causal_traces causal_traces_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.causal_traces
    ADD CONSTRAINT causal_traces_pkey PRIMARY KEY (id);


--
-- Name: core_plans core_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.core_plans
    ADD CONSTRAINT core_plans_pkey PRIMARY KEY (id);


--
-- Name: core_plans core_plans_plan_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.core_plans
    ADD CONSTRAINT core_plans_plan_name_key UNIQUE (plan_name);


--
-- Name: core_settings core_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.core_settings
    ADD CONSTRAINT core_settings_pkey PRIMARY KEY (id);


--
-- Name: core_subscriptions core_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.core_subscriptions
    ADD CONSTRAINT core_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: core_usage core_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.core_usage
    ADD CONSTRAINT core_usage_pkey PRIMARY KEY (id);


--
-- Name: cost_logs cost_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_logs
    ADD CONSTRAINT cost_logs_pkey PRIMARY KEY (id);


--
-- Name: daily_state daily_state_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_state
    ADD CONSTRAINT daily_state_pkey PRIMARY KEY (date_key);


--
-- Name: defense_events defense_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.defense_events
    ADD CONSTRAINT defense_events_pkey PRIMARY KEY (id);


--
-- Name: defense_rules defense_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.defense_rules
    ADD CONSTRAINT defense_rules_pkey PRIMARY KEY (id);


--
-- Name: dream_log dream_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dream_log
    ADD CONSTRAINT dream_log_pkey PRIMARY KEY (id);


--
-- Name: dream_sessions dream_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dream_sessions
    ADD CONSTRAINT dream_sessions_pkey PRIMARY KEY (id);


--
-- Name: ecosystem_memory ecosystem_memory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ecosystem_memory
    ADD CONSTRAINT ecosystem_memory_pkey PRIMARY KEY (id);


--
-- Name: ethical_approvals ethical_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ethical_approvals
    ADD CONSTRAINT ethical_approvals_pkey PRIMARY KEY (id);


--
-- Name: evolution_proposals evolution_proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evolution_proposals
    ADD CONSTRAINT evolution_proposals_pkey PRIMARY KEY (id);


--
-- Name: global_correlation global_correlation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_correlation
    ADD CONSTRAINT global_correlation_pkey PRIMARY KEY (id);


--
-- Name: global_forecasts global_forecasts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_forecasts
    ADD CONSTRAINT global_forecasts_pkey PRIMARY KEY (id);


--
-- Name: global_signals global_signals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_signals
    ADD CONSTRAINT global_signals_pkey PRIMARY KEY (id);


--
-- Name: ip_reputation ip_reputation_ip_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ip_reputation
    ADD CONSTRAINT ip_reputation_ip_key UNIQUE (ip);


--
-- Name: ip_reputation ip_reputation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ip_reputation
    ADD CONSTRAINT ip_reputation_pkey PRIMARY KEY (id);


--
-- Name: learning_confidence learning_confidence_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_confidence
    ADD CONSTRAINT learning_confidence_pkey PRIMARY KEY (id);


--
-- Name: learning_cycles learning_cycles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_cycles
    ADD CONSTRAINT learning_cycles_pkey PRIMARY KEY (id);


--
-- Name: learning_patterns learning_patterns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_patterns
    ADD CONSTRAINT learning_patterns_pkey PRIMARY KEY (id);


--
-- Name: learning_queries learning_queries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_queries
    ADD CONSTRAINT learning_queries_pkey PRIMARY KEY (id);


--
-- Name: learning_results learning_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_results
    ADD CONSTRAINT learning_results_pkey PRIMARY KEY (id);


--
-- Name: modernizer_analytics modernizer_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modernizer_analytics
    ADD CONSTRAINT modernizer_analytics_pkey PRIMARY KEY (id);


--
-- Name: modernizer_extractions modernizer_extractions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modernizer_extractions
    ADD CONSTRAINT modernizer_extractions_pkey PRIMARY KEY (id);


--
-- Name: modernizer_jobs modernizer_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modernizer_jobs
    ADD CONSTRAINT modernizer_jobs_pkey PRIMARY KEY (id);


--
-- Name: modernizer_outputs modernizer_outputs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modernizer_outputs
    ADD CONSTRAINT modernizer_outputs_pkey PRIMARY KEY (id);


--
-- Name: modernizer_reports modernizer_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modernizer_reports
    ADD CONSTRAINT modernizer_reports_pkey PRIMARY KEY (id);


--
-- Name: modernizer_user_limits modernizer_user_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modernizer_user_limits
    ADD CONSTRAINT modernizer_user_limits_pkey PRIMARY KEY (id);


--
-- Name: nexus_logs nexus_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nexus_logs
    ADD CONSTRAINT nexus_logs_pkey PRIMARY KEY (id);


--
-- Name: pf_ai_logs pf_ai_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_ai_logs
    ADD CONSTRAINT pf_ai_logs_pkey PRIMARY KEY (id);


--
-- Name: pf_brain_anomalies pf_brain_anomalies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_brain_anomalies
    ADD CONSTRAINT pf_brain_anomalies_pkey PRIMARY KEY (id);


--
-- Name: pf_brain_behavioral_patterns pf_brain_behavioral_patterns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_brain_behavioral_patterns
    ADD CONSTRAINT pf_brain_behavioral_patterns_pkey PRIMARY KEY (id);


--
-- Name: pf_brain_ml_models pf_brain_ml_models_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_brain_ml_models
    ADD CONSTRAINT pf_brain_ml_models_pkey PRIMARY KEY (id);


--
-- Name: pf_brain_ml_predictions pf_brain_ml_predictions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_brain_ml_predictions
    ADD CONSTRAINT pf_brain_ml_predictions_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_admin_stats pf_clarity_admin_stats_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_admin_stats
    ADD CONSTRAINT pf_clarity_admin_stats_date_key UNIQUE (date);


--
-- Name: pf_clarity_admin_stats pf_clarity_admin_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_admin_stats
    ADD CONSTRAINT pf_clarity_admin_stats_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_agent_config pf_clarity_agent_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_agent_config
    ADD CONSTRAINT pf_clarity_agent_config_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_agent_config pf_clarity_agent_config_site_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_agent_config
    ADD CONSTRAINT pf_clarity_agent_config_site_id_key UNIQUE (site_id);


--
-- Name: pf_clarity_api_keys pf_clarity_api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_api_keys
    ADD CONSTRAINT pf_clarity_api_keys_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_api_usage pf_clarity_api_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_api_usage
    ADD CONSTRAINT pf_clarity_api_usage_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_certifications pf_clarity_certifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_certifications
    ADD CONSTRAINT pf_clarity_certifications_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_clients pf_clarity_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_clients
    ADD CONSTRAINT pf_clarity_clients_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_compliance_history pf_clarity_compliance_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_compliance_history
    ADD CONSTRAINT pf_clarity_compliance_history_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_email_follows pf_clarity_email_follows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_email_follows
    ADD CONSTRAINT pf_clarity_email_follows_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_email_follows pf_clarity_email_follows_site_url_sent_type_sent_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_email_follows
    ADD CONSTRAINT pf_clarity_email_follows_site_url_sent_type_sent_date_key UNIQUE (site_url, sent_type, sent_date);


--
-- Name: pf_clarity_fix_suggestions pf_clarity_fix_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_fix_suggestions
    ADD CONSTRAINT pf_clarity_fix_suggestions_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_fixes pf_clarity_fixes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_fixes
    ADD CONSTRAINT pf_clarity_fixes_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_issue_priority pf_clarity_issue_priority_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_issue_priority
    ADD CONSTRAINT pf_clarity_issue_priority_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_issues pf_clarity_issues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_issues
    ADD CONSTRAINT pf_clarity_issues_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_notification_log pf_clarity_notification_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_notification_log
    ADD CONSTRAINT pf_clarity_notification_log_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_notifications pf_clarity_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_notifications
    ADD CONSTRAINT pf_clarity_notifications_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_portfolio_stats pf_clarity_portfolio_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_portfolio_stats
    ADD CONSTRAINT pf_clarity_portfolio_stats_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_reports pf_clarity_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_reports
    ADD CONSTRAINT pf_clarity_reports_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_scan_queue pf_clarity_scan_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_scan_queue
    ADD CONSTRAINT pf_clarity_scan_queue_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_scans pf_clarity_scans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_scans
    ADD CONSTRAINT pf_clarity_scans_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_scheduled_scans pf_clarity_scheduled_scans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_scheduled_scans
    ADD CONSTRAINT pf_clarity_scheduled_scans_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_sites pf_clarity_sites_install_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_sites
    ADD CONSTRAINT pf_clarity_sites_install_key_key UNIQUE (install_key);


--
-- Name: pf_clarity_sites pf_clarity_sites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_sites
    ADD CONSTRAINT pf_clarity_sites_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_sites pf_clarity_sites_user_id_site_url_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_sites
    ADD CONSTRAINT pf_clarity_sites_user_id_site_url_key UNIQUE (user_id, site_url);


--
-- Name: pf_clarity_subscriptions pf_clarity_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_subscriptions
    ADD CONSTRAINT pf_clarity_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_team_invites pf_clarity_team_invites_invite_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_team_invites
    ADD CONSTRAINT pf_clarity_team_invites_invite_token_key UNIQUE (invite_token);


--
-- Name: pf_clarity_team_invites pf_clarity_team_invites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_team_invites
    ADD CONSTRAINT pf_clarity_team_invites_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_team_members pf_clarity_team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_team_members
    ADD CONSTRAINT pf_clarity_team_members_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_teams pf_clarity_teams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_teams
    ADD CONSTRAINT pf_clarity_teams_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_webhooks pf_clarity_webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_webhooks
    ADD CONSTRAINT pf_clarity_webhooks_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_whitelabel pf_clarity_whitelabel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_whitelabel
    ADD CONSTRAINT pf_clarity_whitelabel_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_whitelabel pf_clarity_whitelabel_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_whitelabel
    ADD CONSTRAINT pf_clarity_whitelabel_user_id_key UNIQUE (user_id);


--
-- Name: pf_clarity_widget_analytics pf_clarity_widget_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_widget_analytics
    ADD CONSTRAINT pf_clarity_widget_analytics_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_widget_analytics pf_clarity_widget_analytics_widget_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_widget_analytics
    ADD CONSTRAINT pf_clarity_widget_analytics_widget_id_date_key UNIQUE (widget_id, date);


--
-- Name: pf_clarity_widgets pf_clarity_widgets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_widgets
    ADD CONSTRAINT pf_clarity_widgets_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_widgets pf_clarity_widgets_widget_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_widgets
    ADD CONSTRAINT pf_clarity_widgets_widget_key_key UNIQUE (widget_key);


--
-- Name: pf_clarity_wp_connections pf_clarity_wp_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_wp_connections
    ADD CONSTRAINT pf_clarity_wp_connections_pkey PRIMARY KEY (id);


--
-- Name: pf_clarity_wp_connections pf_clarity_wp_connections_site_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_wp_connections
    ADD CONSTRAINT pf_clarity_wp_connections_site_id_key UNIQUE (site_id);


--
-- Name: pf_cost_logs pf_cost_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_cost_logs
    ADD CONSTRAINT pf_cost_logs_pkey PRIMARY KEY (id);


--
-- Name: pf_deployments pf_deployments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_deployments
    ADD CONSTRAINT pf_deployments_pkey PRIMARY KEY (id);


--
-- Name: pf_global_threat_feed pf_global_threat_feed_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_global_threat_feed
    ADD CONSTRAINT pf_global_threat_feed_pkey PRIMARY KEY (id);


--
-- Name: pf_image_outputs pf_image_outputs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_image_outputs
    ADD CONSTRAINT pf_image_outputs_pkey PRIMARY KEY (id);


--
-- Name: pf_insight_logs pf_insight_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_insight_logs
    ADD CONSTRAINT pf_insight_logs_pkey PRIMARY KEY (id);


--
-- Name: pf_media_cache pf_media_cache_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_media_cache
    ADD CONSTRAINT pf_media_cache_hash_key UNIQUE (hash);


--
-- Name: pf_media_cache pf_media_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_media_cache
    ADD CONSTRAINT pf_media_cache_pkey PRIMARY KEY (id);


--
-- Name: pf_security_events pf_security_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_security_events
    ADD CONSTRAINT pf_security_events_pkey PRIMARY KEY (id);


--
-- Name: pf_system_config pf_system_config_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_system_config
    ADD CONSTRAINT pf_system_config_key_key UNIQUE (key);


--
-- Name: pf_system_config pf_system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_system_config
    ADD CONSTRAINT pf_system_config_pkey PRIMARY KEY (id);


--
-- Name: pf_text_outputs pf_text_outputs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_text_outputs
    ADD CONSTRAINT pf_text_outputs_pkey PRIMARY KEY (id);


--
-- Name: pf_threat_statistics pf_threat_statistics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_threat_statistics
    ADD CONSTRAINT pf_threat_statistics_pkey PRIMARY KEY (id);


--
-- Name: pf_video_outputs pf_video_outputs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_video_outputs
    ADD CONSTRAINT pf_video_outputs_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: resilience_ledger resilience_ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resilience_ledger
    ADD CONSTRAINT resilience_ledger_pkey PRIMARY KEY (id);


--
-- Name: ripple_campaigns ripple_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ripple_campaigns
    ADD CONSTRAINT ripple_campaigns_pkey PRIMARY KEY (id);


--
-- Name: studio_applies studio_applies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.studio_applies
    ADD CONSTRAINT studio_applies_pkey PRIMARY KEY (id);


--
-- Name: studio_audit studio_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.studio_audit
    ADD CONSTRAINT studio_audit_pkey PRIMARY KEY (id);


--
-- Name: studio_connections studio_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.studio_connections
    ADD CONSTRAINT studio_connections_pkey PRIMARY KEY (id);


--
-- Name: studio_previews studio_previews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.studio_previews
    ADD CONSTRAINT studio_previews_pkey PRIMARY KEY (id);


--
-- Name: studio_scans studio_scans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.studio_scans
    ADD CONSTRAINT studio_scans_pkey PRIMARY KEY (id);


--
-- Name: studio_verifications studio_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.studio_verifications
    ADD CONSTRAINT studio_verifications_pkey PRIMARY KEY (id);


--
-- Name: system_config system_config_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_key_key UNIQUE (key);


--
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (id);


--
-- Name: system_updates system_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_updates
    ADD CONSTRAINT system_updates_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_domain_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_domain_key UNIQUE (domain);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: modernizer_user_limits unique_user_limits; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modernizer_user_limits
    ADD CONSTRAINT unique_user_limits UNIQUE (user_id);


--
-- Name: usage_metrics usage_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_metrics
    ADD CONSTRAINT usage_metrics_pkey PRIMARY KEY (id);


--
-- Name: user_limits user_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_limits
    ADD CONSTRAINT user_limits_pkey PRIMARY KEY (id);


--
-- Name: user_limits user_limits_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_limits
    ADD CONSTRAINT user_limits_user_id_key UNIQUE (user_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: v_user_summary v_user_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_user_summary
    ADD CONSTRAINT v_user_summary_pkey PRIMARY KEY (id);


--
-- Name: idx_ai_learning_data_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_learning_data_created_at ON public.ai_learning_data USING btree (created_at);


--
-- Name: idx_ai_usage_log_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_usage_log_created ON public.ai_usage_log USING btree (created_at DESC);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at DESC);


--
-- Name: idx_brain_daily_reports_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brain_daily_reports_date ON public.brain_daily_reports USING btree (report_date DESC);


--
-- Name: idx_brain_domain_usage_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brain_domain_usage_date ON public.brain_domain_usage USING btree (date DESC);


--
-- Name: idx_brain_events_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brain_events_created_at ON public.brain_events USING btree (created_at DESC);


--
-- Name: idx_brain_events_module; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brain_events_module ON public.brain_events USING btree (module);


--
-- Name: idx_brain_graph_edges_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brain_graph_edges_source ON public.brain_graph_edges USING btree (source_id);


--
-- Name: idx_brain_graph_edges_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brain_graph_edges_target ON public.brain_graph_edges USING btree (target_id);


--
-- Name: idx_brain_memory_cold_embedding; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brain_memory_cold_embedding ON public.brain_memory_cold USING ivfflat (embedding public.vector_cosine_ops);


--
-- Name: idx_brain_memory_hot_context; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brain_memory_hot_context ON public.brain_memory_hot USING btree (context);


--
-- Name: idx_brain_memory_hot_embedding; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brain_memory_hot_embedding ON public.brain_memory_hot USING ivfflat (embedding public.vector_cosine_ops);


--
-- Name: idx_brain_memory_hot_last_used; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brain_memory_hot_last_used ON public.brain_memory_hot USING btree (last_used DESC);


--
-- Name: idx_brain_memory_hot_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brain_memory_hot_priority ON public.brain_memory_hot USING btree (priority DESC);


--
-- Name: idx_brain_proxy_logs_domain; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brain_proxy_logs_domain ON public.brain_proxy_logs USING btree (domain_name, created_at DESC);


--
-- Name: idx_brain_reach_domains_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brain_reach_domains_active ON public.brain_reach_domains USING btree (active);


--
-- Name: idx_certifications_site_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_certifications_site_id ON public.pf_clarity_certifications USING btree (site_id);


--
-- Name: idx_certifications_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_certifications_status ON public.pf_clarity_certifications USING btree (status);


--
-- Name: idx_clarity_admin_stats_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clarity_admin_stats_date ON public.pf_clarity_admin_stats USING btree (date);


--
-- Name: idx_clarity_api_keys_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clarity_api_keys_hash ON public.pf_clarity_api_keys USING btree (api_key_hash);


--
-- Name: idx_clarity_api_keys_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clarity_api_keys_user ON public.pf_clarity_api_keys USING btree (user_id);


--
-- Name: idx_clarity_api_usage_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clarity_api_usage_key ON public.pf_clarity_api_usage USING btree (api_key_id);


--
-- Name: idx_clarity_api_usage_timestamp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clarity_api_usage_timestamp ON public.pf_clarity_api_usage USING btree ("timestamp");


--
-- Name: idx_clarity_fixes_issue_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clarity_fixes_issue_id ON public.pf_clarity_fixes USING btree (issue_id);


--
-- Name: idx_clarity_issues_scan_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clarity_issues_scan_id ON public.pf_clarity_issues USING btree (scan_id);


--
-- Name: idx_clarity_issues_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clarity_issues_status ON public.pf_clarity_issues USING btree (status);


--
-- Name: idx_clarity_notification_log_scan; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clarity_notification_log_scan ON public.pf_clarity_notification_log USING btree (scan_id);


--
-- Name: idx_clarity_notification_log_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clarity_notification_log_user ON public.pf_clarity_notification_log USING btree (user_id);


--
-- Name: idx_clarity_notifications_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clarity_notifications_user ON public.pf_clarity_notifications USING btree (user_id);


--
-- Name: idx_clarity_scans_site_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clarity_scans_site_id ON public.pf_clarity_scans USING btree (site_id);


--
-- Name: idx_clarity_scans_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clarity_scans_status ON public.pf_clarity_scans USING btree (status);


--
-- Name: idx_clarity_sites_team; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clarity_sites_team ON public.pf_clarity_sites USING btree (team_id);


--
-- Name: idx_clarity_sites_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clarity_sites_user_id ON public.pf_clarity_sites USING btree (user_id);


--
-- Name: idx_clarity_subscriptions_stripe; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clarity_subscriptions_stripe ON public.pf_clarity_subscriptions USING btree (stripe_customer_id);


--
-- Name: idx_clarity_subscriptions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clarity_subscriptions_user ON public.pf_clarity_subscriptions USING btree (user_id);


--
-- Name: idx_clarity_team_invites_team; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clarity_team_invites_team ON public.pf_clarity_team_invites USING btree (team_id);


--
-- Name: idx_clarity_team_invites_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clarity_team_invites_token ON public.pf_clarity_team_invites USING btree (invite_token);


--
-- Name: idx_clarity_team_members_team; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clarity_team_members_team ON public.pf_clarity_team_members USING btree (team_id);


--
-- Name: idx_clarity_team_members_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clarity_team_members_user ON public.pf_clarity_team_members USING btree (user_id);


--
-- Name: idx_clarity_teams_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clarity_teams_owner ON public.pf_clarity_teams USING btree (owner_id);


--
-- Name: idx_clarity_webhooks_site; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clarity_webhooks_site ON public.pf_clarity_webhooks USING btree (site_id);


--
-- Name: idx_clarity_webhooks_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clarity_webhooks_user ON public.pf_clarity_webhooks USING btree (user_id);


--
-- Name: idx_clients_reseller_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clients_reseller_id ON public.pf_clarity_clients USING btree (reseller_id);


--
-- Name: idx_compliance_history_recorded; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_compliance_history_recorded ON public.pf_clarity_compliance_history USING btree (recorded_at);


--
-- Name: idx_compliance_history_site; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_compliance_history_site ON public.pf_clarity_compliance_history USING btree (site_id);


--
-- Name: idx_cost_logs_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cost_logs_created ON public.pf_cost_logs USING btree (created_at DESC);


--
-- Name: idx_daily_state_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_state_date ON public.daily_state USING btree (date_key DESC);


--
-- Name: idx_defense_events_detected_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_defense_events_detected_at ON public.defense_events USING btree (detected_at DESC);


--
-- Name: idx_defense_events_ip; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_defense_events_ip ON public.defense_events USING btree (ip);


--
-- Name: idx_defense_rules_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_defense_rules_active ON public.defense_rules USING btree (is_active);


--
-- Name: idx_dream_log_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dream_log_created_at ON public.dream_log USING btree (created_at DESC);


--
-- Name: idx_ecosystem_memory_impact; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ecosystem_memory_impact ON public.ecosystem_memory USING btree (impact_score DESC);


--
-- Name: idx_ecosystem_memory_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ecosystem_memory_source ON public.ecosystem_memory USING btree (source_system, created_at DESC);


--
-- Name: idx_email_follows_site_sent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_follows_site_sent ON public.pf_clarity_email_follows USING btree (site_url, sent_type, sent_date);


--
-- Name: idx_fix_suggestions_applied; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fix_suggestions_applied ON public.pf_clarity_fix_suggestions USING btree (applied);


--
-- Name: idx_fix_suggestions_issue_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fix_suggestions_issue_id ON public.pf_clarity_fix_suggestions USING btree (issue_id);


--
-- Name: idx_image_outputs_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_image_outputs_project ON public.pf_image_outputs USING btree (project_id, created_at DESC);


--
-- Name: idx_insight_logs_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_insight_logs_created ON public.pf_insight_logs USING btree (created_at DESC);


--
-- Name: idx_ip_reputation_score; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ip_reputation_score ON public.ip_reputation USING btree (score);


--
-- Name: idx_issue_priority_issue_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_issue_priority_issue_id ON public.pf_clarity_issue_priority USING btree (issue_id);


--
-- Name: idx_issue_priority_score; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_issue_priority_score ON public.pf_clarity_issue_priority USING btree (ai_priority_score DESC);


--
-- Name: idx_learning_results_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_learning_results_created_at ON public.learning_results USING btree (created_at);


--
-- Name: idx_learning_results_relevance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_learning_results_relevance ON public.learning_results USING btree (relevance_score DESC);


--
-- Name: idx_media_cache_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_media_cache_hash ON public.pf_media_cache USING btree (hash);


--
-- Name: idx_media_cache_ttl; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_media_cache_ttl ON public.pf_media_cache USING btree (ttl_expiration);


--
-- Name: idx_modernizer_jobs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_modernizer_jobs_status ON public.modernizer_jobs USING btree (job_status);


--
-- Name: idx_modernizer_jobs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_modernizer_jobs_user_id ON public.modernizer_jobs USING btree (user_id);


--
-- Name: idx_modernizer_jobs_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_modernizer_jobs_user_status ON public.modernizer_jobs USING btree (user_id, job_status);


--
-- Name: idx_modernizer_reports_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_modernizer_reports_job_id ON public.modernizer_reports USING btree (job_id);


--
-- Name: idx_modernizer_user_limits_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_modernizer_user_limits_user ON public.modernizer_user_limits USING btree (user_id);


--
-- Name: idx_nexus_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nexus_logs_created_at ON public.nexus_logs USING btree (created_at DESC);


--
-- Name: idx_nexus_logs_provider; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nexus_logs_provider ON public.nexus_logs USING btree (provider);


--
-- Name: idx_nexus_logs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nexus_logs_status ON public.nexus_logs USING btree (status);


--
-- Name: idx_pf_ai_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pf_ai_logs_created_at ON public.pf_ai_logs USING btree (created_at DESC);


--
-- Name: idx_pf_ai_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pf_ai_logs_user_id ON public.pf_ai_logs USING btree (user_id);


--
-- Name: idx_pf_brain_anomalies_resolved; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pf_brain_anomalies_resolved ON public.pf_brain_anomalies USING btree (resolved);


--
-- Name: idx_pf_brain_ml_models_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pf_brain_ml_models_status ON public.pf_brain_ml_models USING btree (status);


--
-- Name: idx_portfolio_stats_calculated; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_portfolio_stats_calculated ON public.pf_clarity_portfolio_stats USING btree (calculated_at DESC);


--
-- Name: idx_portfolio_stats_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_portfolio_stats_user_id ON public.pf_clarity_portfolio_stats USING btree (user_id);


--
-- Name: idx_profiles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_user_id ON public.profiles USING btree (user_id);


--
-- Name: idx_proposals_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proposals_status ON public.evolution_proposals USING btree (status, created_at DESC);


--
-- Name: idx_proposals_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proposals_target ON public.evolution_proposals USING btree (target_system, status);


--
-- Name: idx_reports_generated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reports_generated_at ON public.pf_clarity_reports USING btree (generated_at DESC);


--
-- Name: idx_reports_site_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reports_site_id ON public.pf_clarity_reports USING btree (site_id);


--
-- Name: idx_scan_queue_site; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scan_queue_site ON public.pf_clarity_scan_queue USING btree (site_id);


--
-- Name: idx_scan_queue_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scan_queue_status ON public.pf_clarity_scan_queue USING btree (status, scheduled_for);


--
-- Name: idx_scheduled_scans_next_run; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scheduled_scans_next_run ON public.pf_clarity_scheduled_scans USING btree (next_run_at) WHERE (is_active = true);


--
-- Name: idx_scheduled_scans_site; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scheduled_scans_site ON public.pf_clarity_scheduled_scans USING btree (site_id);


--
-- Name: idx_studio_applies_preview; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_studio_applies_preview ON public.studio_applies USING btree (preview_id);


--
-- Name: idx_studio_audit_actor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_studio_audit_actor ON public.studio_audit USING btree (actor_id);


--
-- Name: idx_studio_audit_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_studio_audit_entity ON public.studio_audit USING btree (entity, entity_id);


--
-- Name: idx_studio_connections_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_studio_connections_user ON public.studio_connections USING btree (user_id);


--
-- Name: idx_studio_previews_scan; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_studio_previews_scan ON public.studio_previews USING btree (scan_id);


--
-- Name: idx_studio_scans_connection; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_studio_scans_connection ON public.studio_scans USING btree (connection_id);


--
-- Name: idx_studio_verifications_apply; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_studio_verifications_apply ON public.studio_verifications USING btree (apply_id);


--
-- Name: idx_system_updates_proposal; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_system_updates_proposal ON public.system_updates USING btree (proposal_id);


--
-- Name: idx_system_updates_system; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_system_updates_system ON public.system_updates USING btree (target_system, created_at DESC);


--
-- Name: idx_tenants_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenants_status ON public.tenants USING btree (status);


--
-- Name: idx_text_outputs_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_text_outputs_project ON public.pf_text_outputs USING btree (project_id, created_at DESC);


--
-- Name: idx_usage_metrics_ts; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usage_metrics_ts ON public.usage_metrics USING btree (ts DESC);


--
-- Name: idx_video_outputs_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_video_outputs_project ON public.pf_video_outputs USING btree (project_id, created_at DESC);


--
-- Name: idx_whitelabel_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_whitelabel_user_id ON public.pf_clarity_whitelabel USING btree (user_id);


--
-- Name: idx_widget_analytics_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_widget_analytics_date ON public.pf_clarity_widget_analytics USING btree (date DESC);


--
-- Name: idx_widget_analytics_widget_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_widget_analytics_widget_id ON public.pf_clarity_widget_analytics USING btree (widget_id);


--
-- Name: idx_widgets_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_widgets_key ON public.pf_clarity_widgets USING btree (widget_key);


--
-- Name: idx_widgets_site_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_widgets_site_id ON public.pf_clarity_widgets USING btree (site_id);


--
-- Name: idx_wp_connections_site_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wp_connections_site_id ON public.pf_clarity_wp_connections USING btree (site_id);


--
-- Name: idx_wp_connections_sync_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wp_connections_sync_status ON public.pf_clarity_wp_connections USING btree (sync_status);


--
-- Name: pf_clarity_agent_config update_clarity_agent_config_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_clarity_agent_config_updated_at BEFORE UPDATE ON public.pf_clarity_agent_config FOR EACH ROW EXECUTE FUNCTION public.update_clarity_updated_at();


--
-- Name: pf_clarity_api_keys update_clarity_api_keys_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_clarity_api_keys_updated_at BEFORE UPDATE ON public.pf_clarity_api_keys FOR EACH ROW EXECUTE FUNCTION public.update_clarity_updated_at();


--
-- Name: pf_clarity_notifications update_clarity_notifications_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_clarity_notifications_updated_at BEFORE UPDATE ON public.pf_clarity_notifications FOR EACH ROW EXECUTE FUNCTION public.update_clarity_updated_at();


--
-- Name: pf_clarity_sites update_clarity_sites_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_clarity_sites_updated_at BEFORE UPDATE ON public.pf_clarity_sites FOR EACH ROW EXECUTE FUNCTION public.update_clarity_updated_at();


--
-- Name: pf_clarity_subscriptions update_clarity_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_clarity_subscriptions_updated_at BEFORE UPDATE ON public.pf_clarity_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_clarity_updated_at();


--
-- Name: pf_clarity_teams update_clarity_teams_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_clarity_teams_updated_at BEFORE UPDATE ON public.pf_clarity_teams FOR EACH ROW EXECUTE FUNCTION public.update_clarity_updated_at();


--
-- Name: pf_clarity_webhooks update_clarity_webhooks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_clarity_webhooks_updated_at BEFORE UPDATE ON public.pf_clarity_webhooks FOR EACH ROW EXECUTE FUNCTION public.update_clarity_updated_at();


--
-- Name: pf_clarity_scheduled_scans update_scheduled_scans_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_scheduled_scans_updated_at BEFORE UPDATE ON public.pf_clarity_scheduled_scans FOR EACH ROW EXECUTE FUNCTION public.update_clarity_updated_at();


--
-- Name: pf_clarity_whitelabel update_whitelabel_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_whitelabel_updated_at BEFORE UPDATE ON public.pf_clarity_whitelabel FOR EACH ROW EXECUTE FUNCTION public.update_clarity_updated_at();


--
-- Name: pf_clarity_widgets update_widgets_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_widgets_updated_at BEFORE UPDATE ON public.pf_clarity_widgets FOR EACH ROW EXECUTE FUNCTION public.update_clarity_updated_at();


--
-- Name: pf_clarity_wp_connections update_wp_connections_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_wp_connections_updated_at BEFORE UPDATE ON public.pf_clarity_wp_connections FOR EACH ROW EXECUTE FUNCTION public.update_clarity_updated_at();


--
-- Name: accessibility_scans accessibility_scans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accessibility_scans
    ADD CONSTRAINT accessibility_scans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: brain_reinforcement_log brain_reinforcement_log_edge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brain_reinforcement_log
    ADD CONSTRAINT brain_reinforcement_log_edge_id_fkey FOREIGN KEY (edge_id) REFERENCES public.brain_graph_edges(id);


--
-- Name: cost_logs cost_logs_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_logs
    ADD CONSTRAINT cost_logs_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.modernizer_jobs(id) ON DELETE CASCADE;


--
-- Name: cost_logs cost_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_logs
    ADD CONSTRAINT cost_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: learning_confidence learning_confidence_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_confidence
    ADD CONSTRAINT learning_confidence_result_id_fkey FOREIGN KEY (result_id) REFERENCES public.learning_results(id);


--
-- Name: modernizer_extractions modernizer_extractions_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modernizer_extractions
    ADD CONSTRAINT modernizer_extractions_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.modernizer_jobs(id) ON DELETE CASCADE;


--
-- Name: modernizer_outputs modernizer_outputs_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modernizer_outputs
    ADD CONSTRAINT modernizer_outputs_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.modernizer_jobs(id) ON DELETE CASCADE;


--
-- Name: modernizer_reports modernizer_reports_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modernizer_reports
    ADD CONSTRAINT modernizer_reports_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.modernizer_jobs(id) ON DELETE CASCADE;


--
-- Name: modernizer_user_limits modernizer_user_limits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modernizer_user_limits
    ADD CONSTRAINT modernizer_user_limits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: pf_ai_logs pf_ai_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_ai_logs
    ADD CONSTRAINT pf_ai_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: pf_brain_ml_predictions pf_brain_ml_predictions_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_brain_ml_predictions
    ADD CONSTRAINT pf_brain_ml_predictions_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.pf_brain_ml_models(id);


--
-- Name: pf_clarity_agent_config pf_clarity_agent_config_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_agent_config
    ADD CONSTRAINT pf_clarity_agent_config_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.pf_clarity_sites(id) ON DELETE CASCADE;


--
-- Name: pf_clarity_api_usage pf_clarity_api_usage_api_key_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_api_usage
    ADD CONSTRAINT pf_clarity_api_usage_api_key_id_fkey FOREIGN KEY (api_key_id) REFERENCES public.pf_clarity_api_keys(id) ON DELETE CASCADE;


--
-- Name: pf_clarity_certifications pf_clarity_certifications_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_certifications
    ADD CONSTRAINT pf_clarity_certifications_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.pf_clarity_sites(id) ON DELETE CASCADE;


--
-- Name: pf_clarity_compliance_history pf_clarity_compliance_history_scan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_compliance_history
    ADD CONSTRAINT pf_clarity_compliance_history_scan_id_fkey FOREIGN KEY (scan_id) REFERENCES public.pf_clarity_scans(id) ON DELETE SET NULL;


--
-- Name: pf_clarity_compliance_history pf_clarity_compliance_history_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_compliance_history
    ADD CONSTRAINT pf_clarity_compliance_history_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.pf_clarity_sites(id) ON DELETE CASCADE;


--
-- Name: pf_clarity_email_follows pf_clarity_email_follows_scan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_email_follows
    ADD CONSTRAINT pf_clarity_email_follows_scan_id_fkey FOREIGN KEY (scan_id) REFERENCES public.accessibility_scans(id);


--
-- Name: pf_clarity_fix_suggestions pf_clarity_fix_suggestions_issue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_fix_suggestions
    ADD CONSTRAINT pf_clarity_fix_suggestions_issue_id_fkey FOREIGN KEY (issue_id) REFERENCES public.pf_clarity_issues(id) ON DELETE CASCADE;


--
-- Name: pf_clarity_fixes pf_clarity_fixes_issue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_fixes
    ADD CONSTRAINT pf_clarity_fixes_issue_id_fkey FOREIGN KEY (issue_id) REFERENCES public.pf_clarity_issues(id) ON DELETE CASCADE;


--
-- Name: pf_clarity_issue_priority pf_clarity_issue_priority_issue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_issue_priority
    ADD CONSTRAINT pf_clarity_issue_priority_issue_id_fkey FOREIGN KEY (issue_id) REFERENCES public.pf_clarity_issues(id) ON DELETE CASCADE;


--
-- Name: pf_clarity_issues pf_clarity_issues_scan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_issues
    ADD CONSTRAINT pf_clarity_issues_scan_id_fkey FOREIGN KEY (scan_id) REFERENCES public.pf_clarity_scans(id) ON DELETE CASCADE;


--
-- Name: pf_clarity_notification_log pf_clarity_notification_log_scan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_notification_log
    ADD CONSTRAINT pf_clarity_notification_log_scan_id_fkey FOREIGN KEY (scan_id) REFERENCES public.pf_clarity_scans(id) ON DELETE CASCADE;


--
-- Name: pf_clarity_reports pf_clarity_reports_scan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_reports
    ADD CONSTRAINT pf_clarity_reports_scan_id_fkey FOREIGN KEY (scan_id) REFERENCES public.pf_clarity_scans(id) ON DELETE SET NULL;


--
-- Name: pf_clarity_reports pf_clarity_reports_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_reports
    ADD CONSTRAINT pf_clarity_reports_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.pf_clarity_sites(id) ON DELETE CASCADE;


--
-- Name: pf_clarity_scan_queue pf_clarity_scan_queue_scheduled_scan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_scan_queue
    ADD CONSTRAINT pf_clarity_scan_queue_scheduled_scan_id_fkey FOREIGN KEY (scheduled_scan_id) REFERENCES public.pf_clarity_scheduled_scans(id) ON DELETE SET NULL;


--
-- Name: pf_clarity_scan_queue pf_clarity_scan_queue_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_scan_queue
    ADD CONSTRAINT pf_clarity_scan_queue_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.pf_clarity_sites(id) ON DELETE CASCADE;


--
-- Name: pf_clarity_scans pf_clarity_scans_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_scans
    ADD CONSTRAINT pf_clarity_scans_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.pf_clarity_sites(id) ON DELETE CASCADE;


--
-- Name: pf_clarity_scheduled_scans pf_clarity_scheduled_scans_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_scheduled_scans
    ADD CONSTRAINT pf_clarity_scheduled_scans_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.pf_clarity_sites(id) ON DELETE CASCADE;


--
-- Name: pf_clarity_sites pf_clarity_sites_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_sites
    ADD CONSTRAINT pf_clarity_sites_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.pf_clarity_teams(id) ON DELETE SET NULL;


--
-- Name: pf_clarity_sites pf_clarity_sites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_sites
    ADD CONSTRAINT pf_clarity_sites_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: pf_clarity_subscriptions pf_clarity_subscriptions_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_subscriptions
    ADD CONSTRAINT pf_clarity_subscriptions_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.pf_clarity_sites(id) ON DELETE CASCADE;


--
-- Name: pf_clarity_team_invites pf_clarity_team_invites_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_team_invites
    ADD CONSTRAINT pf_clarity_team_invites_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.pf_clarity_teams(id) ON DELETE CASCADE;


--
-- Name: pf_clarity_team_members pf_clarity_team_members_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_team_members
    ADD CONSTRAINT pf_clarity_team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.pf_clarity_teams(id) ON DELETE CASCADE;


--
-- Name: pf_clarity_webhooks pf_clarity_webhooks_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_webhooks
    ADD CONSTRAINT pf_clarity_webhooks_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.pf_clarity_sites(id) ON DELETE CASCADE;


--
-- Name: pf_clarity_widget_analytics pf_clarity_widget_analytics_widget_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_widget_analytics
    ADD CONSTRAINT pf_clarity_widget_analytics_widget_id_fkey FOREIGN KEY (widget_id) REFERENCES public.pf_clarity_widgets(id) ON DELETE CASCADE;


--
-- Name: pf_clarity_widgets pf_clarity_widgets_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_widgets
    ADD CONSTRAINT pf_clarity_widgets_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.pf_clarity_sites(id) ON DELETE CASCADE;


--
-- Name: pf_clarity_wp_connections pf_clarity_wp_connections_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_clarity_wp_connections
    ADD CONSTRAINT pf_clarity_wp_connections_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.pf_clarity_sites(id) ON DELETE CASCADE;


--
-- Name: pf_deployments pf_deployments_deployed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pf_deployments
    ADD CONSTRAINT pf_deployments_deployed_by_fkey FOREIGN KEY (deployed_by) REFERENCES auth.users(id);


--
-- Name: studio_applies studio_applies_preview_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.studio_applies
    ADD CONSTRAINT studio_applies_preview_id_fkey FOREIGN KEY (preview_id) REFERENCES public.studio_previews(id) ON DELETE CASCADE;


--
-- Name: studio_previews studio_previews_scan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.studio_previews
    ADD CONSTRAINT studio_previews_scan_id_fkey FOREIGN KEY (scan_id) REFERENCES public.studio_scans(id) ON DELETE CASCADE;


--
-- Name: studio_scans studio_scans_connection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.studio_scans
    ADD CONSTRAINT studio_scans_connection_id_fkey FOREIGN KEY (connection_id) REFERENCES public.studio_connections(id) ON DELETE CASCADE;


--
-- Name: studio_verifications studio_verifications_apply_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.studio_verifications
    ADD CONSTRAINT studio_verifications_apply_id_fkey FOREIGN KEY (apply_id) REFERENCES public.studio_applies(id) ON DELETE CASCADE;


--
-- Name: user_limits user_limits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_limits
    ADD CONSTRAINT user_limits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: brain_memory_hot Admin and service can read brain_memory_hot; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin and service can read brain_memory_hot" ON public.brain_memory_hot FOR SELECT USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR (auth.role() = 'service_role'::text)));


--
-- Name: pf_deployments Admin can insert deployments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can insert deployments" ON public.pf_deployments FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: system_updates Admin can insert updates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can insert updates" ON public.system_updates FOR INSERT WITH CHECK (true);


--
-- Name: defense_events Admin can read defense_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can read defense_events" ON public.defense_events FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: ecosystem_memory Admin can read ecosystem memory; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can read ecosystem memory" ON public.ecosystem_memory FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: evolution_proposals Admin can read proposals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can read proposals" ON public.evolution_proposals FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: system_updates Admin can read updates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can read updates" ON public.system_updates FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: evolution_proposals Admin can update proposals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can update proposals" ON public.evolution_proposals FOR UPDATE USING (true);


--
-- Name: pf_deployments Admin can view deployments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can view deployments" ON public.pf_deployments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: pf_security_events Admin can view security events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can view security events" ON public.pf_security_events FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: pf_system_config Admin can view system config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can view system config" ON public.pf_system_config USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: user_roles Admins can manage all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all roles" ON public.user_roles TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: brain_curiosity_settings Admins can manage curiosity settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage curiosity settings" ON public.brain_curiosity_settings TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: pf_ai_logs Admins can view all AI logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all AI logs" ON public.pf_ai_logs FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: accessibility_scans Allow public read access to accessibility scans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to accessibility scans" ON public.accessibility_scans FOR SELECT USING (true);


--
-- Name: global_correlation Allow public read access to global_correlation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to global_correlation" ON public.global_correlation FOR SELECT USING (true);


--
-- Name: global_forecasts Allow public read access to global_forecasts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to global_forecasts" ON public.global_forecasts FOR SELECT USING (true);


--
-- Name: global_signals Allow public read access to global_signals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to global_signals" ON public.global_signals FOR SELECT USING (true);


--
-- Name: pf_global_threat_feed Allow public read access to threat feed; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to threat feed" ON public.pf_global_threat_feed FOR SELECT USING (true);


--
-- Name: pf_threat_statistics Allow public read access to threat statistics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to threat statistics" ON public.pf_threat_statistics FOR SELECT USING (true);


--
-- Name: audit_logs Allow public read on audit_logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read on audit_logs" ON public.audit_logs FOR SELECT USING (true);


--
-- Name: brain_curiosity_log Allow public read on brain_curiosity_log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read on brain_curiosity_log" ON public.brain_curiosity_log FOR SELECT USING (true);


--
-- Name: brain_events Allow public read on brain_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read on brain_events" ON public.brain_events FOR SELECT USING (true);


--
-- Name: brain_forecasts Allow public read on brain_forecasts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read on brain_forecasts" ON public.brain_forecasts FOR SELECT USING (true);


--
-- Name: brain_memory_cold Allow public read on brain_memory_cold; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read on brain_memory_cold" ON public.brain_memory_cold FOR SELECT USING (true);


--
-- Name: brain_persona Allow public read on brain_persona; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read on brain_persona" ON public.brain_persona FOR SELECT USING (true);


--
-- Name: brain_policy Allow public read on brain_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read on brain_policy" ON public.brain_policy FOR SELECT USING (true);


--
-- Name: brain_reflection_log Allow public read on brain_reflection_log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read on brain_reflection_log" ON public.brain_reflection_log FOR SELECT USING (true);


--
-- Name: brain_reflections Allow public read on brain_reflections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read on brain_reflections" ON public.brain_reflections FOR SELECT USING (true);


--
-- Name: ip_reputation Allow public read on ip_reputation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read on ip_reputation" ON public.ip_reputation FOR SELECT USING (true);


--
-- Name: system_config Allow public read on system_config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read on system_config" ON public.system_config FOR SELECT USING (true);


--
-- Name: brain_cross_insights Authenticated users can read cross insights; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read cross insights" ON public.brain_cross_insights FOR SELECT TO authenticated USING (true);


--
-- Name: brain_curiosity_settings Authenticated users can read curiosity settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read curiosity settings" ON public.brain_curiosity_settings FOR SELECT TO authenticated USING (true);


--
-- Name: brain_reinforcement_log Authenticated users can read reinforcement logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read reinforcement logs" ON public.brain_reinforcement_log FOR SELECT TO authenticated USING (true);


--
-- Name: pf_insight_logs Authenticated users only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users only" ON public.pf_insight_logs TO authenticated USING (true);


--
-- Name: pf_clarity_admin_stats Only admins can view admin stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can view admin stats" ON public.pf_clarity_admin_stats FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: system_updates Public can read updates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read updates" ON public.system_updates FOR SELECT USING (true);


--
-- Name: profiles Public profiles are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);


--
-- Name: access_scans Public read access_scans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read access_scans" ON public.access_scans FOR SELECT TO authenticated, anon USING (true);


--
-- Name: pf_brain_anomalies Public read anomalies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read anomalies" ON public.pf_brain_anomalies FOR SELECT USING (true);


--
-- Name: pf_brain_behavioral_patterns Public read behavioral_patterns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read behavioral_patterns" ON public.pf_brain_behavioral_patterns FOR SELECT USING (true);


--
-- Name: brain_daily_reports Public read brain_daily_reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read brain_daily_reports" ON public.brain_daily_reports FOR SELECT USING (true);


--
-- Name: brain_domain_usage Public read brain_domain_usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read brain_domain_usage" ON public.brain_domain_usage FOR SELECT USING (true);


--
-- Name: brain_metrics Public read brain_metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read brain_metrics" ON public.brain_metrics FOR SELECT USING (true);


--
-- Name: brain_persona_patterns Public read brain_persona_patterns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read brain_persona_patterns" ON public.brain_persona_patterns FOR SELECT USING (true);


--
-- Name: brain_persona_state Public read brain_persona_state; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read brain_persona_state" ON public.brain_persona_state FOR SELECT USING (true);


--
-- Name: brain_proxy_logs Public read brain_proxy_logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read brain_proxy_logs" ON public.brain_proxy_logs FOR SELECT USING (true);


--
-- Name: brain_reach_domains Public read brain_reach_domains; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read brain_reach_domains" ON public.brain_reach_domains FOR SELECT USING (true);


--
-- Name: brain_sensory_events Public read brain_sensory_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read brain_sensory_events" ON public.brain_sensory_events FOR SELECT USING (true);


--
-- Name: causal_traces Public read causal_traces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read causal_traces" ON public.causal_traces FOR SELECT USING (true);


--
-- Name: core_plans Public read core_plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read core_plans" ON public.core_plans FOR SELECT USING (true);


--
-- Name: core_settings Public read core_settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read core_settings" ON public.core_settings FOR SELECT TO authenticated, anon USING (true);


--
-- Name: daily_state Public read daily_state; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read daily_state" ON public.daily_state FOR SELECT USING (true);


--
-- Name: defense_rules Public read defense_rules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read defense_rules" ON public.defense_rules FOR SELECT USING (true);


--
-- Name: dream_log Public read dream_log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read dream_log" ON public.dream_log FOR SELECT USING (true);


--
-- Name: dream_sessions Public read dream_sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read dream_sessions" ON public.dream_sessions FOR SELECT TO authenticated, anon USING (true);


--
-- Name: ethical_approvals Public read ethical_approvals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read ethical_approvals" ON public.ethical_approvals FOR SELECT USING (true);


--
-- Name: learning_confidence Public read learning_confidence; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read learning_confidence" ON public.learning_confidence FOR SELECT USING (true);


--
-- Name: learning_cycles Public read learning_cycles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read learning_cycles" ON public.learning_cycles FOR SELECT USING (true);


--
-- Name: learning_patterns Public read learning_patterns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read learning_patterns" ON public.learning_patterns FOR SELECT TO authenticated, anon USING (true);


--
-- Name: learning_results Public read learning_results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read learning_results" ON public.learning_results FOR SELECT USING (true);


--
-- Name: pf_brain_ml_models Public read ml_models; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read ml_models" ON public.pf_brain_ml_models FOR SELECT USING (true);


--
-- Name: pf_brain_ml_predictions Public read predictions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read predictions" ON public.pf_brain_ml_predictions FOR SELECT USING (true);


--
-- Name: resilience_ledger Public read resilience_ledger; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read resilience_ledger" ON public.resilience_ledger FOR SELECT USING (true);


--
-- Name: ripple_campaigns Public read ripple_campaigns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read ripple_campaigns" ON public.ripple_campaigns FOR SELECT USING (true);


--
-- Name: tenants Public read tenants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read tenants" ON public.tenants FOR SELECT USING (true);


--
-- Name: usage_metrics Public read usage_metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read usage_metrics" ON public.usage_metrics FOR SELECT USING (true);


--
-- Name: v_user_summary Public read v_user_summary; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read v_user_summary" ON public.v_user_summary FOR SELECT USING (true);


--
-- Name: pf_clarity_clients Resellers can manage their clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Resellers can manage their clients" ON public.pf_clarity_clients USING ((reseller_id = auth.uid()));


--
-- Name: pf_clarity_compliance_history Service can insert compliance history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service can insert compliance history" ON public.pf_clarity_compliance_history FOR INSERT WITH CHECK (true);


--
-- Name: modernizer_reports Service can insert reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service can insert reports" ON public.modernizer_reports FOR INSERT WITH CHECK (true);


--
-- Name: pf_cost_logs Service can manage cost logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service can manage cost logs" ON public.pf_cost_logs USING (true);


--
-- Name: pf_image_outputs Service can manage image outputs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service can manage image outputs" ON public.pf_image_outputs USING (true);


--
-- Name: pf_media_cache Service can manage media cache; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service can manage media cache" ON public.pf_media_cache USING (true);


--
-- Name: pf_clarity_scan_queue Service can manage scan queue; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service can manage scan queue" ON public.pf_clarity_scan_queue USING (true) WITH CHECK (true);


--
-- Name: pf_text_outputs Service can manage text outputs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service can manage text outputs" ON public.pf_text_outputs USING (true);


--
-- Name: pf_video_outputs Service can manage video outputs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service can manage video outputs" ON public.pf_video_outputs USING (true);


--
-- Name: access_scans Service role all access_scans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all access_scans" ON public.access_scans TO service_role USING (true);


--
-- Name: bot_sniper_api_keys Service role all bot_sniper_api_keys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all bot_sniper_api_keys" ON public.bot_sniper_api_keys TO service_role USING (true);


--
-- Name: brain_daily_reports Service role all brain_daily_reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all brain_daily_reports" ON public.brain_daily_reports USING (true);


--
-- Name: brain_domain_usage Service role all brain_domain_usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all brain_domain_usage" ON public.brain_domain_usage USING (true);


--
-- Name: brain_metrics Service role all brain_metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all brain_metrics" ON public.brain_metrics USING (true);


--
-- Name: brain_persona_patterns Service role all brain_persona_patterns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all brain_persona_patterns" ON public.brain_persona_patterns USING (true);


--
-- Name: brain_persona_state Service role all brain_persona_state; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all brain_persona_state" ON public.brain_persona_state USING (true);


--
-- Name: brain_proxy_logs Service role all brain_proxy_logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all brain_proxy_logs" ON public.brain_proxy_logs USING (true);


--
-- Name: brain_reach_domains Service role all brain_reach_domains; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all brain_reach_domains" ON public.brain_reach_domains USING (true);


--
-- Name: brain_sensory_events Service role all brain_sensory_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all brain_sensory_events" ON public.brain_sensory_events USING (true);


--
-- Name: causal_traces Service role all causal_traces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all causal_traces" ON public.causal_traces USING (true);


--
-- Name: core_plans Service role all core_plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all core_plans" ON public.core_plans USING (true);


--
-- Name: core_settings Service role all core_settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all core_settings" ON public.core_settings TO service_role USING (true);


--
-- Name: core_subscriptions Service role all core_subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all core_subscriptions" ON public.core_subscriptions TO service_role USING (true);


--
-- Name: core_usage Service role all core_usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all core_usage" ON public.core_usage TO service_role USING (true);


--
-- Name: daily_state Service role all daily_state; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all daily_state" ON public.daily_state USING (true);


--
-- Name: defense_rules Service role all defense_rules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all defense_rules" ON public.defense_rules USING (true);


--
-- Name: dream_log Service role all dream_log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all dream_log" ON public.dream_log USING (true);


--
-- Name: dream_sessions Service role all dream_sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all dream_sessions" ON public.dream_sessions TO service_role USING (true);


--
-- Name: ethical_approvals Service role all ethical_approvals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all ethical_approvals" ON public.ethical_approvals USING (true);


--
-- Name: learning_cycles Service role all learning_cycles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all learning_cycles" ON public.learning_cycles USING (true);


--
-- Name: learning_patterns Service role all learning_patterns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all learning_patterns" ON public.learning_patterns TO service_role USING (true);


--
-- Name: resilience_ledger Service role all resilience_ledger; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all resilience_ledger" ON public.resilience_ledger USING (true);


--
-- Name: ripple_campaigns Service role all ripple_campaigns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all ripple_campaigns" ON public.ripple_campaigns USING (true);


--
-- Name: tenants Service role all tenants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all tenants" ON public.tenants USING (true);


--
-- Name: usage_metrics Service role all usage_metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all usage_metrics" ON public.usage_metrics USING (true);


--
-- Name: v_user_summary Service role all v_user_summary; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role all v_user_summary" ON public.v_user_summary USING (true);


--
-- Name: ecosystem_memory Service role can insert memory; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert memory" ON public.ecosystem_memory FOR INSERT WITH CHECK (true);


--
-- Name: evolution_proposals Service role can insert proposals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert proposals" ON public.evolution_proposals FOR INSERT WITH CHECK (true);


--
-- Name: ai_daily_quota Service role can manage ai_daily_quota; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage ai_daily_quota" ON public.ai_daily_quota USING ((auth.role() = 'service_role'::text));


--
-- Name: ai_learning_data Service role can manage ai_learning_data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage ai_learning_data" ON public.ai_learning_data USING ((auth.role() = 'service_role'::text));


--
-- Name: ai_usage_log Service role can manage ai_usage_log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage ai_usage_log" ON public.ai_usage_log USING ((auth.role() = 'service_role'::text));


--
-- Name: accessibility_scans Service role can manage all accessibility scans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage all accessibility scans" ON public.accessibility_scans USING ((auth.role() = 'service_role'::text));


--
-- Name: daily_state Service role can manage daily state; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage daily state" ON public.daily_state USING (true) WITH CHECK (true);


--
-- Name: pf_clarity_email_follows Service role can manage email follows; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage email follows" ON public.pf_clarity_email_follows USING ((auth.role() = 'service_role'::text));


--
-- Name: modernizer_extractions Service role can manage extractions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage extractions" ON public.modernizer_extractions USING ((auth.role() = 'service_role'::text));


--
-- Name: learning_results Service role can manage learning_results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage learning_results" ON public.learning_results USING (true);


--
-- Name: modernizer_outputs Service role can manage outputs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage outputs" ON public.modernizer_outputs USING ((auth.role() = 'service_role'::text));


--
-- Name: modernizer_reports Service role can manage reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage reports" ON public.modernizer_reports USING ((auth.role() = 'service_role'::text));


--
-- Name: brain_memory_hot Service role can write brain_memory_hot; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can write brain_memory_hot" ON public.brain_memory_hot FOR INSERT WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: audit_logs Service role full access audit_logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role full access audit_logs" ON public.audit_logs USING (true);


--
-- Name: brain_actions_queue Service role full access brain_actions_queue; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role full access brain_actions_queue" ON public.brain_actions_queue USING (true);


--
-- Name: brain_events Service role full access brain_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role full access brain_events" ON public.brain_events USING (true);


--
-- Name: brain_feedback Service role full access brain_feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role full access brain_feedback" ON public.brain_feedback USING (true);


--
-- Name: brain_graph_edges Service role full access brain_graph_edges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role full access brain_graph_edges" ON public.brain_graph_edges USING (true);


--
-- Name: brain_memory_cold Service role full access brain_memory_cold; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role full access brain_memory_cold" ON public.brain_memory_cold USING (true);


--
-- Name: defense_events Service role full access defense_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role full access defense_events" ON public.defense_events USING (true);


--
-- Name: ip_reputation Service role full access ip_reputation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role full access ip_reputation" ON public.ip_reputation USING (true);


--
-- Name: learning_queries Service role full access learning_queries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role full access learning_queries" ON public.learning_queries USING (true);


--
-- Name: modernizer_analytics Service role full access modernizer_analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role full access modernizer_analytics" ON public.modernizer_analytics USING (true);


--
-- Name: system_config Service role full access system_config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role full access system_config" ON public.system_config USING (true);


--
-- Name: brain_events Service role full access to brain_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role full access to brain_events" ON public.brain_events TO service_role USING (true);


--
-- Name: defense_events Service role full access to defense_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role full access to defense_events" ON public.defense_events TO service_role USING (true);


--
-- Name: ip_reputation Service role full access to ip_reputation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role full access to ip_reputation" ON public.ip_reputation TO service_role USING (true);


--
-- Name: studio_audit Service role full studio_audit; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role full studio_audit" ON public.studio_audit USING (true);


--
-- Name: brain_actions_queue Service role only access for brain_actions_queue; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role only access for brain_actions_queue" ON public.brain_actions_queue USING ((auth.role() = 'service_role'::text));


--
-- Name: brain_events Service role only access for brain_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role only access for brain_events" ON public.brain_events USING ((auth.role() = 'service_role'::text));


--
-- Name: daily_state Service role only access for daily_state; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role only access for daily_state" ON public.daily_state USING ((auth.role() = 'service_role'::text));


--
-- Name: dream_sessions Service role only access for dream_sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role only access for dream_sessions" ON public.dream_sessions USING ((auth.role() = 'service_role'::text));


--
-- Name: learning_queries Service role only access for learning_queries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role only access for learning_queries" ON public.learning_queries USING ((auth.role() = 'service_role'::text));


--
-- Name: usage_metrics Service role only access for usage_metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role only access for usage_metrics" ON public.usage_metrics USING ((auth.role() = 'service_role'::text));


--
-- Name: brain_cross_insights System can create cross insights; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can create cross insights" ON public.brain_cross_insights FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: brain_reinforcement_log System can insert reinforcement logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert reinforcement logs" ON public.brain_reinforcement_log FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: pf_clarity_team_invites Team members can view invites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Team members can view invites" ON public.pf_clarity_team_invites FOR SELECT USING ((team_id IN ( SELECT pf_clarity_teams.id
   FROM public.pf_clarity_teams
  WHERE (pf_clarity_teams.owner_id = auth.uid())
UNION
 SELECT pf_clarity_team_members.team_id
   FROM public.pf_clarity_team_members
  WHERE (pf_clarity_team_members.user_id = auth.uid()))));


--
-- Name: pf_clarity_team_members Team owners and admins can add members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Team owners and admins can add members" ON public.pf_clarity_team_members FOR INSERT WITH CHECK ((team_id IN ( SELECT pf_clarity_teams.id
   FROM public.pf_clarity_teams
  WHERE (pf_clarity_teams.owner_id = auth.uid())
UNION
 SELECT pf_clarity_team_members_1.team_id
   FROM public.pf_clarity_team_members pf_clarity_team_members_1
  WHERE ((pf_clarity_team_members_1.user_id = auth.uid()) AND (pf_clarity_team_members_1.role = ANY (ARRAY['owner'::text, 'admin'::text]))))));


--
-- Name: pf_clarity_team_invites Team owners and admins can create invites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Team owners and admins can create invites" ON public.pf_clarity_team_invites FOR INSERT WITH CHECK ((team_id IN ( SELECT pf_clarity_teams.id
   FROM public.pf_clarity_teams
  WHERE (pf_clarity_teams.owner_id = auth.uid())
UNION
 SELECT pf_clarity_team_members.team_id
   FROM public.pf_clarity_team_members
  WHERE ((pf_clarity_team_members.user_id = auth.uid()) AND (pf_clarity_team_members.role = ANY (ARRAY['owner'::text, 'admin'::text]))))));


--
-- Name: pf_clarity_team_invites Team owners and admins can delete invites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Team owners and admins can delete invites" ON public.pf_clarity_team_invites FOR DELETE USING ((team_id IN ( SELECT pf_clarity_teams.id
   FROM public.pf_clarity_teams
  WHERE (pf_clarity_teams.owner_id = auth.uid())
UNION
 SELECT pf_clarity_team_members.team_id
   FROM public.pf_clarity_team_members
  WHERE ((pf_clarity_team_members.user_id = auth.uid()) AND (pf_clarity_team_members.role = ANY (ARRAY['owner'::text, 'admin'::text]))))));


--
-- Name: pf_clarity_team_members Team owners and admins can remove members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Team owners and admins can remove members" ON public.pf_clarity_team_members FOR DELETE USING ((team_id IN ( SELECT pf_clarity_teams.id
   FROM public.pf_clarity_teams
  WHERE (pf_clarity_teams.owner_id = auth.uid())
UNION
 SELECT pf_clarity_team_members_1.team_id
   FROM public.pf_clarity_team_members pf_clarity_team_members_1
  WHERE ((pf_clarity_team_members_1.user_id = auth.uid()) AND (pf_clarity_team_members_1.role = ANY (ARRAY['owner'::text, 'admin'::text]))))));


--
-- Name: pf_clarity_teams Team owners can delete their teams; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Team owners can delete their teams" ON public.pf_clarity_teams FOR DELETE USING ((owner_id = auth.uid()));


--
-- Name: pf_clarity_teams Team owners can update their teams; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Team owners can update their teams" ON public.pf_clarity_teams FOR UPDATE USING ((owner_id = auth.uid()));


--
-- Name: studio_applies Users access own studio_applies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users access own studio_applies" ON public.studio_applies USING ((preview_id IN ( SELECT studio_previews.id
   FROM public.studio_previews
  WHERE (studio_previews.scan_id IN ( SELECT studio_scans.id
           FROM public.studio_scans
          WHERE (studio_scans.connection_id IN ( SELECT studio_connections.id
                   FROM public.studio_connections
                  WHERE (studio_connections.user_id = auth.uid()))))))));


--
-- Name: studio_previews Users access own studio_previews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users access own studio_previews" ON public.studio_previews USING ((scan_id IN ( SELECT studio_scans.id
   FROM public.studio_scans
  WHERE (studio_scans.connection_id IN ( SELECT studio_connections.id
           FROM public.studio_connections
          WHERE (studio_connections.user_id = auth.uid()))))));


--
-- Name: studio_scans Users access own studio_scans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users access own studio_scans" ON public.studio_scans USING ((connection_id IN ( SELECT studio_connections.id
   FROM public.studio_connections
  WHERE (studio_connections.user_id = auth.uid()))));


--
-- Name: studio_verifications Users access own studio_verifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users access own studio_verifications" ON public.studio_verifications USING ((apply_id IN ( SELECT studio_applies.id
   FROM public.studio_applies
  WHERE (studio_applies.preview_id IN ( SELECT studio_previews.id
           FROM public.studio_previews
          WHERE (studio_previews.scan_id IN ( SELECT studio_scans.id
                   FROM public.studio_scans
                  WHERE (studio_scans.connection_id IN ( SELECT studio_connections.id
                           FROM public.studio_connections
                          WHERE (studio_connections.user_id = auth.uid()))))))))));


--
-- Name: pf_media_cache Users can access media cache; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can access media cache" ON public.pf_media_cache FOR SELECT USING (true);


--
-- Name: pf_clarity_reports Users can create reports for their sites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create reports for their sites" ON public.pf_clarity_reports FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.pf_clarity_sites
  WHERE ((pf_clarity_sites.id = pf_clarity_reports.site_id) AND (pf_clarity_sites.user_id = auth.uid())))));


--
-- Name: pf_clarity_scheduled_scans Users can create scheduled scans for their sites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create scheduled scans for their sites" ON public.pf_clarity_scheduled_scans FOR INSERT WITH CHECK ((site_id IN ( SELECT pf_clarity_sites.id
   FROM public.pf_clarity_sites
  WHERE (pf_clarity_sites.user_id = auth.uid()))));


--
-- Name: pf_clarity_teams Users can create teams; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create teams" ON public.pf_clarity_teams FOR INSERT WITH CHECK ((owner_id = auth.uid()));


--
-- Name: pf_clarity_api_keys Users can create their own API keys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own API keys" ON public.pf_clarity_api_keys FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: modernizer_jobs Users can create their own jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own jobs" ON public.modernizer_jobs FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: pf_clarity_notifications Users can create their own notification settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own notification settings" ON public.pf_clarity_notifications FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: pf_clarity_subscriptions Users can create their own subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own subscriptions" ON public.pf_clarity_subscriptions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: pf_clarity_webhooks Users can create their own webhooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own webhooks" ON public.pf_clarity_webhooks FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: pf_clarity_api_keys Users can delete their own API keys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own API keys" ON public.pf_clarity_api_keys FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: modernizer_jobs Users can delete their own jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own jobs" ON public.modernizer_jobs FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: pf_clarity_sites Users can delete their own sites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own sites" ON public.pf_clarity_sites FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: pf_clarity_webhooks Users can delete their own webhooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own webhooks" ON public.pf_clarity_webhooks FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: pf_clarity_scheduled_scans Users can delete their scheduled scans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their scheduled scans" ON public.pf_clarity_scheduled_scans FOR DELETE USING ((site_id IN ( SELECT pf_clarity_sites.id
   FROM public.pf_clarity_sites
  WHERE (pf_clarity_sites.user_id = auth.uid()))));


--
-- Name: pf_clarity_fix_suggestions Users can insert fixes for their issues; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert fixes for their issues" ON public.pf_clarity_fix_suggestions FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ((public.pf_clarity_issues
     JOIN public.pf_clarity_scans ON ((pf_clarity_issues.scan_id = pf_clarity_scans.id)))
     JOIN public.pf_clarity_sites ON ((pf_clarity_scans.site_id = pf_clarity_sites.id)))
  WHERE ((pf_clarity_issues.id = pf_clarity_fix_suggestions.issue_id) AND (pf_clarity_sites.user_id = auth.uid())))));


--
-- Name: user_limits Users can insert own limits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own limits" ON public.user_limits FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: pf_clarity_scans Users can insert scans for their sites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert scans for their sites" ON public.pf_clarity_scans FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.pf_clarity_sites
  WHERE ((pf_clarity_sites.id = pf_clarity_scans.site_id) AND (pf_clarity_sites.user_id = auth.uid())))));


--
-- Name: accessibility_scans Users can insert their own accessibility scans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own accessibility scans" ON public.accessibility_scans FOR INSERT WITH CHECK (((auth.uid() = user_id) OR (auth.role() = 'service_role'::text)));


--
-- Name: pf_clarity_sites Users can insert their own sites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own sites" ON public.pf_clarity_sites FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: pf_clarity_portfolio_stats Users can insert their portfolio stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their portfolio stats" ON public.pf_clarity_portfolio_stats FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: pf_clarity_agent_config Users can manage config for their sites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage config for their sites" ON public.pf_clarity_agent_config USING ((EXISTS ( SELECT 1
   FROM public.pf_clarity_sites
  WHERE ((pf_clarity_sites.id = pf_clarity_agent_config.site_id) AND (pf_clarity_sites.user_id = auth.uid())))));


--
-- Name: pf_clarity_api_keys Users can manage their own API keys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own API keys" ON public.pf_clarity_api_keys USING ((auth.uid() = user_id));


--
-- Name: pf_clarity_wp_connections Users can manage their site WP connections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their site WP connections" ON public.pf_clarity_wp_connections USING ((EXISTS ( SELECT 1
   FROM public.pf_clarity_sites
  WHERE ((pf_clarity_sites.id = pf_clarity_wp_connections.site_id) AND (pf_clarity_sites.user_id = auth.uid())))));


--
-- Name: pf_clarity_widgets Users can manage their site widgets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their site widgets" ON public.pf_clarity_widgets USING ((EXISTS ( SELECT 1
   FROM public.pf_clarity_sites
  WHERE ((pf_clarity_sites.id = pf_clarity_widgets.site_id) AND (pf_clarity_sites.user_id = auth.uid())))));


--
-- Name: pf_clarity_whitelabel Users can manage their white-label config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their white-label config" ON public.pf_clarity_whitelabel USING ((user_id = auth.uid()));


--
-- Name: modernizer_reports Users can read reports for their jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read reports for their jobs" ON public.modernizer_reports FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.modernizer_jobs
  WHERE ((modernizer_jobs.id = modernizer_reports.job_id) AND (modernizer_jobs.user_id = auth.uid())))));


--
-- Name: modernizer_jobs Users can read their own jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read their own jobs" ON public.modernizer_jobs FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: modernizer_user_limits Users can update own limits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own limits" ON public.modernizer_user_limits FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_limits Users can update own limits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own limits" ON public.user_limits FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: pf_clarity_api_keys Users can update their own API keys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own API keys" ON public.pf_clarity_api_keys FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: modernizer_jobs Users can update their own jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own jobs" ON public.modernizer_jobs FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: pf_clarity_notifications Users can update their own notification settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own notification settings" ON public.pf_clarity_notifications FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: pf_clarity_sites Users can update their own sites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own sites" ON public.pf_clarity_sites FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: pf_clarity_subscriptions Users can update their own subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own subscriptions" ON public.pf_clarity_subscriptions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: pf_clarity_webhooks Users can update their own webhooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own webhooks" ON public.pf_clarity_webhooks FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: pf_clarity_scheduled_scans Users can update their scheduled scans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their scheduled scans" ON public.pf_clarity_scheduled_scans FOR UPDATE USING ((site_id IN ( SELECT pf_clarity_sites.id
   FROM public.pf_clarity_sites
  WHERE (pf_clarity_sites.user_id = auth.uid()))));


--
-- Name: pf_clarity_compliance_history Users can view compliance history for their sites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view compliance history for their sites" ON public.pf_clarity_compliance_history FOR SELECT USING ((site_id IN ( SELECT pf_clarity_sites.id
   FROM public.pf_clarity_sites
  WHERE (pf_clarity_sites.user_id = auth.uid()))));


--
-- Name: pf_cost_logs Users can view cost logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view cost logs" ON public.pf_cost_logs FOR SELECT USING (true);


--
-- Name: pf_clarity_email_follows Users can view email follows for their scans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view email follows for their scans" ON public.pf_clarity_email_follows FOR SELECT USING (true);


--
-- Name: pf_clarity_fix_suggestions Users can view fixes for their issues; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view fixes for their issues" ON public.pf_clarity_fix_suggestions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ((public.pf_clarity_issues
     JOIN public.pf_clarity_scans ON ((pf_clarity_issues.scan_id = pf_clarity_scans.id)))
     JOIN public.pf_clarity_sites ON ((pf_clarity_scans.site_id = pf_clarity_sites.id)))
  WHERE ((pf_clarity_issues.id = pf_clarity_fix_suggestions.issue_id) AND (pf_clarity_sites.user_id = auth.uid())))));


--
-- Name: pf_clarity_fixes Users can view fixes for their issues; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view fixes for their issues" ON public.pf_clarity_fixes FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ((public.pf_clarity_issues
     JOIN public.pf_clarity_scans ON ((pf_clarity_scans.id = pf_clarity_issues.scan_id)))
     JOIN public.pf_clarity_sites ON ((pf_clarity_sites.id = pf_clarity_scans.site_id)))
  WHERE ((pf_clarity_issues.id = pf_clarity_fixes.issue_id) AND (pf_clarity_sites.user_id = auth.uid())))));


--
-- Name: pf_clarity_issues Users can view issues for their scans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view issues for their scans" ON public.pf_clarity_issues FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.pf_clarity_scans
     JOIN public.pf_clarity_sites ON ((pf_clarity_sites.id = pf_clarity_scans.site_id)))
  WHERE ((pf_clarity_scans.id = pf_clarity_issues.scan_id) AND (pf_clarity_sites.user_id = auth.uid())))));


--
-- Name: cost_logs Users can view own costs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own costs" ON public.cost_logs FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: modernizer_extractions Users can view own extractions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own extractions" ON public.modernizer_extractions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.modernizer_jobs
  WHERE ((modernizer_jobs.id = modernizer_extractions.job_id) AND (modernizer_jobs.user_id = auth.uid())))));


--
-- Name: modernizer_user_limits Users can view own limits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own limits" ON public.modernizer_user_limits FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_limits Users can view own limits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own limits" ON public.user_limits FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: modernizer_outputs Users can view own outputs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own outputs" ON public.modernizer_outputs FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.modernizer_jobs
  WHERE ((modernizer_jobs.id = modernizer_outputs.job_id) AND (modernizer_jobs.user_id = auth.uid())))));


--
-- Name: pf_clarity_issue_priority Users can view priority for their issues; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view priority for their issues" ON public.pf_clarity_issue_priority FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ((public.pf_clarity_issues
     JOIN public.pf_clarity_scans ON ((pf_clarity_issues.scan_id = pf_clarity_scans.id)))
     JOIN public.pf_clarity_sites ON ((pf_clarity_scans.site_id = pf_clarity_sites.id)))
  WHERE ((pf_clarity_issues.id = pf_clarity_issue_priority.issue_id) AND (pf_clarity_sites.user_id = auth.uid())))));


--
-- Name: pf_clarity_scans Users can view scans for their sites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view scans for their sites" ON public.pf_clarity_scans FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.pf_clarity_sites
  WHERE ((pf_clarity_sites.id = pf_clarity_scans.site_id) AND (pf_clarity_sites.user_id = auth.uid())))));


--
-- Name: pf_clarity_scheduled_scans Users can view scheduled scans for their sites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view scheduled scans for their sites" ON public.pf_clarity_scheduled_scans FOR SELECT USING ((site_id IN ( SELECT pf_clarity_sites.id
   FROM public.pf_clarity_sites
  WHERE (pf_clarity_sites.user_id = auth.uid()))));


--
-- Name: pf_clarity_team_members Users can view team members of their teams; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view team members of their teams" ON public.pf_clarity_team_members FOR SELECT USING ((team_id IN ( SELECT pf_clarity_teams.id
   FROM public.pf_clarity_teams
  WHERE ((pf_clarity_teams.owner_id = auth.uid()) OR (pf_clarity_teams.id IN ( SELECT pf_clarity_team_members_1.team_id
           FROM public.pf_clarity_team_members pf_clarity_team_members_1
          WHERE (pf_clarity_team_members_1.user_id = auth.uid())))))));


--
-- Name: pf_clarity_teams Users can view teams they own or are members of; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view teams they own or are members of" ON public.pf_clarity_teams FOR SELECT USING (((owner_id = auth.uid()) OR (id IN ( SELECT pf_clarity_team_members.team_id
   FROM public.pf_clarity_team_members
  WHERE (pf_clarity_team_members.user_id = auth.uid())))));


--
-- Name: pf_image_outputs Users can view their image outputs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their image outputs" ON public.pf_image_outputs FOR SELECT USING (true);


--
-- Name: pf_ai_logs Users can view their own AI logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own AI logs" ON public.pf_ai_logs FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: pf_clarity_api_keys Users can view their own API keys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own API keys" ON public.pf_clarity_api_keys FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: pf_clarity_api_usage Users can view their own API usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own API usage" ON public.pf_clarity_api_usage FOR SELECT USING ((api_key_id IN ( SELECT pf_clarity_api_keys.id
   FROM public.pf_clarity_api_keys
  WHERE (pf_clarity_api_keys.user_id = auth.uid()))));


--
-- Name: accessibility_scans Users can view their own accessibility scans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own accessibility scans" ON public.accessibility_scans FOR SELECT USING (((auth.uid() = user_id) OR (auth.role() = 'service_role'::text)));


--
-- Name: modernizer_extractions Users can view their own extractions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own extractions" ON public.modernizer_extractions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.modernizer_jobs
  WHERE ((modernizer_jobs.id = modernizer_extractions.job_id) AND (modernizer_jobs.user_id = auth.uid())))));


--
-- Name: pf_clarity_notification_log Users can view their own notification log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own notification log" ON public.pf_clarity_notification_log FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: pf_clarity_notifications Users can view their own notification settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own notification settings" ON public.pf_clarity_notifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: modernizer_outputs Users can view their own outputs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own outputs" ON public.modernizer_outputs FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.modernizer_jobs
  WHERE ((modernizer_jobs.id = modernizer_outputs.job_id) AND (modernizer_jobs.user_id = auth.uid())))));


--
-- Name: modernizer_reports Users can view their own reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own reports" ON public.modernizer_reports FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.modernizer_jobs
  WHERE ((modernizer_jobs.id = modernizer_reports.job_id) AND (modernizer_jobs.user_id = auth.uid())))));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: pf_clarity_sites Users can view their own sites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own sites" ON public.pf_clarity_sites FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: pf_clarity_subscriptions Users can view their own subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own subscriptions" ON public.pf_clarity_subscriptions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: pf_clarity_webhooks Users can view their own webhooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own webhooks" ON public.pf_clarity_webhooks FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: pf_clarity_portfolio_stats Users can view their portfolio stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their portfolio stats" ON public.pf_clarity_portfolio_stats FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: pf_clarity_scan_queue Users can view their scan queue; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their scan queue" ON public.pf_clarity_scan_queue FOR SELECT USING ((site_id IN ( SELECT pf_clarity_sites.id
   FROM public.pf_clarity_sites
  WHERE (pf_clarity_sites.user_id = auth.uid()))));


--
-- Name: pf_clarity_certifications Users can view their site certifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their site certifications" ON public.pf_clarity_certifications FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.pf_clarity_sites
  WHERE ((pf_clarity_sites.id = pf_clarity_certifications.site_id) AND (pf_clarity_sites.user_id = auth.uid())))));


--
-- Name: pf_clarity_reports Users can view their site reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their site reports" ON public.pf_clarity_reports FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.pf_clarity_sites
  WHERE ((pf_clarity_sites.id = pf_clarity_reports.site_id) AND (pf_clarity_sites.user_id = auth.uid())))));


--
-- Name: pf_text_outputs Users can view their text outputs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their text outputs" ON public.pf_text_outputs FOR SELECT USING (true);


--
-- Name: pf_video_outputs Users can view their video outputs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their video outputs" ON public.pf_video_outputs FOR SELECT USING (true);


--
-- Name: pf_clarity_widget_analytics Users can view their widget analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their widget analytics" ON public.pf_clarity_widget_analytics FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.pf_clarity_widgets
     JOIN public.pf_clarity_sites ON ((pf_clarity_widgets.site_id = pf_clarity_sites.id)))
  WHERE ((pf_clarity_widgets.id = pf_clarity_widget_analytics.widget_id) AND (pf_clarity_sites.user_id = auth.uid())))));


--
-- Name: bot_sniper_api_keys Users manage own bot_sniper_api_keys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own bot_sniper_api_keys" ON public.bot_sniper_api_keys TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: studio_connections Users manage own studio_connections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own studio_connections" ON public.studio_connections USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: studio_audit Users read own studio_audit; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users read own studio_audit" ON public.studio_audit FOR SELECT USING ((actor_id = auth.uid()));


--
-- Name: access_scans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.access_scans ENABLE ROW LEVEL SECURITY;

--
-- Name: accessibility_scans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.accessibility_scans ENABLE ROW LEVEL SECURITY;

--
-- Name: nexus_logs admin_only_nexus_logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_only_nexus_logs ON public.nexus_logs TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: ai_daily_quota; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_daily_quota ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_learning_data; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_learning_data ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_usage_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: bot_sniper_api_keys; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bot_sniper_api_keys ENABLE ROW LEVEL SECURITY;

--
-- Name: brain_actions_queue; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brain_actions_queue ENABLE ROW LEVEL SECURITY;

--
-- Name: brain_cross_insights; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brain_cross_insights ENABLE ROW LEVEL SECURITY;

--
-- Name: brain_curiosity_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brain_curiosity_log ENABLE ROW LEVEL SECURITY;

--
-- Name: brain_curiosity_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brain_curiosity_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: brain_daily_reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brain_daily_reports ENABLE ROW LEVEL SECURITY;

--
-- Name: brain_domain_usage; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brain_domain_usage ENABLE ROW LEVEL SECURITY;

--
-- Name: brain_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brain_events ENABLE ROW LEVEL SECURITY;

--
-- Name: brain_feedback; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brain_feedback ENABLE ROW LEVEL SECURITY;

--
-- Name: brain_forecasts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brain_forecasts ENABLE ROW LEVEL SECURITY;

--
-- Name: brain_graph_edges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brain_graph_edges ENABLE ROW LEVEL SECURITY;

--
-- Name: brain_memory_cold; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brain_memory_cold ENABLE ROW LEVEL SECURITY;

--
-- Name: brain_memory_hot; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brain_memory_hot ENABLE ROW LEVEL SECURITY;

--
-- Name: brain_metrics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brain_metrics ENABLE ROW LEVEL SECURITY;

--
-- Name: brain_persona; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brain_persona ENABLE ROW LEVEL SECURITY;

--
-- Name: brain_persona_patterns; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brain_persona_patterns ENABLE ROW LEVEL SECURITY;

--
-- Name: brain_persona_state; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brain_persona_state ENABLE ROW LEVEL SECURITY;

--
-- Name: brain_policy; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brain_policy ENABLE ROW LEVEL SECURITY;

--
-- Name: brain_proxy_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brain_proxy_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: brain_reach_domains; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brain_reach_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: brain_reflection_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brain_reflection_log ENABLE ROW LEVEL SECURITY;

--
-- Name: brain_reflections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brain_reflections ENABLE ROW LEVEL SECURITY;

--
-- Name: brain_reinforcement_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brain_reinforcement_log ENABLE ROW LEVEL SECURITY;

--
-- Name: brain_sensory_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brain_sensory_events ENABLE ROW LEVEL SECURITY;

--
-- Name: causal_traces; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.causal_traces ENABLE ROW LEVEL SECURITY;

--
-- Name: core_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.core_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: core_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.core_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: core_subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.core_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: core_usage; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.core_usage ENABLE ROW LEVEL SECURITY;

--
-- Name: cost_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cost_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: daily_state; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_state ENABLE ROW LEVEL SECURITY;

--
-- Name: defense_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.defense_events ENABLE ROW LEVEL SECURITY;

--
-- Name: defense_rules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.defense_rules ENABLE ROW LEVEL SECURITY;

--
-- Name: dream_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.dream_log ENABLE ROW LEVEL SECURITY;

--
-- Name: dream_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.dream_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: ecosystem_memory; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ecosystem_memory ENABLE ROW LEVEL SECURITY;

--
-- Name: ethical_approvals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ethical_approvals ENABLE ROW LEVEL SECURITY;

--
-- Name: evolution_proposals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.evolution_proposals ENABLE ROW LEVEL SECURITY;

--
-- Name: global_correlation; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.global_correlation ENABLE ROW LEVEL SECURITY;

--
-- Name: global_forecasts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.global_forecasts ENABLE ROW LEVEL SECURITY;

--
-- Name: global_signals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.global_signals ENABLE ROW LEVEL SECURITY;

--
-- Name: ip_reputation; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ip_reputation ENABLE ROW LEVEL SECURITY;

--
-- Name: learning_confidence; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.learning_confidence ENABLE ROW LEVEL SECURITY;

--
-- Name: learning_cycles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.learning_cycles ENABLE ROW LEVEL SECURITY;

--
-- Name: learning_patterns; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.learning_patterns ENABLE ROW LEVEL SECURITY;

--
-- Name: learning_queries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.learning_queries ENABLE ROW LEVEL SECURITY;

--
-- Name: learning_results; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.learning_results ENABLE ROW LEVEL SECURITY;

--
-- Name: modernizer_analytics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.modernizer_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: modernizer_extractions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.modernizer_extractions ENABLE ROW LEVEL SECURITY;

--
-- Name: modernizer_jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.modernizer_jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: modernizer_outputs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.modernizer_outputs ENABLE ROW LEVEL SECURITY;

--
-- Name: modernizer_reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.modernizer_reports ENABLE ROW LEVEL SECURITY;

--
-- Name: modernizer_user_limits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.modernizer_user_limits ENABLE ROW LEVEL SECURITY;

--
-- Name: nexus_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nexus_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_ai_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_ai_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_brain_anomalies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_brain_anomalies ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_brain_behavioral_patterns; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_brain_behavioral_patterns ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_brain_ml_models; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_brain_ml_models ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_brain_ml_predictions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_brain_ml_predictions ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_admin_stats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_admin_stats ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_agent_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_agent_config ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_api_keys; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_api_keys ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_api_usage; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_api_usage ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_certifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_certifications ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_clients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_clients ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_compliance_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_compliance_history ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_email_follows; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_email_follows ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_fix_suggestions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_fix_suggestions ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_fixes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_fixes ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_issue_priority; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_issue_priority ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_issues; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_issues ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_notification_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_notification_log ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_portfolio_stats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_portfolio_stats ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_reports ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_scan_queue; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_scan_queue ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_scans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_scans ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_scheduled_scans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_scheduled_scans ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_sites; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_sites ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_team_invites; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_team_invites ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_team_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_team_members ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_teams; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_teams ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_webhooks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_webhooks ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_whitelabel; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_whitelabel ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_widget_analytics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_widget_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_widgets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_widgets ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_clarity_wp_connections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_clarity_wp_connections ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_cost_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_cost_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_deployments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_deployments ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_global_threat_feed; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_global_threat_feed ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_image_outputs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_image_outputs ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_insight_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_insight_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_media_cache; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_media_cache ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_security_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_security_events ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_system_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_system_config ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_text_outputs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_text_outputs ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_threat_statistics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_threat_statistics ENABLE ROW LEVEL SECURITY;

--
-- Name: pf_video_outputs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pf_video_outputs ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: resilience_ledger; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.resilience_ledger ENABLE ROW LEVEL SECURITY;

--
-- Name: ripple_campaigns; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ripple_campaigns ENABLE ROW LEVEL SECURITY;

--
-- Name: nexus_logs service_role_insert_nexus_logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY service_role_insert_nexus_logs ON public.nexus_logs FOR INSERT TO service_role WITH CHECK (true);


--
-- Name: studio_applies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.studio_applies ENABLE ROW LEVEL SECURITY;

--
-- Name: studio_audit; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.studio_audit ENABLE ROW LEVEL SECURITY;

--
-- Name: studio_connections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.studio_connections ENABLE ROW LEVEL SECURITY;

--
-- Name: studio_previews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.studio_previews ENABLE ROW LEVEL SECURITY;

--
-- Name: studio_scans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.studio_scans ENABLE ROW LEVEL SECURITY;

--
-- Name: studio_verifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.studio_verifications ENABLE ROW LEVEL SECURITY;

--
-- Name: system_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

--
-- Name: system_updates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.system_updates ENABLE ROW LEVEL SECURITY;

--
-- Name: tenants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

--
-- Name: usage_metrics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;

--
-- Name: user_limits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_limits ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: v_user_summary; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.v_user_summary ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


