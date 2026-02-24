-- Fix infinite recursion on pf_clarity_team_members RLS policies
-- Step 1: Create security definer function to check team membership
CREATE OR REPLACE FUNCTION public.is_clarity_team_member(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM pf_clarity_team_members
    WHERE user_id = _user_id AND team_id = _team_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_clarity_team_admin(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM pf_clarity_team_members
    WHERE user_id = _user_id AND team_id = _team_id AND role = ANY(ARRAY['owner', 'admin'])
  )
$$;

CREATE OR REPLACE FUNCTION public.is_clarity_team_owner(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM pf_clarity_teams
    WHERE id = _team_id AND owner_id = _user_id
  )
$$;

-- Step 2: Drop existing recursive policies
DROP POLICY IF EXISTS "Users can view team members of their teams" ON pf_clarity_team_members;
DROP POLICY IF EXISTS "Team owners and admins can add members" ON pf_clarity_team_members;
DROP POLICY IF EXISTS "Team owners and admins can remove members" ON pf_clarity_team_members;

-- Step 3: Recreate policies using security definer functions (no recursion)
CREATE POLICY "Users can view team members of their teams"
ON pf_clarity_team_members FOR SELECT
USING (
  public.is_clarity_team_owner(auth.uid(), team_id)
  OR public.is_clarity_team_member(auth.uid(), team_id)
);

CREATE POLICY "Team owners and admins can add members"
ON pf_clarity_team_members FOR INSERT
WITH CHECK (
  public.is_clarity_team_owner(auth.uid(), team_id)
  OR public.is_clarity_team_admin(auth.uid(), team_id)
);

CREATE POLICY "Team owners and admins can remove members"
ON pf_clarity_team_members FOR DELETE
USING (
  public.is_clarity_team_owner(auth.uid(), team_id)
  OR public.is_clarity_team_admin(auth.uid(), team_id)
);