import { test } from "node:test";
import assert from "node:assert/strict";
import { LeadEmailError, sendLeadNotice } from "./lead-email.server";

const lead = { name: "Pessoa de teste", phone: "+5581999990000", city: "Recife", email: "test@example.com", leadId: "12345678-1234-1234-1234-123456789012" };

async function withFetch(mock: typeof fetch, run: () => Promise<void>) {
  const original = globalThis.fetch;
  globalThis.fetch = mock;
  try { await run(); } finally { globalThis.fetch = original; }
}

test("sends the four lead fields", async () => {
  await withFetch(async (_url, init) => {
    const body = JSON.parse(String(init?.body));
    assert.deepEqual(body, { name: lead.name, phone: lead.phone, city: lead.city, email: lead.email, website: "" });
    return new Response(null, { status: 200 });
  }, async () => { await sendLeadNotice({ token: "" }, lead); });
});

test("rejected response becomes a sanitized error", async () => {
  await withFetch(async () => new Response("private body", { status: 500 }), async () => {
    await assert.rejects(sendLeadNotice({ token: "" }, lead), (e: unknown) => e instanceof LeadEmailError && e.status === 500 && !e.message.includes("private"));
  });
});
