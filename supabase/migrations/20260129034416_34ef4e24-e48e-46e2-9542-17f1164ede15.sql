-- Add anonymous field to manifestacoes table
ALTER TABLE public.manifestacoes 
ADD COLUMN anonima boolean NOT NULL DEFAULT false;

-- Add anonymous field to manifestacoes_public table
ALTER TABLE public.manifestacoes_public 
ADD COLUMN anonima boolean NOT NULL DEFAULT false;

-- Update the publish_manifestacao function to include the anonima field
CREATE OR REPLACE FUNCTION public.publish_manifestacao(_manifestacao_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  m record;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF NOT (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role)) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT id, assunto, texto, localidade, status, respondida, divulgacoes, anonima, created_at, updated_at
  INTO m
  FROM public.manifestacoes
  WHERE id = _manifestacao_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'manifestacao not found';
  END IF;

  INSERT INTO public.manifestacoes_public (id, assunto, texto, localidade, status, respondida, divulgacoes, anonima, created_at, updated_at)
  VALUES (m.id, m.assunto, m.texto, m.localidade, m.status, m.respondida, m.divulgacoes, m.anonima, m.created_at, m.updated_at)
  ON CONFLICT (id) DO UPDATE
  SET assunto = EXCLUDED.assunto,
      texto = EXCLUDED.texto,
      localidade = EXCLUDED.localidade,
      status = EXCLUDED.status,
      respondida = EXCLUDED.respondida,
      divulgacoes = EXCLUDED.divulgacoes,
      anonima = EXCLUDED.anonima,
      created_at = EXCLUDED.created_at,
      updated_at = EXCLUDED.updated_at;

  RETURN true;
END;
$function$;