import { test } from "node:test";
import assert from "node:assert/strict";
import { createLeadTransport, leadMessage, LEAD_RECIPIENT } from "./lead-smtp.server";

const config = { host: "smtp.hostinger.com", port: "465", user: "sender@example.com", pass: "test-only" };

test("Hostinger transport requires implicit TLS and valid configuration", () => {
  const transport = createLeadTransport(config);
  assert.equal(transport.options.secure, true);
  assert.equal(transport.options.port, 465);
  assert.equal(transport.options.logger, false);
  assert.equal(transport.options.debug, false);
  transport.close();
  assert.throws(() => createLeadTransport({ ...config, port: "587" }));
  assert.throws(() => createLeadTransport({ ...config, host: "other.example.com" }));
  assert.throws(() => createLeadTransport({ ...config, pass: "" }));
});

test("notice has fixed recipient, authenticated sender and all four lead fields", () => {
  const lead = { name: "Pessoa de teste", phone: "+5581999990000", city: "Recife", email: "test@example.com", leadId: "12345678-1234-1234-1234-123456789012" };
  const message = leadMessage(config.user, lead);
  assert.equal(message.to, LEAD_RECIPIENT);
  assert.equal(message.from.address, config.user);
  for (const value of [lead.name, lead.phone, lead.city, lead.email]) assert.ok(message.text.includes(value));
  assert.equal(message.messageId, leadMessage(config.user, lead).messageId);
  assert.throws(() => leadMessage(config.user, { ...lead, leadId: "bad\r\nheader" }));
});