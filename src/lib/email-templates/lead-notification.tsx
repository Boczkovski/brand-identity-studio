import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  name?: string;
  phone?: string;
  city?: string;
  email?: string;
}

const palette = { background: "#ffffff", ink: "#000000", accent: "#cbe313" };
const LeadNotification = ({ name, phone, city, email }: Props) => (
  <Html lang="pt-BR">
    <Head />
    <Preview>Novo cadastro nas imersões PODER.</Preview>
    <Body style={{ backgroundColor: palette.background, color: palette.ink, fontFamily: "Arial, sans-serif" }}>
      <Container style={{ padding: "32px 24px", maxWidth: "560px" }}>
        <Section style={{ borderTop: `6px solid ${palette.accent}` }}>
          <Heading>PODER — novo cadastro</Heading>
          <Text>Uma nova inscrição foi confirmada nas imersões.</Text>
          <Text><strong>Nome:</strong> {name || "Não informado"}</Text>
          <Text><strong>Telefone:</strong> {phone || "Não informado"}</Text>
          <Text><strong>Cidade:</strong> {city || "Não informada"}</Text>
          <Text><strong>E-mail:</strong> {email || "Não informado"}</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: LeadNotification,
  subject: "PODER — nova inscrição nas imersões",
  displayName: "Aviso de novo cadastro",
  to: "contato@podermentoriasetreinamentos.com",
  previewData: { name: "Pessoa de exemplo", phone: "+55 81 90000-0000", city: "Recife", email: "exemplo@example.com" },
} satisfies TemplateEntry;