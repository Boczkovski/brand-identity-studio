ALTER TABLE public.poder_leads
  DROP CONSTRAINT poder_leads_phone_e164_check;

ALTER TABLE public.poder_leads
  ADD CONSTRAINT poder_leads_phone_e164_check
  CHECK (phone_e164 ~ E'^\\+[1-9][0-9]{9,14}$');