import Image from "next/image";
import { OrderForm } from "@/app/components/order-form";
import { colors, WHATSAPP_NUMBER } from "@/lib/catalog";
import { getProducts } from "@/lib/products";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ paymentError?: string }>;
}) {
  const mercadoPagoEnabled = Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN);
  const products = await getProducts();

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Natolli Studio">
          <span className="brand-mark">N</span>
          <span>
            <strong>Natolli</strong>
            <small>Studio artesanal</small>
          </span>
        </a>
        <nav aria-label="Navegacao principal">
          <a href="#catalogo">Catalogo</a>
          <a href="#cores">Cores</a>
          <a href="#pedido">Pedido</a>
          <a href="#contato">Contato</a>
        </nav>
      </header>

      <main id="inicio">
        <PaymentMessage searchParams={searchParams} />

        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Feito a mao em Salvador</p>
            <h1>Bolsas e pecas artesanais com a sua cor, o seu jeito e acabamento sob encomenda.</h1>
            <p>
              Escolha um modelo, selecione a linha e envie seu pedido. A confirmacao final de prazo,
              valor e pagamento pode ser feita pelo WhatsApp.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#pedido">
                Fazer pedido
              </a>
              <a className="button secondary" href="#catalogo">
                Ver modelos
              </a>
            </div>
          </div>
          <div className="hero-media" aria-label="Bolsa artesanal Natolli">
            <Image src="/loja/img/bolsa-bordo.png" alt="Bolsa artesanal bordo Natolli" width={720} height={900} priority />
          </div>
        </section>

        <section id="catalogo" className="section">
          <div className="section-heading">
            <p className="eyebrow">Catalogo inicial</p>
            <h2>Modelos para encomenda</h2>
          </div>
          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                <Image src={product.image} alt={product.name} width={640} height={640} />
                <div>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <strong>{product.price}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="cores" className="section muted-section">
          <div className="section-heading">
            <p className="eyebrow">Linhas Natolli</p>
            <h2>Paleta de cores disponivel</h2>
          </div>
          <div className="color-layout">
            <div className="color-list">
              {colors.map((color) => (
                <span key={color}>{color}</span>
              ))}
            </div>
            <div className="catalog-images">
              <Image src="/loja/img/catalogo-cores-1.webp" alt="Catalogo de cores Natolli 1" width={760} height={760} />
              <Image src="/loja/img/catalogo-cores-2.webp" alt="Catalogo de cores Natolli 2" width={760} height={760} />
            </div>
          </div>
        </section>

        <section id="pedido" className="section order-section">
          <div className="section-heading">
            <p className="eyebrow">Pedido rapido</p>
            <h2>Monte sua encomenda</h2>
          </div>
          <OrderForm mercadoPagoEnabled={mercadoPagoEnabled} products={products} />
        </section>

        <section id="contato" className="section contact-section">
          <div>
            <p className="eyebrow">Contato e pagamento</p>
            <h2>Atendimento direto e pagamento simples</h2>
            <p>
              Placeholder de contato: WhatsApp {WHATSAPP_NUMBER}, Instagram @natolli_studio,
              Salvador - Bahia. Troque esses dados quando tiver os contatos finais.
            </p>
          </div>
          <div className="payment-notes">
            <h3>Recomendacao inicial</h3>
            <p>
              Comece com pedido por WhatsApp + Pix manual para validar os produtos. Quando o volume crescer,
              integre Mercado Pago Checkout Pro para cartao, Pix, boleto e retorno automatico ao site.
            </p>
          </div>
        </section>
      </main>

      <footer>
        <span>Natolli Studio</span>
        <span>Artesanal - feito a mao - com alma</span>
      </footer>
    </>
  );
}

async function PaymentMessage({
  searchParams,
}: {
  searchParams?: Promise<{ paymentError?: string }>;
}) {
  const params = await searchParams;

  if (!params?.paymentError) {
    return null;
  }

  return (
    <div className="messages" role="status">
      <p>
        {params.paymentError === "missing-token"
          ? "Configure MERCADO_PAGO_ACCESS_TOKEN na Vercel antes de receber pagamentos."
          : "Nao foi possivel iniciar o pagamento. Confira as credenciais do Mercado Pago."}
      </p>
    </div>
  );
}
