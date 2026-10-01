# Landing page PODER — plano de implementação

## Resultado
Criar a página curta em português para captar advogados, salvar cada cadastro com segurança e liberar o botão de entrada no grupo somente após a confirmação.

## Página e experiência
- Cabeçalho mínimo com o logotipo original e um único botão para a inscrição.
- Abertura em duas colunas no computador e sequência linear no celular: mensagem, chamada, vídeo e formulário.
- Player 16:9 com controles, reprodução inline, capa extraída do vídeo e carregamento sob demanda.
- Formulário com Nome, Telefone, Cidade, E-mail e consentimento; validação clara e preservação dos dados em caso de falha.
- Confirmação substituindo o formulário após a gravação, com botão verde-menta para o grupo e opção de copiar o link.
- Blocos seguintes: método, três passos, perguntas frequentes, chamada final e rodapé.
- Página `/privacidade` com texto provisório transparente e pendências de aprovação claramente indicadas.

## Identidade visual
- Brutalismo estrutural contemporâneo, alto contraste, blocos rigorosos e bastante espaço negativo.
- Paleta oficial: preto, off-white, verde-neon para cadastro e verde-menta para confirmação/WhatsApp.
- Rubik em toda a interface.
- Uso do arquivo original do logo, sem redesenho, deformação ou efeitos.
- Sem símbolos jurídicos, imagens genéricas, robôs ou degradês decorativos.

## Cadastro e proteção
- Banco privado no Lovable Cloud para cadastros e tarefas administrativas.
- Validação no navegador e no servidor, telefone normalizado para `+55`, limites de tamanho, honeypot e limitação de tentativas.
- Chave de idempotência para evitar cadastros repetidos em cliques ou novas tentativas.
- Registro da versão do consentimento, origem/UTMs permitidas e estados independentes das notificações.
- Cadastros sem leitura pública e sem dados pessoais em eventos, URLs ou armazenamento local.

## Notificações
- Criar duas tarefas duráveis no mesmo momento do cadastro: e-mail ao endereço administrativo e WhatsApp ao número administrativo.
- O acesso ao grupo não dependerá da entrega dessas notificações; falhas ficarão registradas para tratamento.
- Preparar processamento com tentativas limitadas e estados separados de pendente, aceito, entregue e falha.
- A ativação real dependerá da conexão de e-mail, remetente verificado, conexão WhatsApp Business, remetente, permissão do destinatário e template aprovado pela Meta.

## Medição e acessibilidade
- Preparar os eventos `landing_view`, `form_start`, `lead_saved` e `whatsapp_group_click`, sem ativar ferramentas de marketing inexistentes.
- Navegação por teclado, foco visível, mensagens acessíveis, contraste adequado e respeito à redução de movimento.
- Verificação visual em 360, 390, 768 e 1440 px, além do fluxo válido, erros, clique duplo e indisponibilidades.

## Pendências antes de publicar
- Identificação completa do controlador, canal oficial de privacidade, retenção, base legal e aprovação final do aviso.
- Conexões e autorizações de e-mail e WhatsApp Business, incluindo template administrativo aprovado quando exigido.
- Teste real de recebimento nos dois canais e validação do convite do grupo.
