import { NextResponse, type NextRequest } from "next/server";
import { attachPaymentPreference, createPendingOrder } from "@/lib/orders";
import { findProduct } from "@/lib/products";

export async function POST(request: NextRequest) {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.redirect(new URL("/?paymentError=missing-token#pedido", request.url), 303);
  }

  const formData = await request.formData();
  const selectedProduct = await findProduct(formData.get("product"));
  const quantity = Math.max(1, Number.parseInt(String(formData.get("quantity") || "1"), 10) || 1);
  const color = String(formData.get("color") || "A definir");
  const customerName = String(formData.get("name") || "").trim();
  const customerContact = String(formData.get("instagram") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  let orderId: string | null = null;

  try {
    orderId = await createPendingOrder({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      color,
      quantity,
      unitPriceCents: Math.round(selectedProduct.unitPrice * 100),
      customerName,
      customerPhone: customerContact,
      notes,
    });
  } catch (error) {
    console.error("Failed to create pending order:", error);
  }

  const baseUrl = process.env.SITE_URL || request.nextUrl.origin;
  const preferenceData = {
    items: [
      {
        title: `${selectedProduct.name} - ${color}`,
        quantity,
        currency_id: "BRL",
        unit_price: selectedProduct.unitPrice,
      },
    ],
    payer: {
      name: customerName,
    },
    back_urls: {
      success: `${baseUrl}/pagamento/sucesso`,
      failure: `${baseUrl}/pagamento/falha`,
      pending: `${baseUrl}/pagamento/pendente`,
    },
    auto_return: "approved",
    statement_descriptor: "NATOLLI",
    external_reference: orderId ?? `${selectedProduct.id}|${color}|${customerContact}`,
    metadata: {
      order_id: orderId,
      product: selectedProduct.name,
      color,
      customer_name: customerName,
      customer_contact: customerContact,
      notes,
    },
  };

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(preferenceData),
  });

  if (!response.ok) {
    return NextResponse.redirect(new URL("/?paymentError=checkout#pedido", request.url), 303);
  }

  const preference = (await response.json()) as { id?: string; init_point?: string };

  if (!preference.init_point) {
    return NextResponse.redirect(new URL("/?paymentError=checkout#pedido", request.url), 303);
  }

  if (orderId && preference.id) {
    try {
      await attachPaymentPreference(orderId, preference.id);
    } catch (error) {
      console.error("Failed to attach payment preference:", error);
    }
  }

  return NextResponse.redirect(preference.init_point, 303);
}
