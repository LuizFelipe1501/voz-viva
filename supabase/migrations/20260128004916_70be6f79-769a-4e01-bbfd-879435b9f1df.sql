-- Drop existing storage policies for this bucket (including ones already created)
DROP POLICY IF EXISTS "Manifestacao attachments are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Manifestacao attachments are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own manifestacao attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own manifestacao attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own manifestacao attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own manifestacao attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;

-- Make bucket private
UPDATE storage.buckets
SET public = FALSE
WHERE id = 'manifestacao-anexos';

-- Owner-only access to objects in the bucket
CREATE POLICY "Users can view own manifestacao attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'manifestacao-anexos'
  AND auth.uid() = owner
);

CREATE POLICY "Users can upload own manifestacao attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'manifestacao-anexos'
  AND auth.uid() = owner
);

CREATE POLICY "Users can update own manifestacao attachments"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'manifestacao-anexos'
  AND auth.uid() = owner
)
WITH CHECK (
  bucket_id = 'manifestacao-anexos'
  AND auth.uid() = owner
);

CREATE POLICY "Users can delete own manifestacao attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'manifestacao-anexos'
  AND auth.uid() = owner
);

-- Fix: Restrict access to respostas (no public reads)
REVOKE ALL ON TABLE public.respostas FROM anon;

DROP POLICY IF EXISTS "Anyone can view responses" ON public.respostas;

CREATE POLICY "Owners and staff can view responses"
ON public.respostas
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'moderator'::app_role)
  OR EXISTS (
    SELECT 1
    FROM public.manifestacoes m
    WHERE m.id = respostas.manifestacao_id
      AND m.user_id = auth.uid()
  )
);

-- Fix: Clarify profiles access (remove blanket denial; rely on explicit owner-only policy)
REVOKE ALL ON TABLE public.profiles FROM anon;

DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
