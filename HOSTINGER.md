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

O cadastro atual funciona com as configurações públicas acima; não exige exportar uma credencial privada do banco. Depois de salvar, o servidor tenta enviar o aviso pela API oficial Hostinger Mail (`https://api.mail.hostinger.com`) para `contato@podermentoriasetreinamentos.com`, contendo nome, telefone, cidade e e-mail.

O único secret privado necessário para esse aviso é `HOSTINGER_MAIL_API_TOKEN`: use um token da API Hostinger Mail autorizado a gerenciar e enviar pela caixa `contato@podermentoriasetreinamentos.com`. Adicione em Project Settings → Secrets no Lovable; para implantação externa, configure a mesma variável privada na Web App Hostinger. Os secrets do Lovable não são transferidos pelo GitHub. Nunca coloque o token no repositório nem em variáveis `VITE_`.

A implementação usa somente HTTPS e fetch nativo, sem dependência de transporte ou serviço de e-mail externo. Faz `GET /api/v1/me`, procura correspondência exata de `address` e usa o `resourceId` retornado no `POST /api/v1/mailboxes/{mailboxResourceId}/send`. O JSON contém `to`, `displayName: "PODER"`, `subject` e `text`. A resposta de envio esperada é HTTP 204. Não depende da verificação de domínio de envio do Lovable.

Uma falha de envio não desfaz o cadastro nem mostra erro ao visitante. As duas chamadas compartilham um limite de 10 segundos. Não há reenvio automático nem garantia de idempotência do envio na API oficial; uma repetição de submissão pode gerar outro aviso. Logs contêm somente etapa, status HTTP e código permitido, nunca resposta do provedor, token ou dados pessoais. Após configurar a credencial e autorizar a atualização da publicação, valide um cadastro e o recebimento (inclusive spam). Aceitação pela API não garante chegada à caixa de entrada.