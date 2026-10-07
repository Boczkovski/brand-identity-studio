# Publicação na Hostinger via GitHub

Este projeto gera uma aplicação Node.js completa, incluindo as páginas e o processamento seguro do formulário.

## Configuração da Web App

- Repositório: selecione o repositório conectado a este projeto.
- Branch: use a branch principal sincronizada pelo Lovable.
- Versão do Node.js: 22.
- Comando de instalação: `npm install`
- Comando de compilação: `npm run build`
- Comando de inicialização: `npm start`
- Porta: use a variável `PORT` fornecida automaticamente pela Hostinger.

Não selecione publicação estática e não use a pasta `dist`. O servidor inicia em `.output/server/index.mjs`.

## Variáveis de ambiente

Cadastre estas variáveis nas configurações da Web App:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

As variáveis que começam com `VITE_` usam os mesmos valores públicos das equivalentes sem esse prefixo. Nunca coloque o valor de `SUPABASE_SERVICE_ROLE_KEY` no GitHub ou em arquivo versionado.

## Domínio

Depois que a primeira implantação estiver saudável, conecte o domínio à Web App pelo painel da Hostinger e habilite HTTPS.

## Verificação final

1. Abra a página inicial e confirme que logo, capa e vídeo carregam.
2. Envie um cadastro de teste.
3. Confirme a tela de sucesso e o acesso ao grupo.
4. Confirme o cadastro no banco antes de divulgar o endereço.

## Avisos de cadastro por e-mail

O cadastro atual funciona com as configurações públicas acima; não exige exportar uma credencial privada do banco. Depois de salvar, o servidor tenta enviar o aviso por HTTPS pela API Resend para `contato@podermentoriasetreinamentos.com`, contendo nome, telefone, cidade e e-mail. Essa caixa precisa existir e receber mensagens.

Configure `RESEND_API_KEY` nas variáveis privadas da Web App Hostinger ou em Project Settings → Secrets no Lovable. Obtenha a chave na conta Resend, em API Keys, com permissão de envio. Os secrets do Lovable não são transferidos pelo GitHub. Nunca coloque valores privados no repositório nem em variáveis `VITE_`. As antigas variáveis `SMTP_*` não são utilizadas por este aviso.

A implementação usa somente HTTPS, compatível com Lovable Cloud e Node.js, sem conexão SMTP TCP. Por padrão, usa `onboarding@resend.dev`: **esse remetente só entrega ao endereço do proprietário da conta Resend**. Para dispensar domínio verificado neste aviso administrativo, crie/verifique a conta Resend com `contato@podermentoriasetreinamentos.com` como e-mail proprietário. Não basta adicionar esse endereço como destinatário. Se a conta usar outro endereço, verifique um domínio próprio no Resend e configure `RESEND_FROM_EMAIL` com um endereço autorizado desse domínio. Não altere as delegações DNS do Lovable sem avaliar conflitos. O domínio nativo Lovable permanece pendente e não é usado por este fluxo.

Uma falha de envio não desfaz o cadastro nem mostra erro ao visitante. Não há reenvio automático. A chave de idempotência é estável por cadastro; a proteção depende da janela de retenção do Resend (24 horas), não é garantia ilimitada de entrega única. Após configurar a credencial e atualizar a publicação, valide um cadastro e o recebimento (inclusive spam). Aceitação pela API não garante chegada à caixa de entrada.