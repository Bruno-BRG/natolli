import os
from urllib.parse import quote

import mercadopago
from django.contrib import messages
from django.shortcuts import redirect, render
from django.urls import reverse


WHATSAPP_NUMBER = "5571999999999"
MERCADO_PAGO_ACCESS_TOKEN = os.getenv("MERCADO_PAGO_ACCESS_TOKEN", "")

PRODUCTS = [
    {
        "id": "bolsa-bordo",
        "name": "Bolsa artesanal bordô",
        "price": "R$ 189,90",
        "unit_price": 189.90,
        "image": "loja/img/bolsa-bordo.png",
        "description": "Bolsa feita à mão com trama encorpada e alça de madeira.",
    },
    {
        "id": "bolsa-rosa",
        "name": "Bolsa tiracolo rosa bebê",
        "price": "R$ 169,90",
        "unit_price": 169.90,
        "image": "loja/img/bolsa-rosa.png",
        "description": "Modelo compacto com corrente, franja e acabamento delicado.",
    },
    {
        "id": "peca-personalizada",
        "name": "Peça personalizada",
        "price": "R$ 120,00",
        "unit_price": 120.00,
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
            "mercado_pago_enabled": bool(MERCADO_PAGO_ACCESS_TOKEN),
        },
    )


def create_payment(request):
    if request.method != "POST":
        return redirect("loja:home")

    if not MERCADO_PAGO_ACCESS_TOKEN:
        messages.error(
            request,
            "Configure MERCADO_PAGO_ACCESS_TOKEN na Vercel antes de receber pagamentos.",
        )
        return redirect("loja:home")

    selected_product = next(
        (product for product in PRODUCTS if product["id"] == request.POST.get("product")),
        PRODUCTS[0],
    )
    quantity = max(1, int(request.POST.get("quantity") or 1))
    color = request.POST.get("color", "A definir")
    customer_name = request.POST.get("name", "").strip()
    customer_phone = request.POST.get("phone", "").strip()
    notes = request.POST.get("notes", "").strip()

    sdk = mercadopago.SDK(MERCADO_PAGO_ACCESS_TOKEN)
    base_url = os.getenv("SITE_URL", request.build_absolute_uri("/")).rstrip("/")

    preference_data = {
        "items": [
            {
                "title": f"{selected_product['name']} - {color}",
                "quantity": quantity,
                "currency_id": "BRL",
                "unit_price": selected_product["unit_price"],
            }
        ],
        "payer": {
            "name": customer_name,
            "phone": {"number": customer_phone},
        },
        "back_urls": {
            "success": f"{base_url}{reverse('loja:payment_success')}",
            "failure": f"{base_url}{reverse('loja:payment_failure')}",
            "pending": f"{base_url}{reverse('loja:payment_pending')}",
        },
        "auto_return": "approved",
        "statement_descriptor": "NATOLLI",
        "external_reference": f"{selected_product['id']}|{color}|{customer_phone}",
        "metadata": {
            "product": selected_product["name"],
            "color": color,
            "customer_name": customer_name,
            "customer_phone": customer_phone,
            "notes": notes,
        },
    }

    preference_response = sdk.preference.create(preference_data)
    preference = preference_response.get("response", {})
    checkout_url = preference.get("init_point")

    if not checkout_url:
        messages.error(
            request,
            "Não foi possível iniciar o pagamento. Confira as credenciais do Mercado Pago.",
        )
        return redirect("loja:home")

    return redirect(checkout_url)


def payment_success(request):
    return render(request, "loja/payment_status.html", {"status": "approved"})


def payment_pending(request):
    return render(request, "loja/payment_status.html", {"status": "pending"})


def payment_failure(request):
    return render(request, "loja/payment_status.html", {"status": "failure"})
