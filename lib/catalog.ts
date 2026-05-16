export const products = [
  {
    id: "bolsa-bordo",
    name: "Bolsa artesanal bordo",
    price: "R$ 189,90",
    unitPrice: 189.9,
    image: "/loja/img/bolsa-bordo-alca-madeira.png",
    description: "Bolsa feita a mao com trama encorpada e alca de madeira.",
  },
  {
    id: "bolsa-rosa",
    name: "Bolsa tiracolo rosa bebe",
    price: "R$ 169,90",
    unitPrice: 169.9,
    image: "/loja/img/bolsa-rosa-franja.png",
    description: "Modelo compacto com corrente, franja e acabamento delicado.",
  },
  {
    id: "peca-personalizada",
    name: "Peca personalizada",
    price: "R$ 120,00",
    unitPrice: 120,
    image: "/loja/img/logo-principal.png",
    description: "Escolha o modelo, a cor da linha e os detalhes do seu pedido.",
  },
] as const;

export const colorOptions = [
  { name: "Marinho", image: "/loja/img/linha-marinho.png" },
  { name: "Mostarda", image: "/loja/img/linha-mostarda.png" },
  { name: "Jeans", image: "/loja/img/linha-jeans.png" },
  { name: "Branco", image: "/loja/img/linha-branco.png" },
  { name: "Rosa bebe", image: "/loja/img/linha-rosa-bebe.png" },
  { name: "Bordo", image: "/loja/img/linha-bordo.png" },
  { name: "Azul royal", image: "/loja/img/linha-azul-royal.png" },
  { name: "Verde petroleo", image: "/loja/img/linha-verde-petroleo.png" },
  { name: "Preto", image: "/loja/img/linha-preto.png" },
  { name: "Vermelho", image: "/loja/img/linha-vermelho.png" },
  { name: "Vinho", image: "/loja/img/linha-vinho.png" },
  { name: "Bege", image: "/loja/img/linha-bege.png" },
  { name: "Marrom escuro", image: "/loja/img/linha-marrom-escuro.png" },
  { name: "Amarelo", image: "/loja/img/linha-amarelo.png" },
  { name: "Cinza claro", image: "/loja/img/linha-cinza-claro.png" },
  { name: "Cinza escuro", image: "/loja/img/linha-cinza-escuro.png" },
  { name: "Ciano", image: "/loja/img/linha-ciano.png" },
  { name: "Verde musgo", image: "/loja/img/linha-verde-musgo.png" },
] as const;

export const colors = colorOptions.map((color) => color.name);
