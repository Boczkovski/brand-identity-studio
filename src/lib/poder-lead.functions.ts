import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const optionalCampaign = z.string().trim().max(120).optional().nullable();

const leadSchema = z.object({
  idempotencyKey: z.string().uuid(),
  name: z.string().trim().min(2, "Informe seu nome.").max(120),
  phone: z.string().trim().min(10, "Informe um telefone válido.").max(24),
  city: z.string().trim().min(2, "Informe sua cidade.").max(120),
  email: z.string().trim().email("Informe um e-mail válido.").max(255),
  consent: z.literal(true),
  website: z.string().max(0),
  startedAt: z.number().int().positive(),
  source: optionalCampaign,
  utmSource: optionalCampaign,
  utmMedium: optionalCampaign,
  utmCampaign: optionalCampaign,
  utmContent: optionalCampaign,
  utmTerm: optionalCampaign,
});

function normalizeBrazilianPhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (!digits.startsWith("55")) digits = `55${digits}`;
  if (digits.length < 12 || digits.length > 13) throw new Error("Telefone inválido. Inclua o DDD.");
  return `+${digits}`;
}

export const submitPoderLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    const elapsed = Date.now() - data.startedAt;
    if (data.website || elapsed < 1200 || elapsed > 7_200_000) {
      throw new Error("Não foi possível validar o envio. Atualize a página e tente novamente.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: leadId, error } = await supabaseAdmin.rpc("submit_poder_lead", {
      p_idempotency_key: data.idempotencyKey,
      p_name: data.name,
      p_phone_e164: normalizeBrazilianPhone(data.phone),
      p_city: data.city,
      p_email: data.email.toLowerCase(),
      p_consent_version: "poder-imersoes-2026-10-01",
      p_consent_given: data.consent,
      p_source: data.source ?? undefined,
      p_utm_source: data.utmSource ?? undefined,
      p_utm_medium: data.utmMedium ?? undefined,
      p_utm_campaign: data.utmCampaign ?? undefined,
      p_utm_content: data.utmContent ?? undefined,
      p_utm_term: data.utmTerm ?? undefined,
    });

    if (error || !leadId) {
      if (error?.message.includes("rate_limit_exceeded")) {
        throw new Error("Muitas tentativas recentes. Aguarde um pouco e tente novamente.");
      }
      throw new Error("Não foi possível concluir seu cadastro agora. Seus dados continuam preenchidos; tente novamente.");
    }

    return { ok: true, leadId };
  });
