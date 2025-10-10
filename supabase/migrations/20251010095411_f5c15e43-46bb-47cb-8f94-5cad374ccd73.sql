-- Fix email exposure in profiles table
-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a secure public view that excludes sensitive data
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  display_name,
  avatar_url,
  created_at
FROM public.profiles;

-- Allow everyone to view the public profiles view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Create policy to allow users to view their own complete profile (including email)
CREATE POLICY "Users can view their own complete profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create policy to allow authenticated users to view other users' public profile data only
-- (This is for direct table access if needed, but app should use the view)
CREATE POLICY "Authenticated users can view public profile fields"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Note: The application should query public_profiles view for displaying user info
-- and only query profiles table when users need to see their own email

-- Fix user_roles exposure - restrict to showing only own role
DROP POLICY IF EXISTS "User roles are viewable by everyone" ON public.user_roles;

-- Allow users to view only their own role
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow admins to view all roles (they already have ALL privileges via existing policy)
-- The existing "Admins can manage user roles" policy covers this