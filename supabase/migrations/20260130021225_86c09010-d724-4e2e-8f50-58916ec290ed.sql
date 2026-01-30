-- Drop existing restrictive policies and recreate as permissive
-- For profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- For manifestacoes table
DROP POLICY IF EXISTS "Users can view their own manifestations" ON public.manifestacoes;
DROP POLICY IF EXISTS "Users can create manifestations as themselves" ON public.manifestacoes;
DROP POLICY IF EXISTS "Users can update their own manifestations" ON public.manifestacoes;
DROP POLICY IF EXISTS "Deny anonymous access to manifestacoes" ON public.manifestacoes;

CREATE POLICY "Users can view their own manifestations"
ON public.manifestacoes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create manifestations"
ON public.manifestacoes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own manifestations"
ON public.manifestacoes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- For respostas table
DROP POLICY IF EXISTS "Owners and staff can view responses" ON public.respostas;
DROP POLICY IF EXISTS "Deny anonymous access to respostas" ON public.respostas;

CREATE POLICY "Owners and staff can view responses"
ON public.respostas FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'moderator'::app_role) 
  OR EXISTS (
    SELECT 1 FROM manifestacoes m
    WHERE m.id = respostas.manifestacao_id AND m.user_id = auth.uid()
  )
);