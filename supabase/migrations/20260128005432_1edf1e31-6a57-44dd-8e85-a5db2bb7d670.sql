-- Fix: Add explicit anonymous denial on profiles table
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Fix: Add explicit anonymous denial on respostas table
CREATE POLICY "Deny anonymous access to respostas"
ON public.respostas
FOR SELECT
TO anon
USING (false);
