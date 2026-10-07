import { test } from "node:test";
import assert from "node:assert/strict";
import { LeadEmailError, leadEmailPayload, LEAD_RECIPIENT, sendLeadNotice } from "./lead-email.server";

const lead = { name: "Pessoa de teste", phone: "+5581999990000", city: "Recife", email: "test@example.com", leadId: "12345678-1234-1234-1234-123456789012" };
const config = { token: "test-only-private-token" };
const base = "https://api.mail.hostinger.com/api/v1";
const account = () => Response.json({ data: { orderResourceId: "ORtest", mailboxes: [
  { address: "other@example.com", resourceId: "ACother" },
  { address: LEAD_RECIPIENT.toUpperCase(), resourceId: "ACwrongcase" },
  { address: LEAD_RECIPIENT, resourceId: "ACcorrect" },
] } });

test("fixed administrative recipient and four lead fields", () => {
  const payload = leadEmailPayload(lead);
  assert.deepEqual(payload.to, [LEAD_RECIPIENT]);
  assert.equal(payload.displayName, "PODER");
  for (const value of [lead.name, lead.phone, lead.city, lead.email]) assert.ok(payload.text.includes(value));
  assert.deepEqual(Object.keys(payload).sort(), ["displayName", "subject", "text", "to"]);
});

async function withFetch(mock: typeof fetch, run: () => Promise<void>) {
  const original = globalThis.fetch;
  globalThis.fetch = mock;
  try { await run(); } finally { globalThis.fetch = original; }
}

test("resolves exact mailbox and accepts empty 204 response", async () => {
  const calls: string[] = [];
  let signal: AbortSignal | null | undefined;
  await withFetch(async (url, init) => {
    calls.push(String(url));
    assert.equal(new Headers(init?.headers).get("Authorization"), `Bearer ${config.token}`);
    assert.equal(init?.redirect, "error");
    if (calls.length === 1) {
      assert.equal(init?.method, "GET");
      signal = init?.signal;
      return account();
    }
    assert.equal(init?.method, "POST");
    assert.equal(init?.signal, signal);
    assert.equal(new Headers(init?.headers).get("Content-Type"), "application/json");
    assert.deepEqual(JSON.parse(String(init?.body)), leadEmailPayload(lead));
    return new Response(null, { status: 204 });
  }, async () => { await sendLeadNotice(config, lead); });
  assert.deepEqual(calls, [`${base}/me`, `${base}/mailboxes/ACcorrect/send`]);
});

test("missing token makes no network call", async () => {
  await withFetch(async () => { assert.fail("must not call fetch"); }, async () => {
    await assert.rejects(sendLeadNotice({ token: "  " }, lead), { code: "EMAIL_TOKEN_MISSING", stage: "configuration" });
  });
});

test("mailbox not found prevents send, including case-only match", async () => {
  let calls = 0;
  await withFetch(async () => {
    calls++;
    return Response.json({ data: { mailboxes: [{ address: LEAD_RECIPIENT.toUpperCase(), resourceId: "ACwrong" }] } });
  }, async () => {
    await assert.rejects(sendLeadNotice(config, lead), { code: "EMAIL_MAILBOX_NOT_FOUND", stage: "mailbox", status: 200 });
  });
  assert.equal(calls, 1);
});

test("401, 403 and 5xx on either stage never read or leak provider body", async () => {
  const logs: unknown[][] = [];
  const originalLog = console.info;
  console.info = (...args: unknown[]) => { logs.push(args); };
  try {
    for (const stage of ["mailbox", "send"] as const) {
      for (const status of [401, 403, 500, 502, 503, 504]) {
        let calls = 0;
        await withFetch(async () => {
          calls++;
          if (stage === "send" && calls === 1) return account();
          const response = new Response("private provider body with credentials and personal data", { status });
          response.json = async () => { assert.fail("must not read error JSON"); };
          response.text = async () => { assert.fail("must not read error text"); };
          return response;
        }, async () => {
          await assert.rejects(sendLeadNotice(config, lead), (error: unknown) => {
            assert.ok(error instanceof LeadEmailError);
            assert.equal(error.code, "EMAIL_API_REJECTED");
            assert.equal(error.stage, stage);
            assert.equal(error.status, status);
            assert.equal(error.message, "EMAIL_API_REJECTED");
            assert.ok(!JSON.stringify(error).includes("private provider"));
            return true;
          });
        });
        assert.equal(calls, stage === "send" ? 2 : 1);
      }
    }
    for (const entry of logs) {
      assert.equal(entry[0], "PODER email HTTP");
      assert.deepEqual(Object.keys(entry[1] as object).sort(), ["stage", "status"]);
    }
    for (const value of [config.token, lead.name, lead.phone, lead.city, lead.email, LEAD_RECIPIENT, "private provider"]) {
      assert.ok(!JSON.stringify(logs).includes(value));
    }
  } finally { console.info = originalLog; }
});

test("malformed account or mailbox ID is rejected before send", async () => {
  for (const result of [{}, { data: { mailboxes: [{ address: LEAD_RECIPIENT, resourceId: "../other" }] } }]) {
    await withFetch(async () => Response.json(result), async () => {
      await assert.rejects(sendLeadNotice(config, lead), { code: "EMAIL_INVALID_RESULT", stage: "mailbox" });
    });
  }
});

test("network errors are sanitized and send is not retried", async () => {
  let calls = 0;
  await withFetch(async () => {
    calls++;
    if (calls === 1) return account();
    throw new Error(`private network detail ${config.token}`);
  }, async () => {
    await assert.rejects(sendLeadNotice(config, lead), { message: "EMAIL_CONNECTION_FAILED", stage: "send" });
  });
  assert.equal(calls, 2);
});