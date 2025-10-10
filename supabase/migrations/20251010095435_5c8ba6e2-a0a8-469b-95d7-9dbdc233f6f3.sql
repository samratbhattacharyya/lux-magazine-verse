-- Fix the public_profiles view to use SECURITY INVOKER instead of SECURITY DEFINER
-- This ensures the view uses the querying user's permissions, not the view creator's
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS
SELECT 
  id,
  username,
  display_name,
  avatar_url,
  created_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;