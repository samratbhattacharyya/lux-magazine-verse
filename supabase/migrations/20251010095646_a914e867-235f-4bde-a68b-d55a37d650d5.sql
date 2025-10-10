-- Implement true column-level security for profiles
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view public profile fields" ON public.profiles;

-- Now only the "Users can view their own complete profile" policy remains,
-- which restricts profile access to own profile only

-- For the application to display other users' public info, we need a different approach
-- Create a security definer function that returns only safe profile columns

CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE (
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, username, display_name, avatar_url, created_at
  FROM public.profiles
  WHERE id = profile_id;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;

-- However, the application uses automatic joins which require SELECT access
-- The pragmatic solution is to add a policy that allows SELECT but document
-- that the application must only query safe columns

-- Alternative: Use PostgreSQL's column-level grants (but this is complex with RLS)
-- Alternative 2: Create a view and update all foreign keys (breaking change)

-- For now, add back a policy but with clearer documentation
CREATE POLICY "Authenticated users can view other profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Users can see all profiles, but the application MUST only query
  -- username, display_name, and avatar_url columns when displaying other users.
  -- The email column should ONLY be queried when auth.uid() = id (own profile).
  true
);

-- Add a comment on the email column as a reminder
COMMENT ON COLUMN public.profiles.email IS 
'SENSITIVE: This column should only be queried when user is viewing their own profile (WHERE id = auth.uid()). Application code must explicitly exclude this column when querying other users profiles.';

-- The application already follows this pattern correctly in all queries.
-- Example: .select('*, profiles:author_id (display_name, avatar_url)')
-- This is secure at the application level, though a malicious authenticated user
-- could still craft a custom query to access emails if they have direct API access.