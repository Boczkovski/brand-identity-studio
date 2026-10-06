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

O cadastro atual funciona com as configurações públicas acima; não exige exportar uma credencial privada do banco. Os avisos usam o domínio `notify.podermentoriasetreinamentos.com` e têm destinatário fixo `podermentoriasetreinamentos@gmail.com`.

O domínio precisa concluir a verificação em Cloud → Emails. A credencial gerenciada para envio é disponibilizada automaticamente no ambiente Lovable, mas não é transferida ao servidor da Hostinger pela sincronização do GitHub. Por isso, a entrega de avisos no servidor externo ainda depende de uma solução de autorização compatível; não coloque credenciais no repositório nem em variáveis `VITE_`. O cadastro continua sendo salvo caso o envio não esteja disponível. Nenhuma entrega na Hostinger foi validada ainda.