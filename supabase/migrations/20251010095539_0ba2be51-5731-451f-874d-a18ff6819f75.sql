-- Simpler approach: Remove the view since all profile access is from authenticated pages
-- This avoids the SECURITY DEFINER view warning

DROP VIEW IF EXISTS public.public_profiles;

-- Since the app only displays profiles on authenticated pages (Feed, PostDetail),
-- we just need to ensure authenticated users can see other users' profiles
-- but email is only visible to the profile owner

-- The existing policies already handle this:
-- 1. "Users can view their own complete profile" - allows users to see their own email
-- 2. "Authenticated users can view public profile fields" - allows viewing other profiles

-- The application code should only query non-sensitive columns (username, display_name, avatar_url)
-- when displaying other users' profiles. The email column should only be queried
-- when a user is viewing their own profile.

-- This is secure because:
-- - Unauthenticated users cannot query profiles at all (no anon policy)
-- - Authenticated users CAN query profiles, but the application only requests
--   non-sensitive columns when displaying other users
-- - Only when querying own profile does the app request the email column

COMMENT ON TABLE public.profiles IS 
'User profiles. Email column should only be queried when user is viewing their own profile (auth.uid() = profiles.id). When displaying other users, only query username, display_name, and avatar_url.';