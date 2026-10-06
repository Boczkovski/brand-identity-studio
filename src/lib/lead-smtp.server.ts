import nodemailer from "nodemailer";
import { connect } from "node:tls";

export interface SmtpConfig {
  host: string;
  port: string;
  user: string;
  pass: string;
}

export interface LeadNotice {
  name: string;
  phone: string;
  city: string;
  email: string;
  leadId: string;
}

export const LEAD_RECIPIENT = "contato@podermentoriasetreinamentos.com";

export function createLeadTransport(config: SmtpConfig) {
  if (config.host.trim().toLowerCase() !== "smtp.hostinger.com" || Number(config.port) !== 465) {
    throw new Error("smtp_configuration_invalid");
  }
  if (!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(config.user) || !config.pass) {
    throw new Error("smtp_credentials_missing");
  }
  return nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    name: "podermentoriasetreinamentos.com",
    auth: { user: config.user, pass: config.pass },
    tls: { servername: "smtp.hostinger.com", minVersion: "TLSv1.2", rejectUnauthorized: true },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
    logger: false,
    debug: false,
    disableFileAccess: true,
    disableUrlAccess: true,
    // Direct TLS avoids platform-specific DNS lookup implementations.
    getSocket: (_options, callback) => {
      const socket = connect({
        host: "smtp.hostinger.com", port: 465, servername: "smtp.hostinger.com",
        minVersion: "TLSv1.2", rejectUnauthorized: true,
      });
      const timer = setTimeout(() => socket.destroy(new Error("smtp_connection_timeout")), 10_000);
      const onError = () => {
        clearTimeout(timer);
        callback(new Error("smtp_connection_failed"), false);
      };
      socket.once("error", onError);
      socket.once("secureConnect", () => {
        clearTimeout(timer);
        socket.removeListener("error", onError);
        callback(null, { connection: socket, secured: true });
      });
    },
  });
}

export function leadMessage(user: string, lead: LeadNotice) {
  if (!/^[a-f0-9-]{36}$/i.test(lead.leadId)) throw new Error("invalid_lead_id");
  return {
    from: { name: "PODER", address: user },
    to: LEAD_RECIPIENT,
    subject: "PODER — nova inscrição nas imersões",
    messageId: `<lead-notification-${lead.leadId}@podermentoriasetreinamentos.com>`,
    text: ["Uma nova inscrição foi confirmada nas imersões PODER.", "",
      `Nome: ${lead.name}`, `Telefone: ${lead.phone}`, `Cidade: ${lead.city}`, `E-mail: ${lead.email}`,
    ].join("\n"),
  };
}

export async function sendLeadNotice(config: SmtpConfig, lead: LeadNotice) {
  const transport = createLeadTransport(config);
  try {
    const result = await transport.sendMail(leadMessage(config.user, lead));
    if (!result.accepted.includes(LEAD_RECIPIENT)) throw new Error("smtp_recipient_not_accepted");
  } finally {
    transport.close();
  }
}