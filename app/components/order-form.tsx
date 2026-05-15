"use client";

import { useState } from "react";
import { colors } from "@/lib/catalog";
import type { Product } from "@/lib/products";

type Order = {
  productId: string;
  color: string;
  quantity: string;
  name: string;
  instagram: string;
  notes: string;
};

function createInitialOrder(products: Product[]): Order {
  return {
    productId: products[0]?.id ?? "",
    color: colors[0],
    quantity: "1",
    name: "",
    instagram: "",
    notes: "",
  };
}

const emptyProduct: Product = {
  id: "",
  name: "Produto",
  price: "R$ 0,00",
  unitPrice: 0,
  image: "/loja/img/logo-natolli.png",
  description: "",
};

export function OrderForm({
  mercadoPagoEnabled,
  products,
}: {
  mercadoPagoEnabled: boolean;
  products: Product[];
}) {
  const [order, setOrder] = useState<Order>(() => createInitialOrder(products));
  const [submitted, setSubmitted] = useState(false);

  const selectedProduct = products.find((product) => product.id === order.productId) ?? products[0] ?? emptyProduct;

  function update<K extends keyof Order>(key: K, value: Order[K]) {
    setOrder((current) => ({ ...current, [key]: value }));
  }

  return (
    <>
      <form
        className="order-form"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <label>
          Produto
          <select
            name="product"
            required
            value={order.productId}
            onChange={(event) => update("productId", event.target.value)}
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Cor da linha
          <select name="color" required value={order.color} onChange={(event) => update("color", event.target.value)}>
            {colors.map((color) => (
              <option key={color}>{color}</option>
            ))}
          </select>
        </label>
        <label>
          Quantidade
          <input
            type="number"
            name="quantity"
            value={order.quantity}
            min="1"
            max="20"
            required
            onChange={(event) => update("quantity", event.target.value)}
          />
        </label>
        <label>
          Seu nome
          <input
            type="text"
            name="name"
            placeholder="Ex.: Maria Silva"
            required
            value={order.name}
            onChange={(event) => update("name", event.target.value)}
          />
        </label>
        <label>
          Instagram
          <input
            type="text"
            name="instagram"
            placeholder="Ex.: @natolli_studio"
            required
            value={order.instagram}
            onChange={(event) => update("instagram", event.target.value)}
          />
        </label>
        <label className="full">
          Observacoes
          <textarea
            name="notes"
            rows={4}
            placeholder="Ex.: quero alca maior, embalagem para presente, prazo desejado..."
            value={order.notes}
            onChange={(event) => update("notes", event.target.value)}
          />
        </label>
        <button className="button primary full" type="submit">
          Revisar pedido
        </button>
      </form>

      {submitted ? (
        <aside className="order-summary" aria-live="polite">
          <h3>Pedido pronto</h3>
          <p>
            <strong>Produto:</strong> {selectedProduct.name}
          </p>
          <p>
            <strong>Cor:</strong> {order.color}
          </p>
          <p>
            <strong>Quantidade:</strong> {order.quantity}
          </p>
          <p>
            <strong>Cliente:</strong> {order.name}
          </p>
          <p>
            <strong>Instagram:</strong> {order.instagram}
          </p>
          {mercadoPagoEnabled ? (
            <form className="payment-form" action="/api/pagamento" method="post">
              <input type="hidden" name="product" value={order.productId} />
              <input type="hidden" name="color" value={order.color} />
              <input type="hidden" name="quantity" value={order.quantity} />
              <input type="hidden" name="name" value={order.name} />
              <input type="hidden" name="instagram" value={order.instagram} />
              <input type="hidden" name="notes" value={order.notes} />
              <button className="button payment-button" type="submit">
                Pagar com Mercado Pago
              </button>
            </form>
          ) : (
            <p className="setup-note">
              Pagamento online pronto no codigo. Falta configurar a variavel MERCADO_PAGO_ACCESS_TOKEN na Vercel.
            </p>
          )}
        </aside>
      ) : null}
    </>
  );
}
