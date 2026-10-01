CREATE TABLE public.poder_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key uuid NOT NULL UNIQUE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  phone_e164 text NOT NULL CHECK (phone_e164 ~ '^\\+[1-9][0-9]{9,14}$'),
  city text NOT NULL CHECK (char_length(city) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (char_length(email) <= 255),
  consent_version text NOT NULL,
  consent_given boolean NOT NULL CHECK (consent_given),
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.poder_leads TO service_role;
ALTER TABLE public.poder_leads ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.poder_notification_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.poder_leads(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  destination text NOT NULL,
  status text NOT NULL DEFAULT 'integration_pending' CHECK (status IN ('integration_pending', 'pending', 'accepted', 'delivered', 'failed')),
  attempts smallint NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5),
  provider_message_id text,
  last_error text,
  next_attempt_at timestamptz,
  accepted_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lead_id, channel)
);
GRANT ALL ON public.poder_notification_tasks TO service_role;
ALTER TABLE public.poder_notification_tasks ENABLE ROW LEVEL SECURITY;

CREATE INDEX poder_leads_email_created_idx ON public.poder_leads (lower(email), created_at DESC);
CREATE INDEX poder_notification_tasks_queue_idx ON public.poder_notification_tasks (status, next_attempt_at, created_at);

CREATE OR REPLACE FUNCTION public.submit_poder_lead(
  p_idempotency_key uuid,
  p_name text,
  p_phone_e164 text,
  p_city text,
  p_email text,
  p_consent_version text,
  p_consent_given boolean,
  p_source text DEFAULT NULL,
  p_utm_source text DEFAULT NULL,
  p_utm_medium text DEFAULT NULL,
  p_utm_campaign text DEFAULT NULL,
  p_utm_content text DEFAULT NULL,
  p_utm_term text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead_id uuid;
BEGIN
  SELECT id INTO v_lead_id FROM public.poder_leads WHERE idempotency_key = p_idempotency_key;
  IF v_lead_id IS NOT NULL THEN
    RETURN v_lead_id;
  END IF;

  IF (SELECT count(*) FROM public.poder_leads WHERE lower(email) = lower(p_email) AND created_at > now() - interval '1 hour') >= 5 THEN
    RAISE EXCEPTION 'rate_limit_exceeded' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.poder_leads (
    idempotency_key, name, phone_e164, city, email, consent_version, consent_given,
    source, utm_source, utm_medium, utm_campaign, utm_content, utm_term
  ) VALUES (
    p_idempotency_key, p_name, p_phone_e164, p_city, lower(p_email), p_consent_version, p_consent_given,
    p_source, p_utm_source, p_utm_medium, p_utm_campaign, p_utm_content, p_utm_term
  ) RETURNING id INTO v_lead_id;

  INSERT INTO public.poder_notification_tasks (lead_id, channel, destination)
  VALUES
    (v_lead_id, 'email', 'podermentoriasetreinamentos@gmail.com'),
    (v_lead_id, 'whatsapp', '5581986506366');

  RETURN v_lead_id;
END;
$$;
REVOKE ALL ON FUNCTION public.submit_poder_lead(uuid,text,text,text,text,text,boolean,text,text,text,text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_poder_lead(uuid,text,text,text,text,text,boolean,text,text,text,text,text,text) TO service_role;