export const WHATSAPP_NUMBER = "5571999999999";

export const products = [
  {
    id: "bolsa-bordo",
    name: "Bolsa artesanal bordo",
    price: "R$ 189,90",
    unitPrice: 189.9,
    image: "/loja/img/bolsa-bordo.png",
    description: "Bolsa feita a mao com trama encorpada e alca de madeira.",
  },
  {
    id: "bolsa-rosa",
    name: "Bolsa tiracolo rosa bebe",
    price: "R$ 169,90",
    unitPrice: 169.9,
    image: "/loja/img/bolsa-rosa.png",
    description: "Modelo compacto com corrente, franja e acabamento delicado.",
  },
  {
    id: "peca-personalizada",
    name: "Peca personalizada",
    price: "R$ 120,00",
    unitPrice: 120,
    image: "/loja/img/logo-natolli.png",
    description: "Escolha o modelo, a cor da linha e os detalhes do seu pedido.",
  },
] as const;

export const colors = [
  "Marinho",
  "Mostarda",
  "Jeans",
  "Branco",
  "Rosa bebe",
  "Bordo",
  "Azul royal",
  "Verde petroleo",
  "Preto",
  "Vermelho",
  "Vinho",
  "Bege",
  "Marrom escuro",
  "Amarelo",
  "Cinza claro",
  "Cinza escuro",
  "Ciano",
  "Verde musgo",
] as const;

export function buildWhatsAppUrl(order: {
  product: string;
  color: string;
  quantity: string;
  name: string;
  phone: string;
  notes: string;
}) {
  const message = [
    "Ola, Natolli! Quero fazer um pedido:",
    `Produto: ${order.product}`,
    `Cor: ${order.color}`,
    `Quantidade: ${order.quantity}`,
    `Nome: ${order.name}`,
    `Contato: ${order.phone}`,
    `Observacoes: ${order.notes || "Sem observacoes"}`,
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
