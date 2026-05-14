import Image from "next/image";
import {
  createProduct,
  deleteProduct,
  toggleProduct,
  updateProduct,
} from "@/app/admin/actions";
import { signOutAdmin } from "@/app/admin/auth-actions";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminOrders, type AdminOrder } from "@/lib/orders";
import { formatPriceFromCents, getAdminProducts, type AdminProduct } from "@/lib/products";

function priceInputValue(product: AdminProduct) {
  return product.unitPrice.toFixed(2).replace(".", ",");
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
  const orderRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <main className="admin-page">
      <section className="admin-header">
        <a className="brand" href="/" aria-label="Voltar para Natolli Studio">
          <span className="brand-mark">N</span>
          <span>
            <strong>Natolli</strong>
            <small>Admin</small>
          </span>
        </a>
        <div>
          <p className="eyebrow">Painel administrativo</p>
          <h1>Produtos</h1>
          <p className="admin-user">Conectado como {user.email}</p>
        </div>
        <form action={signOutAdmin}>
          <button className="button secondary" type="submit">
            Sair
          </button>
        </form>
      </section>

      {params?.status ? <AdminStatus status={params.status} message={params.message} /> : null}

      <section className="admin-stats" aria-label="Resumo do catalogo">
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
          <span>{pendingOrders.length}</span>
          <p>Pedidos pendentes</p>
        </div>
        <div>
          <span>{formatPriceFromCents(Math.round(orderRevenue * 100))}</span>
          <p>Total registrado</p>
        </div>
      </section>

      <section className="admin-orders">
        <div className="section-heading">
          <p className="eyebrow">Compras</p>
          <h2>Historico de pedidos</h2>
        </div>
        <OrderHistory orders={orders} />
      </section>

      <section className="admin-layout">
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
        <p>Quando o cliente iniciar um pagamento pelo site, o pedido aparece aqui como pendente.</p>
      </div>
    );
  }

  return (
    <div className="admin-order-table" role="table" aria-label="Historico de pedidos">
      <div className="admin-order-row heading" role="row">
        <span>Data</span>
        <span>Cliente</span>
        <span>Produto</span>
        <span>Status</span>
        <span>Total</span>
      </div>
      {orders.map((order) => (
        <article className="admin-order-row" role="row" key={order.id}>
          <span>{new Date(order.createdAt).toLocaleDateString("pt-BR")}</span>
          <span>
            <strong>{order.customerName || "Sem nome"}</strong>
            <small>{order.customerPhone || "Sem telefone"}</small>
          </span>
          <span>
            <strong>{order.productName}</strong>
            <small>
              {order.quantity} un. - {order.color}
            </small>
            {order.notes ? <small>{order.notes}</small> : null}
          </span>
          <span>
            <mark>{order.status}</mark>
            <small>{order.paymentProvider}</small>
          </span>
          <span>{formatPriceFromCents(Math.round(order.total * 100))}</span>
        </article>
      ))}
    </div>
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
