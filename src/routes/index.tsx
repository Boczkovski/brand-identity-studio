import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, ChevronDown, Copy, ExternalLink, MoveRight } from "lucide-react";
import { cloneElement, type FormEvent, type ReactElement, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { submitPoderLead } from "@/lib/poder-lead.functions";

const logo = "/assets/poder-logo.png";
const poster = "/assets/capa-imersoes.jpg";
const video = "/assets/poder-imersoes.mp4";

const GROUP_URL = "https://chat.whatsapp.com/HDjXr1RSLbBEz7aOcgKq8x";

type FormValues = { name: string; phone: string; city: string; email: string; consent: boolean; website: string };
const initialValues: FormValues = { name: "", phone: "", city: "", email: "", consent: false, website: "" };

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Imersões gratuitas de IA para advogados | PODER" },
      { name: "description", content: "Entre no grupo gratuito da PODER e acompanhe imersões sobre inteligência artificial aplicada à advocacia." },
      { property: "og:title", content: "Imersões gratuitas de IA para advogados | PODER" },
      { property: "og:description", content: "Cadastre-se para acessar o grupo gratuito da PODER e acompanhar as próximas imersões." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function track(name: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("poder:analytics", { detail: { name } }));
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function Index() {
  const submitLead = useServerFn(submitPoderLead);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [startedAt] = useState(() => Date.now());
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [started, setStarted] = useState(false);
  const successTitleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    track("landing_view");
    if (sessionStorage.getItem("poder_lead_confirmed") === "true") setStatus("success");
  }, []);
  useEffect(() => { if (status === "success") successTitleRef.current?.focus(); }, [status]);

  const update = (field: keyof FormValues, value: string | boolean) => {
    if (!started) { setStarted(true); track("form_start"); }
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const next: typeof errors = {};
    if (values.name.trim().length < 2) next.name = "Informe seu nome.";
    if (values.phone.replace(/\D/g, "").length < 10) next.phone = "Informe o telefone com DDD.";
    if (values.city.trim().length < 2) next.city = "Informe sua cidade.";
    if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = "Informe um e-mail válido.";
    if (!values.consent) next.consent = "Você precisa autorizar o uso dos dados para concluir a inscrição.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setStatus("submitting");
    setMessage("");
    const params = new URLSearchParams(window.location.search);
    try {
      await submitLead({ data: {
        idempotencyKey, startedAt, ...values,
        source: document.referrer ? "referencia" : "acesso_direto",
        utmSource: params.get("utm_source"), utmMedium: params.get("utm_medium"),
        utmCampaign: params.get("utm_campaign"), utmContent: params.get("utm_content"), utmTerm: params.get("utm_term"),
      }});

      try {
        const emailResponse = await fetch("https://api.podermentoriasetreinamentos.com/send-lead.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name,
            phone: values.phone,
            city: values.city,
            email: values.email,
            website: values.website,
          }),
        });
        if (!emailResponse.ok) {
          console.warn("PODER notification email failed", { status: emailResponse.status });
        }
      } catch {
        console.warn("PODER notification email failed");
      }

      sessionStorage.setItem("poder_lead_confirmed", "true");
      setStatus("success");
      track("lead_saved");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Não foi possível concluir seu cadastro agora. Seus dados continuam preenchidos; tente novamente.");
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="border-b border-foreground bg-background">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" aria-label="PODER — página inicial" className="logo-frame">
            <img src={logo} alt="PODER" className="h-auto w-32 sm:w-40 md:w-48" />
          </Link>
          <Button asChild className="hidden sm:inline-flex"><a href="#inscricao">Quero participar gratuitamente</a></Button>
        </div>
      </header>

      <section className="border-b-2 border-foreground bg-ink text-offwhite">
        <div className="mx-auto max-w-[1240px] px-5 py-14 md:px-8 md:py-24">
          <div className="grid items-start gap-12 lg:grid-cols-[1.25fr_.75fr] lg:gap-20">
            <div className="lg:sticky lg:top-8">
              <p className="text-xs font-bold uppercase text-neon">Imersões gratuitas | IA para advogados</p>
              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.02] sm:text-5xl lg:text-7xl">Advogado, aprenda a usar inteligência artificial <span className="text-neon">com método.</span></h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-offwhite/70">Entre no grupo gratuito da PODER e tenha acesso a imersões sobre IA para a advocacia. Um ponto de partida para estruturar conhecimento, organizar processos e ampliar sua atuação com tecnologia.</p>
              <Button asChild size="large" className="mt-8 w-full sm:w-auto"><a href="#inscricao">Quero acesso às imersões gratuitas <MoveRight aria-hidden="true" /></a></Button>
              <p className="mt-4 text-sm text-offwhite/55">Faça seu cadastro. Na próxima etapa, entre no grupo.</p>
            </div>

          <aside id="inscricao" className="scroll-mt-6 self-start border border-offwhite/25 bg-background p-6 text-foreground sm:p-8 lg:p-9">
            {status === "success" ? (
              <div aria-live="polite">
                <span className="mb-5 inline-flex items-center gap-2 border border-foreground bg-success px-3 py-2 text-xs font-bold uppercase"><Check size={18} /> 2 de 2 — Entre no grupo</span>
                <h2 ref={successTitleRef} tabIndex={-1} className="text-3xl font-black leading-tight outline-none">Cadastro recebido. Agora, entre no grupo.</h2>
                <p className="mt-4 leading-7 text-muted-foreground">Falta um passo para acompanhar as imersões gratuitas da PODER: toque no botão abaixo e conclua sua entrada no WhatsApp.</p>
                <Button asChild variant="whatsapp" size="large" className="mt-7 w-full normal-case"><a href={GROUP_URL} target="_blank" rel="noreferrer" onClick={() => track("whatsapp_group_click")}><ExternalLink aria-hidden="true" /> Clique aqui e entre no nosso grupo para ter imersão gratuita</a></Button>
                <Button variant="outline" className="mt-3 w-full normal-case" onClick={async () => { await navigator.clipboard.writeText(GROUP_URL); setMessage("Link copiado."); }}><Copy size={18} /> Copiar link do grupo</Button>
                {message && <p className="mt-3 text-center text-sm font-bold" role="status">{message}</p>}
                <p className="mt-5 border-t border-border pt-5 text-sm text-muted-foreground">Seu cadastro foi recebido. A entrada no grupo só é concluída após você abrir o link e confirmar no WhatsApp.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <p className="text-xs font-bold uppercase text-muted-foreground">1 de 2 — Faça seu cadastro</p>
                <h2 className="mt-4 text-3xl font-black leading-tight">Acesse o grupo gratuito da PODER.</h2>
                <p className="mt-4 leading-7 text-muted-foreground">Preencha seus dados para continuar e receber o link de entrada.</p>
                <div className="mt-7 grid gap-5">
                  <Field label="Nome" id="name" error={errors.name}><input id="name" name="name" autoComplete="name" maxLength={120} value={values.name} onChange={(e) => update("name", e.target.value)} /></Field>
                  <Field label="Telefone (WhatsApp)" id="phone" error={errors.phone}><input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={16} placeholder="(00) 00000-0000" value={values.phone} onChange={(e) => update("phone", formatPhone(e.target.value))} /></Field>
                  <Field label="Cidade" id="city" error={errors.city}><input id="city" name="city" autoComplete="address-level2" maxLength={120} value={values.city} onChange={(e) => update("city", e.target.value)} /></Field>
                  <Field label="E-mail" id="email" error={errors.email}><input id="email" name="email" type="email" autoComplete="email" maxLength={255} value={values.email} onChange={(e) => update("email", e.target.value)} /></Field>
                  <div className="sr-only" aria-hidden="true"><label htmlFor="website">Não preencher</label><input id="website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => update("website", e.target.value)} /></div>
                  <div>
                    <label className="flex cursor-pointer items-start gap-3 text-sm leading-6"><input className="mt-1 size-5 shrink-0 accent-foreground" type="checkbox" checked={values.consent} onChange={(e) => update("consent", e.target.checked)} aria-describedby={errors.consent ? "consent-error" : undefined} /><span>Autorizo a PODER a utilizar meus dados para organizar minha inscrição e enviar informações sobre estas imersões, conforme a <Link to="/privacidade" className="font-bold underline">Política de Privacidade</Link>.</span></label>
                    {errors.consent && <p id="consent-error" className="mt-2 text-sm font-bold text-destructive" role="alert">{errors.consent}</p>}
                  </div>
                </div>
                {status === "error" && <p className="mt-5 border-2 border-destructive bg-destructive/10 p-3 text-sm font-bold" role="alert">{message}</p>}
                <Button type="submit" size="large" className="mt-6 w-full" disabled={status === "submitting"}>{status === "submitting" ? "Enviando seu cadastro..." : "Quero acesso às imersões gratuitas"}</Button>
                <p className="mt-3 text-center text-sm text-muted-foreground">O próximo passo é entrar no grupo de WhatsApp.</p>
              </form>
            )}
          </aside>
          </div>
        </div>
      </section>

      <section className="border-b-2 border-foreground bg-ink pb-16 text-offwhite md:pb-24">
        <div className="mx-auto max-w-[1240px] border-t border-offwhite/25 px-5 pt-10 md:px-8 md:pt-14">
          <p className="mb-6 text-xs font-black uppercase text-neon">Conheça as imersões</p>
          <div className="video-stage">
            <video className="aspect-video w-full bg-ink" controls playsInline preload="metadata" poster={poster} aria-label="Vídeo de apresentação da PODER">
              <source src={video} type="video/mp4" />Seu navegador não suporta vídeo.
            </video>
          </div>
        </div>
      </section>

      <section className="border-b border-foreground py-16 md:py-28">
        <div className="mx-auto max-w-[1240px] px-5 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end lg:gap-20"><h2 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">Não é só sobre usar IA. É sobre usar <span className="highlight">com método.</span></h2><p className="max-w-xl text-lg leading-8 text-muted-foreground">A PODER propõe uma forma estruturada de conectar conhecimento, processos e tecnologia à atuação profissional.</p></div>
          <div className="mt-14 grid border-y border-foreground md:grid-cols-3">
            {[["01", "Conhecimento estruturado", "Organização e clareza como ponto de partida."], ["02", "Processos organizados", "Uma visão de método, em vez de tentativas desconectadas."], ["03", "Tecnologia na atuação profissional", "O aprendizado sobre IA conectado ao contexto da advocacia."]].map(([n,t,d]) => <article key={n} className="border-b border-foreground py-8 last:border-b-0 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0"><span className="text-sm font-black text-muted-foreground">{n}</span><h3 className="mt-12 text-xl font-black">{t}</h3><p className="mt-3 leading-7 text-muted-foreground">{d}</p></article>)}
          </div>
          <p className="mt-10 text-center text-sm font-black uppercase md:text-base">Persona. Objetivo. Detalhe. Estrutura. Regras.</p>
        </div>
      </section>

      <section className="border-b border-foreground bg-neon py-16 text-ink md:py-24"><div className="mx-auto max-w-[1240px] px-5 md:px-8"><p className="text-xs font-black uppercase">Como participar</p><div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-0">{["Preencha seus dados.", "Clique no botão de acesso ao grupo.", "Acompanhe no grupo as informações para participar das imersões."].map((text, i) => <div key={text} className="border-t border-ink pt-5 md:px-8 md:first:pl-0 md:last:pr-0"><span className="text-4xl font-black">0{i+1}.</span><p className="mt-5 max-w-xs text-lg font-bold leading-7">{text}</p></div>)}</div></div></section>

      <section className="border-b border-foreground py-16 md:py-28"><div className="mx-auto grid max-w-[1240px] gap-12 px-5 md:px-8 lg:grid-cols-[.7fr_1.3fr] lg:gap-24"><div><p className="text-xs font-black uppercase text-muted-foreground">Perguntas frequentes</p><h2 className="mt-4 text-4xl font-black md:text-5xl">Antes de entrar.</h2></div><div className="border-t border-foreground">{[["A participação é gratuita?", "Sim. A entrada no grupo e as imersões anunciadas nesta página são gratuitas."], ["Para quem é o grupo?", "Para advogados e advogadas que desejam aprender a usar inteligência artificial na atuação profissional."], ["O cadastro já me coloca no grupo?", "Não. Depois de enviar o formulário, clique no botão verde e conclua a entrada no WhatsApp."]].map(([q,a]) => <details key={q} className="group border-b border-foreground py-6"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-black">{q}<ChevronDown className="shrink-0 transition-transform group-open:rotate-180" /></summary><p className="max-w-2xl pt-4 leading-7 text-muted-foreground">{a}</p></details>)}</div></div></section>

      <section className="bg-ink py-16 text-offwhite md:py-24"><div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-10 px-5 md:px-8 lg:flex-row lg:items-end"><h2 className="max-w-4xl text-4xl font-black leading-tight md:text-6xl">Seu próximo passo com IA começa nas imersões gratuitas da PODER.</h2><Button asChild size="large"><a href="#inscricao">Quero participar gratuitamente</a></Button></div></section>
      <footer className="border-t border-offwhite/25 bg-ink py-7 text-offwhite"><div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-5 text-sm md:flex-row md:items-center md:justify-between md:px-8"><span>PODER — Imersões gratuitas sobre IA para advocacia.</span><Link to="/privacidade" className="font-bold underline">Política de Privacidade</Link></div></footer>
    </main>
  );
}

function Field({ label, id, error, children }: { label: string; id: string; error: string | undefined; children: ReactElement<{ "aria-invalid"?: boolean; "aria-describedby"?: string }> }) {
  const accessibility = error ? { "aria-invalid": true, "aria-describedby": `${id}-error` } : { "aria-invalid": false };
  return <div><label htmlFor={id} className="mb-2 block text-sm font-bold">{label}</label>{cloneElement(children, accessibility)}{error && <p id={`${id}-error`} className="mt-2 text-sm font-bold text-destructive" role="alert">{error}</p>}</div>;
}
