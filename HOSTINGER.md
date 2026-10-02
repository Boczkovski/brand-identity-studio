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
- `SUPABASE_SERVICE_ROLE_KEY`
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

## Limitação atual do banco

O cadastro usa uma credencial privada do banco hospedado no Lovable Cloud. Essa credencial não é exportável pelo painel. Para hospedar o servidor na Hostinger, será necessário migrar o banco para uma conta administrada por você e informar a nova credencial privada na Web App. Até essa migração, o site pode ser publicado pelo Lovable e usar normalmente um domínio comprado na Hostinger.