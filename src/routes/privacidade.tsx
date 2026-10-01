import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/poder-logo.png.asset.json";

export const Route = createFileRoute("/privacidade")({
  head: () => ({ meta: [
    { title: "Política de Privacidade | PODER" },
    { name: "description", content: "Informações sobre o uso de dados na inscrição para as imersões gratuitas da PODER." },
    { property: "og:title", content: "Política de Privacidade | PODER" },
    { property: "og:description", content: "Como os dados de inscrição nas imersões gratuitas da PODER são utilizados." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ]}), component: Privacy,
});

function Privacy() {
  return <main className="min-h-screen bg-background text-foreground"><header className="border-b-2 border-foreground"><div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4"><Link to="/" className="logo-frame"><img src={logo.url} alt="PODER" className="h-8 w-auto" /></Link><Link to="/" className="font-bold underline">Voltar à inscrição</Link></div></header><article className="mx-auto max-w-4xl px-5 py-12 md:py-20"><p className="text-xs font-black uppercase">Privacidade</p><h1 className="mt-4 text-4xl font-black md:text-6xl">Como usamos seus dados.</h1><div className="prose-poder mt-12"><section><h2>Dados coletados</h2><p>Nome, telefone, cidade e e-mail informados no formulário, além da manifestação de consentimento, data, origem da visita e parâmetros de campanha permitidos.</p></section><section><h2>Finalidade</h2><p>Os dados são utilizados para organizar a inscrição e enviar informações relacionadas às imersões gratuitas da PODER. O cadastro não confirma automaticamente a entrada no grupo de WhatsApp.</p></section><section><h2>Encaminhamento administrativo</h2><p>Os dados do cadastro são armazenados em ambiente privado e encaminhados aos responsáveis pela campanha por e-mail e WhatsApp Business. As integrações só serão ativadas após a validação dos remetentes, permissões e fornecedores.</p></section><section className="border-2 border-foreground bg-neon p-6"><h2>Informações pendentes de aprovação</h2><p>A identificação completa do controlador, o canal oficial para solicitações, o prazo de retenção e a base legal definitiva ainda precisam ser informados e aprovados pelo responsável antes da publicação desta página.</p></section><section><h2>Seus direitos</h2><p>Você poderá solicitar informações, correção ou eliminação de dados pelo canal oficial que será indicado pelo controlador antes da publicação.</p></section></div></article></main>;
}
