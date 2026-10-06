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

O cadastro atual funciona com as configurações públicas acima; não exige exportar uma credencial privada do banco. Depois de salvar, o servidor envia o aviso por SMTP Hostinger para `contato@podermentoriasetreinamentos.com`, contendo nome, telefone, cidade e e-mail. Essa caixa precisa existir e receber mensagens.

Configure também `SMTP_HOST` (`smtp.hostinger.com`), `SMTP_PORT` (`465`), `SMTP_USER` (endereço completo da caixa remetente) e `SMTP_PASS` (senha dessa caixa) nas variáveis privadas da Web App Hostinger. Os secrets do Lovable não são transferidos pelo GitHub. Nunca coloque valores privados no repositório nem em variáveis `VITE_`.

A conexão usa TLS/SSL desde o início e verifica o certificado. O remetente é a caixa autenticada de `SMTP_USER`; não depende do serviço transacional ou da verificação de domínio de envio do Lovable. A implementação destina-se à Web App Node.js da Hostinger; a execução SMTP no ambiente publicado do Lovable não foi validada.

Uma falha de envio não desfaz o cadastro nem mostra erro ao visitante. Não há reenvio automático ou garantia de entrega única; o Message-ID é estável por cadastro, mas SMTP não fornece idempotência. Após atualizar a implantação pelo GitHub e configurar as quatro variáveis, valide um cadastro e o recebimento (inclusive spam). A aceitação SMTP não garante chegada à caixa de entrada.