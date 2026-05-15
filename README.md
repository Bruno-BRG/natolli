# Natolli Studio

Site Next.js para catálogo, pedidos e contato da Natolli Studio.

## Rodar localmente

```powershell
npm install
npm run dev
```

Abra `http://localhost:3000/`.

## Contatos para trocar

- Produtos e cores: `lib/catalog.ts`
- Instagram e cidade: `app/page.tsx`, seção `contato`
- Visual: `app/globals.css`

## Pagamento recomendado

Para começar, o caminho mais simples é centralizar o contato pelo Instagram e receber por Pix manual quando o pagamento online nao estiver configurado.

Quando a loja tiver volume, integre Mercado Pago Checkout Pro. Ele redireciona o cliente para o ambiente do Mercado Pago e permite cartão, Pix, boleto e carteira Mercado Pago, mantendo menos responsabilidade técnica no site do que um checkout transparente.

O fluxo inicial de Mercado Pago esta em `POST /api/pagamento`.

Para uma futura area administrativa:

1. Criar tabelas de produtos, pedidos e cores no Supabase.
2. Proteger rotas de admin com Supabase Auth.
3. Salvar pedidos antes do redirecionamento para o Mercado Pago.
4. Receber webhooks para atualizar status de pagamento.
5. Editar catalogo e contatos pelo painel em vez de alterar codigo.

## Mercado Pago

O projeto ja tem um fluxo inicial com Mercado Pago Checkout Pro em `POST /api/pagamento`.

Configure estas variáveis na Vercel:

```env
SITE_URL=https://natolli.vercel.app
MERCADO_PAGO_ACCESS_TOKEN=APP_USR_SEU_ACCESS_TOKEN_AQUI
NEXT_PUBLIC_SUPABASE_URL=https://okflipyzwrvazcmobdxt.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=service_role_...
ADMIN_EMAILS=admin@natolli.com
ADMIN_USER_IDS=a52301a0-eaca-4e2e-ba35-97a779b92f49
```

Use credenciais de teste primeiro. Depois troque para a credencial de produção da conta que vai receber os pagamentos.

## Admin e Supabase

Rode o SQL de `supabase/schema.sql` no SQL Editor do Supabase para criar a tabela `products`, habilitar RLS e popular os produtos iniciais.

A pagina `/admin` salva novos produtos direto no Supabase usando `SUPABASE_SERVICE_ROLE_KEY`, que deve existir apenas no servidor/local `.env.local` e na Vercel. Nao exponha essa chave no navegador.

Para acessar o admin com login e senha:

1. No Supabase, abra Authentication > Users.
2. Crie um usuario com e-mail e senha.
3. Coloque esse e-mail em `ADMIN_EMAILS` ou o UUID em `ADMIN_USER_IDS`. Para mais de um admin, separe por virgula.
4. Acesse `/admin/login`.

Depois de configurar a chave, voce pode subir as imagens atuais de `public/loja/img` para o Supabase Storage e atualizar os produtos iniciais:

```powershell
npm run supabase:upload-images
```

No admin da loja:

- use `/admin` para cadastrar produto;
- envie foto pelo campo de arquivo, sem precisar copiar URL;
- edite nome, preco, descricao e imagem;
- arquive produtos para remover do site sem excluir;
- exclua produtos quando nao forem mais necessarios.

O historico de compras aparece no mesmo painel. Quando o cliente inicia pagamento pelo Mercado Pago, o pedido e salvo em `orders` com status `pending`. O proximo passo de producao e adicionar webhook do Mercado Pago para trocar automaticamente para aprovado, pendente ou recusado.

Pedidos feitos fora do site podem ser cadastrados manualmente no painel. A coluna `order_source` separa `site` de `manual`; rode novamente o SQL de `supabase/schema.sql` no Supabase se a tabela `orders` ja existia antes dessa coluna.
