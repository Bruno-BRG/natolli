from urllib.parse import quote

from django.shortcuts import render


WHATSAPP_NUMBER = "5571999999999"

PRODUCTS = [
    {
        "id": "bolsa-bordo",
        "name": "Bolsa artesanal bordô",
        "price": "Sob consulta",
        "image": "loja/img/bolsa-bordo.png",
        "description": "Bolsa feita à mão com trama encorpada e alça de madeira.",
    },
    {
        "id": "bolsa-rosa",
        "name": "Bolsa tiracolo rosa bebê",
        "price": "Sob consulta",
        "image": "loja/img/bolsa-rosa.png",
        "description": "Modelo compacto com corrente, franja e acabamento delicado.",
    },
    {
        "id": "peca-personalizada",
        "name": "Peça personalizada",
        "price": "Orçamento",
        "image": "loja/img/logo-natolli.png",
        "description": "Escolha o modelo, a cor da linha e os detalhes do seu pedido.",
    },
]

COLORS = [
    "Marinho",
    "Mostarda",
    "Jeans",
    "Branco",
    "Rosa bebê",
    "Bordô",
    "Azul royal",
    "Verde petróleo",
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
]


def _build_whatsapp_url(order):
    message = (
        "Olá, Natolli! Quero fazer um pedido:%0A"
        f"Produto: {order['product']}%0A"
        f"Cor: {order['color']}%0A"
        f"Quantidade: {order['quantity']}%0A"
        f"Nome: {order['name']}%0A"
        f"Contato: {order['phone']}%0A"
        f"Observações: {order['notes'] or 'Sem observações'}"
    )
    return f"https://wa.me/{WHATSAPP_NUMBER}?text={quote(message, safe='%')}"


def home(request):
    order = None
    whatsapp_url = None

    if request.method == "POST":
        selected_product = next(
            (product for product in PRODUCTS if product["id"] == request.POST.get("product")),
            PRODUCTS[0],
        )
        order = {
            "product": selected_product["name"],
            "color": request.POST.get("color", "A definir"),
            "quantity": request.POST.get("quantity", "1"),
            "name": request.POST.get("name", "").strip(),
            "phone": request.POST.get("phone", "").strip(),
            "notes": request.POST.get("notes", "").strip(),
        }
        whatsapp_url = _build_whatsapp_url(order)

    return render(
        request,
        "loja/home.html",
        {
            "products": PRODUCTS,
            "colors": COLORS,
            "order": order,
            "whatsapp_url": whatsapp_url,
            "whatsapp_number": WHATSAPP_NUMBER,
        },
    )
