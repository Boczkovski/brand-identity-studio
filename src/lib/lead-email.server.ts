export interface LeadNotice {
  name: string;
  phone: string;
  city: string;
  email: string;
  leadId: string;
}

export interface EmailConfig {
  apiKey: string;
  from: string;
}

export const LEAD_RECIPIENT = "contato@podermentoriasetreinamentos.com";

export class LeadEmailError extends Error {
  constructor(public readonly code: string, public readonly status?: number) {
    super(code);
    this.name = "LeadEmailError";
  }
}

export function leadEmailPayload(from: string, lead: LeadNotice) {
  if (!/^[a-f0-9-]{36}$/i.test(lead.leadId)) throw new LeadEmailError("INVALID_LEAD_ID");
  if (!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(from)) throw new LeadEmailError("EMAIL_SENDER_INVALID");
  return {
    from: `PODER <${from}>`,
    to: [LEAD_RECIPIENT],
    subject: "PODER — nova inscrição nas imersões",
    text: ["Uma nova inscrição foi confirmada nas imersões PODER.", "",
      `Nome: ${lead.name}`, `Telefone: ${lead.phone}`, `Cidade: ${lead.city}`, `E-mail: ${lead.email}`,
    ].join("\n"),
  };
}

// No TCP, Node-only transport, client credentials, or provider error bodies.
export async function sendLeadNotice(config: EmailConfig, lead: LeadNotice) {
  if (!config.apiKey.trim()) throw new LeadEmailError("EMAIL_API_KEY_MISSING");
  const payload = leadEmailPayload(config.from, lead);
  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `poder-lead-${lead.leadId}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new LeadEmailError("EMAIL_CONNECTION_FAILED");
  }
  if (!response.ok) {
    await response.body?.cancel();
    throw new LeadEmailError("EMAIL_API_REJECTED", response.status);
  }
  // Acceptance is not confirmation of inbox delivery.
  let result: unknown;
  try { result = await response.json(); } catch { throw new LeadEmailError("EMAIL_INVALID_RESULT"); }
  if (!result || typeof result !== "object" || !("id" in result) || typeof result.id !== "string" || !result.id) {
    throw new LeadEmailError("EMAIL_INVALID_RESULT");
  }
}