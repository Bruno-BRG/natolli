import Image from "next/image";
import {
  createManualOrder,
  createProduct,
  deleteProduct,
  toggleProduct,
  updateOrderStatus,
  updateProduct,
} from "@/app/admin/actions";
import { signOutAdmin } from "@/app/admin/auth-actions";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminOrders, orderStatusValues, type AdminOrder } from "@/lib/orders";
import { formatPriceFromCents, getAdminProducts, type AdminProduct } from "@/lib/products";

function priceInputValue(product: AdminProduct) {
  return product.unitPrice.toFixed(2).replace(".", ",");
}

const orderStatuses = [
  { value: orderStatusValues[0], label: "Pendente" },
  { value: orderStatusValues[1], label: "Pago" },
  { value: orderStatusValues[2], label: "Em producao" },
  { value: orderStatusValues[3], label: "Finalizado" },
  { value: orderStatusValues[4], label: "Cancelado" },
];

function orderStatusLabel(status: string) {
  return orderStatuses.find((option) => option.value === status)?.label ?? status;
}

function orderSourceLabel(source: string) {
  return source === "manual" ? "Fora do site" : "Site";
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; message?: string }>;
}) {
  const user = await requireAdmin();
  const params = await searchParams;
  const [products, orders] = await Promise.all([getAdminProducts(), getAdminOrders()]);
  const activeProducts = products.filter((product) => product.active);
  const archivedProducts = products.filter((product) => !product.active);
  const totalValue = activeProducts.reduce((sum, product) => sum + product.unitPrice, 0);
  const pendingOrders = orders.filter((order) => order.status === "pending");
  const siteOrders = orders.filter((order) => order.orderSource === "site");
  const manualOrders = orders.filter((order) => order.orderSource === "manual");
  const orderRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <main className="admin-page">
      <section className="admin-header">
        <a className="brand" href="/" aria-label="Voltar para Natolli Studio">
          <Image className="brand-logo" src="/loja/img/logo.jpeg" alt="Natolli Admin" width={132} height={86} priority />
        </a>
        <div>
          <p className="eyebrow">Painel administrativo</p>
          <h1>Dashboard</h1>
          <p className="admin-user">Conectado como {user.email}</p>
        </div>
        <form action={signOutAdmin}>
          <button className="button secondary" type="submit">
            Sair
          </button>
        </form>
      </section>

      <nav className="admin-nav" aria-label="Navegacao do painel">
        <a href="#resumo">Resumo</a>
        <a href="#pedidos">Pedidos</a>
        <a href="#produtos">Produtos</a>
        <a href="/">Ver loja</a>
      </nav>

      {params?.status ? <AdminStatus status={params.status} message={params.message} /> : null}

      <section id="resumo" className="admin-stats" aria-label="Resumo do catalogo">
        <div>
          <span>{activeProducts.length}</span>
          <p>Produtos publicados</p>
        </div>
        <div>
          <span>{archivedProducts.length}</span>
          <p>Produtos arquivados</p>
        </div>
        <div>
          <span>{formatPriceFromCents(Math.round(totalValue * 100))}</span>
          <p>Soma dos precos ativos</p>
        </div>
        <div>
          <span>{orders.length}</span>
          <p>Pedidos no historico</p>
        </div>
        <div>
          <span>{siteOrders.length}</span>
          <p>Pedidos pelo site</p>
        </div>
        <div>
          <span>{manualOrders.length}</span>
          <p>Pedidos fora do site</p>
        </div>
        <div>
          <span>{pendingOrders.length}</span>
          <p>Pedidos pendentes</p>
        </div>
        <div>
          <span>{formatPriceFromCents(Math.round(orderRevenue * 100))}</span>
          <p>Total registrado</p>
        </div>
      </section>

      <section id="pedidos" className="admin-orders">
        <div className="admin-orders-layout">
          <ManualOrderForm products={products} />
          <div>
            <div className="section-heading">
              <p className="eyebrow">Compras</p>
              <h2>Historico de pedidos</h2>
            </div>
            <OrderHistory orders={orders} />
          </div>
        </div>
      </section>

      <section id="produtos" className="admin-layout">
        <NewProductForm />

        <div className="admin-products">
          <div className="section-heading">
            <p className="eyebrow">Catalogo</p>
            <h2>Gerenciar produtos</h2>
          </div>

          <div className="admin-product-list">
            {products.map((product) => (
              <ProductEditor product={product} key={product.id} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function OrderHistory({ orders }: { orders: AdminOrder[] }) {
  if (!orders.length) {
    return (
      <div className="admin-empty">
        <h3>Nenhum pedido registrado ainda</h3>
        <p>Pedidos pelo site ou cadastrados manualmente aparecem aqui.</p>
      </div>
    );
  }

  return (
    <div className="admin-order-table" role="table" aria-label="Historico de pedidos">
      <div className="admin-order-row heading" role="row">
        <span>Data</span>
        <span>Cliente</span>
        <span>Produto</span>
        <span>Origem</span>
        <span>Total</span>
        <span>Status</span>
      </div>
      {orders.map((order) => (
        <article className="admin-order-row" role="row" key={order.id}>
          <span>{new Date(order.createdAt).toLocaleDateString("pt-BR")}</span>
          <span>
            <strong>{order.customerName || "Sem nome"}</strong>
            <small>{order.customerPhone || "Sem contato"}</small>
          </span>
          <span>
            <strong>{order.productName}</strong>
            <small>
              {order.quantity} un. - {order.color}
            </small>
            {order.notes ? <small>{order.notes}</small> : null}
          </span>
          <span>
            <mark>{orderSourceLabel(order.orderSource)}</mark>
            <small>{order.paymentProvider}</small>
          </span>
          <span>{formatPriceFromCents(Math.round(order.total * 100))}</span>
          <span>
            <form className="inline-status-form" action={updateOrderStatus}>
              <input name="id" type="hidden" value={order.id} />
              <select name="status" defaultValue={order.status} aria-label="Status do pedido">
                {orderStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <button className="button secondary" type="submit">
                Salvar
              </button>
            </form>
            <small>{orderStatusLabel(order.status)}</small>
          </span>
        </article>
      ))}
    </div>
  );
}

function ManualOrderForm({ products }: { products: AdminProduct[] }) {
  return (
    <form className="admin-form manual-order-form" action={createManualOrder}>
      <div>
        <p className="eyebrow">Pedido fora do site</p>
        <h2>Registrar pedido</h2>
      </div>

      <label>
        Produto do catalogo
        <select name="product_id" defaultValue="">
          <option value="">Sem vinculo</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
        <small>Use como referencia. O nome e preco abaixo ficam salvos no historico.</small>
      </label>

      <label>
        Nome do produto
        <input name="product_name" type="text" placeholder="Bolsa tiracolo preta" required />
      </label>

      <label>
        Preco unitario
        <input name="price" type="text" inputMode="decimal" placeholder="189,90" required />
      </label>

      <label>
        Quantidade
        <input name="quantity" type="number" min="1" defaultValue="1" required />
      </label>

      <label>
        Cor
        <input name="color" type="text" placeholder="Bordo" />
      </label>

      <label>
        Cliente
        <input name="customer_name" type="text" placeholder="Nome da cliente" required />
      </label>

      <label>
        Contato
        <input name="customer_contact" type="text" placeholder="@instagram ou outro contato" />
      </label>

      <label>
        Status
        <select name="status" defaultValue="pending">
          {orderStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Observacoes
        <textarea name="notes" rows={4} placeholder="Detalhes combinados, prazo, entrega, pagamento..." />
      </label>

      <button className="button primary" type="submit">
        Adicionar ao historico
      </button>
    </form>
  );
}

function NewProductForm() {
  return (
    <form className="admin-form" action={createProduct}>
      <div>
        <p className="eyebrow">Novo item</p>
        <h2>Cadastrar produto</h2>
      </div>

      <label>
        Nome do produto
        <input name="name" type="text" placeholder="Bolsa tiracolo preta" required />
      </label>

      <label>
        Preco
        <input name="price" type="text" inputMode="decimal" placeholder="189,90" required />
      </label>

      <label>
        Foto do produto
        <input name="image_file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
        <small>Escolha uma imagem do computador. PNG, JPG, WEBP ou GIF ate 5 MB.</small>
      </label>

      <label>
        Link da imagem
        <input name="image_url" type="text" placeholder="Opcional, se nao quiser enviar arquivo" />
      </label>

      <label>
        Descricao
        <textarea name="description" rows={5} placeholder="Tamanho, material, alca, acabamento e prazo." />
      </label>

      <button className="button primary" type="submit">
        Publicar produto
      </button>
    </form>
  );
}

function ProductEditor({ product }: { product: AdminProduct }) {
  return (
    <article className={product.active ? "admin-product" : "admin-product inactive"}>
      <div className="admin-product-media">
        <Image src={product.image} alt={product.name} width={180} height={180} />
        <span>{product.active ? "Publicado" : "Arquivado"}</span>
      </div>

      <div className="admin-product-body">
        <div className="admin-product-title">
          <div>
            <h3>{product.name}</h3>
            <p>{product.description || "Sem descricao."}</p>
          </div>
          <strong>{product.price}</strong>
        </div>

        <details>
          <summary>Editar produto</summary>
          <form className="admin-edit-form" action={updateProduct}>
            <input name="id" type="hidden" value={product.id} />
            <label>
              Nome
              <input name="name" type="text" defaultValue={product.name} required />
            </label>
            <label>
              Preco
              <input name="price" type="text" inputMode="decimal" defaultValue={priceInputValue(product)} required />
            </label>
            <label className="full">
              Trocar foto
              <input name="image_file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
            </label>
            <label className="full">
              Link da imagem
              <input name="image_url" type="text" defaultValue={product.image} />
            </label>
            <label className="full">
              Descricao
              <textarea name="description" rows={4} defaultValue={product.description} />
            </label>
            <label className="admin-check">
              <input name="active" type="checkbox" defaultChecked={product.active} />
              Produto publicado no site
            </label>
            <button className="button primary full" type="submit">
              Salvar alteracoes
            </button>
          </form>
        </details>

        <div className="admin-actions-row">
          <form action={toggleProduct}>
            <input name="id" type="hidden" value={product.id} />
            <input name="active" type="hidden" value={String(product.active)} />
            <button className="button secondary" type="submit">
              {product.active ? "Arquivar" : "Restaurar"}
            </button>
          </form>

          <form action={deleteProduct}>
            <input name="id" type="hidden" value={product.id} />
            <button className="button danger" type="submit">
              Excluir
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}

function AdminStatus({ status, message }: { status: string; message?: string }) {
  const messages: Record<string, string> = {
    created: "Produto publicado no Supabase.",
    updated: "Produto atualizado.",
    archived: "Produto arquivado e removido do catalogo publico.",
    restored: "Produto restaurado no catalogo publico.",
    deleted: "Produto excluido.",
    invalid: "Preencha nome e preco com valor valido.",
  };

  const text = status === "error" ? `Nao foi possivel concluir.${message ? ` ${message}` : ""}` : messages[status];

  return (
    <div className="messages" role="status">
      <p>{text ?? "Operacao finalizada."}</p>
    </div>
  );
}
