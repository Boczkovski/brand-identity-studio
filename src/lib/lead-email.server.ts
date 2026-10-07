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
const HOSTINGER_ENDPOINT =
  "https://podermentoriasetreinamentos.com/api/send-lead.php";

type EmailStage = "configuration" | "mailbox" | "send";
type EmailCode =
  | "EMAIL_TOKEN_MISSING"
  | "EMAIL_CONNECTION_FAILED"
  | "EMAIL_API_REJECTED"
  | "EMAIL_INVALID_RESULT"
  | "EMAIL_MAILBOX_NOT_FOUND";

export class LeadEmailError extends Error {
  constructor(
    public readonly code: EmailCode,
    public readonly stage: EmailStage,
    public readonly status?: number,
  ) {
    super(code);
    this.name = "LeadEmailError";
  }
}

async function discardBody(response: Response) {
  try {
    await response.body?.cancel();
  } catch {
    // Never expose stream errors.
  }
}

export async function sendLeadNotice(_config: EmailConfig, lead: LeadNotice) {
  let response: Response;

  try {
    response = await fetch(HOSTINGER_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: lead.name,
        phone: lead.phone,
        city: lead.city,
        email: lead.email,
        website: "",
      }),
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new LeadEmailError("EMAIL_CONNECTION_FAILED", "send");
  }

  console.info("PODER email HTTP", {
    stage: "send",
    status: response.status,
  });

  if (!response.ok) {
    const status = response.status;
    await discardBody(response);
    throw new LeadEmailError("EMAIL_API_REJECTED", "send", status);
  }

  await discardBody(response);
}
