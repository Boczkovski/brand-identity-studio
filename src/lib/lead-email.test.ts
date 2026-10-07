import { test } from "node:test";
import assert from "node:assert/strict";
import { LeadEmailError, leadEmailPayload, LEAD_RECIPIENT, sendLeadNotice } from "./lead-email.server";

const lead = { name: "Pessoa de teste", phone: "+5581999990000", city: "Recife", email: "test@example.com", leadId: "12345678-1234-1234-1234-123456789012" };
const config = { apiKey: "test-only", from: "onboarding@resend.dev" };

test("fixed administrative recipient and four lead fields", () => {
  const payload = leadEmailPayload(config.from, lead);
  assert.deepEqual(payload.to, [LEAD_RECIPIENT]);
  for (const value of [lead.name, lead.phone, lead.city, lead.email]) assert.ok(payload.text.includes(value));
  assert.throws(() => leadEmailPayload("bad\r\nheader", lead));
  assert.throws(() => leadEmailPayload(config.from, { ...lead, leadId: "bad" }));
});

test("HTTPS acceptance, idempotency and sanitized failures without sending email", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async (url, init) => {
      assert.equal(url, "https://api.resend.com/emails");
      assert.equal(init?.method, "POST");
      assert.equal(new Headers(init?.headers).get("Idempotency-Key"), `poder-lead-${lead.leadId}`);
      assert.deepEqual(JSON.parse(String(init?.body)).to, [LEAD_RECIPIENT]);
      return Response.json({ id: "test-accepted" });
    };
    await sendLeadNotice(config, lead);
    globalThis.fetch = async () => new Response("private provider detail", { status: 403 });
    await assert.rejects(sendLeadNotice(config, lead), (error: unknown) =>
      error instanceof LeadEmailError && error.code === "EMAIL_API_REJECTED" && error.status === 403 && !error.message.includes("private"));
    globalThis.fetch = async () => { throw new Error("private credential detail"); };
    await assert.rejects(sendLeadNotice(config, lead), { message: "EMAIL_CONNECTION_FAILED" });
    await assert.rejects(sendLeadNotice({ ...config, apiKey: "" }, lead), { message: "EMAIL_API_KEY_MISSING" });
    globalThis.fetch = async () => Response.json({});
    await assert.rejects(sendLeadNotice(config, lead), { message: "EMAIL_INVALID_RESULT" });
  } finally { globalThis.fetch = original; }
});