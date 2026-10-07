export interface LeadNotice {
  name: string;
  phone: string;
  city: string;
  email: string;
  leadId: string;
}

export interface EmailConfig {
  token: string;
}

export const LEAD_RECIPIENT = "contato@podermentoriasetreinamentos.com";
const API_BASE = "https://api.mail.hostinger.com/api/v1";
type EmailStage = "configuration" | "mailbox" | "send";
type EmailCode = "EMAIL_TOKEN_MISSING" | "EMAIL_CONNECTION_FAILED" | "EMAIL_API_REJECTED" | "EMAIL_INVALID_RESULT" | "EMAIL_MAILBOX_NOT_FOUND";

export class LeadEmailError extends Error {
  constructor(public readonly code: EmailCode, public readonly stage: EmailStage, public readonly status?: number) {
    super(code);
    this.name = "LeadEmailError";
  }
}

export function leadEmailPayload(lead: LeadNotice) {
  return {
    to: [LEAD_RECIPIENT],
    displayName: "PODER",
    subject: "PODER — nova inscrição nas imersões",
    text: ["Uma nova inscrição foi confirmada nas imersões PODER.", "",
      `Nome: ${lead.name}`, `Telefone: ${lead.phone}`, `Cidade: ${lead.city}`, `E-mail: ${lead.email}`,
    ].join("\n"),
  };
}

async function discardBody(response: Response) {
  try { await response.body?.cancel(); } catch { /* Never expose stream errors. */ }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// Only standard HTTPS fetch; no provider bodies, credentials or lead data in diagnostics.
async function request(stage: EmailStage, url: string, init: RequestInit) {
  let response: Response;
  try {
    response = await fetch(url, { ...init, redirect: "error" });
  } catch {
    throw new LeadEmailError("EMAIL_CONNECTION_FAILED", stage);
  }
  console.info("PODER email HTTP", { stage, status: response.status });
  if (!response.ok) {
    await discardBody(response);
    throw new LeadEmailError("EMAIL_API_REJECTED", stage, response.status);
  }
  return response;
}

export async function sendLeadNotice(config: EmailConfig, lead: LeadNotice) {
  const token = config.token.trim();
  if (!token) throw new LeadEmailError("EMAIL_TOKEN_MISSING", "configuration");
  const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };
  // One bounded budget for both calls; never retry an ambiguous send automatically.
  const signal = AbortSignal.timeout(10_000);
  const account = await request("mailbox", `${API_BASE}/me`, { method: "GET", headers, signal });
  let accountData: unknown;
  try { accountData = await account.json(); } catch {
    throw new LeadEmailError("EMAIL_INVALID_RESULT", "mailbox", account.status);
  }
  if (!isRecord(accountData) || !isRecord(accountData.data) || !Array.isArray(accountData.data.mailboxes)) {
    throw new LeadEmailError("EMAIL_INVALID_RESULT", "mailbox", account.status);
  }
  const mailbox = accountData.data.mailboxes.find((value: unknown) => isRecord(value) && value.address === LEAD_RECIPIENT);
  if (!isRecord(mailbox)) throw new LeadEmailError("EMAIL_MAILBOX_NOT_FOUND", "mailbox", account.status);
  // The official /me schema names this resourceId (the send path calls it mailboxResourceId).
  if (typeof mailbox.resourceId !== "string" || !/^AC[A-Za-z0-9]+$/.test(mailbox.resourceId)) {
    throw new LeadEmailError("EMAIL_INVALID_RESULT", "mailbox", account.status);
  }
  const sent = await request("send", `${API_BASE}/mailboxes/${encodeURIComponent(mailbox.resourceId)}/send`, {
    method: "POST", headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(leadEmailPayload(lead)), signal,
  });
  await discardBody(sent);
  if (sent.status !== 204) {
    throw new LeadEmailError("EMAIL_INVALID_RESULT", "send", sent.status);
  }
}