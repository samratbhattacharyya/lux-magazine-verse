-- Strengthen user_roles security with explicit policies

-- Drop the overly broad "Admins can manage user roles" policy
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- Add explicit restrictive INSERT policy
CREATE POLICY "Only admins can assign roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add explicit restrictive UPDATE policy
CREATE POLICY "Only admins can modify roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add explicit restrictive DELETE policy
CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));