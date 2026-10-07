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
  .validator((input: unknown) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    const elapsed = Date.now() - data.startedAt;
    if (data.website || elapsed < 1200 || elapsed > 7_200_000) {
      throw new Error("Não foi possível validar o envio. Atualize a página e tente novamente.");
    }

    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"] || "https://qlozxajxbnbijxedmzem.supabase.co";
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || "sb_publishable_sl8uEaafCWx7YfR1Xx6B7A_jQOqMqND";
    const supabaseAdmin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      } },
    });
    const campaignArgs = Object.fromEntries(Object.entries({
      p_source: data.source,
      p_utm_source: data.utmSource,
      p_utm_medium: data.utmMedium,
      p_utm_campaign: data.utmCampaign,
      p_utm_content: data.utmContent,
      p_utm_term: data.utmTerm,
    }).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
    const { data: leadId, error } = await supabaseAdmin.rpc("submit_poder_lead", {
      p_idempotency_key: data.idempotencyKey,
      p_name: data.name,
      p_phone_e164: normalizeBrazilianPhone(data.phone),
      p_city: data.city,
      p_email: data.email.toLowerCase(),
      p_consent_version: "poder-imersoes-2026-10-01",
      p_consent_given: data.consent,
      ...campaignArgs,
    });

    if (error || !leadId) {
      if (error?.message.includes("rate_limit_exceeded")) {
        throw new Error("Muitas tentativas recentes. Aguarde um pouco e tente novamente.");
      }
      throw new Error("Não foi possível concluir seu cadastro agora. Seus dados continuam preenchidos; tente novamente.");
    }

    // Only notify after a validated, durable registration. Delivery failures
    // must never turn a successful registration into a visitor-facing error.
    try {
      console.info("PODER email attempt");
      const { sendLeadNotice } = await import("./lead-email.server");
      await sendLeadNotice({
        token: process.env["HOSTINGER_MAIL_API_TOKEN"] || "",
      }, {
        name: data.name, phone: normalizeBrazilianPhone(data.phone),
        city: data.city, email: data.email.toLowerCase(), leadId: String(leadId),
      });
      console.info("PODER email accepted");
    } catch (error: unknown) {
      // Allow only diagnostic tokens, never provider messages or addresses.
      const diagnostic: { stage?: string; code?: string; status?: number } = {};
      if (error !== null && typeof error === "object") {
        if ("stage" in error && typeof error.stage === "string" && ["configuration", "mailbox", "send"].includes(error.stage)) {
          diagnostic.stage = error.stage;
        }
        if ("code" in error && typeof error.code === "string" && ["EMAIL_TOKEN_MISSING", "EMAIL_CONNECTION_FAILED", "EMAIL_API_REJECTED", "EMAIL_INVALID_RESULT", "EMAIL_MAILBOX_NOT_FOUND"].includes(error.code)) {
          diagnostic.code = error.code;
        }
        if ("status" in error && typeof error.status === "number" && Number.isInteger(error.status) && error.status >= 100 && error.status <= 599) {
          diagnostic.status = error.status;
        }
      }
      console.warn("PODER email failed", diagnostic);
    }

    return { ok: true, leadId };
  });
