import { createAdminClient } from "@/utils/supabase/admin";

export type AdminOrder = {
  id: string;
  productId: string | null;
  productName: string;
  color: string;
  quantity: number;
  unitPrice: number;
  total: number;
  customerName: string;
  customerPhone: string;
  notes: string;
  status: string;
  orderSource: string;
  paymentProvider: string;
  paymentPreferenceId: string | null;
  createdAt: string;
};

type OrderRow = {
  id: string;
  product_id: string | null;
  product_name: string;
  color: string;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
  customer_name: string;
  customer_phone: string;
  notes: string | null;
  status: string;
  order_source: string | null;
  payment_provider: string;
  payment_preference_id: string | null;
  created_at: string;
};

function mapOrder(row: OrderRow): AdminOrder {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    color: row.color,
    quantity: row.quantity,
    unitPrice: row.unit_price_cents / 100,
    total: row.total_cents / 100,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    notes: row.notes ?? "",
    status: row.status,
    orderSource: row.order_source ?? "site",
    paymentProvider: row.payment_provider,
    paymentPreferenceId: row.payment_preference_id,
    createdAt: row.created_at,
  };
}

export async function getAdminOrders() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id,product_id,product_name,color,quantity,unit_price_cents,total_cents,customer_name,customer_phone,notes,status,order_source,payment_provider,payment_preference_id,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Failed to load orders:", error.message);
      return [];
    }

    return (data ?? []).map(mapOrder);
  } catch (error) {
    console.error("Failed to load admin orders:", error);
    return [];
  }
}

export async function createPendingOrder(order: {
  productId: string;
  productName: string;
  color: string;
  quantity: number;
  unitPriceCents: number;
  customerName: string;
  customerPhone: string;
  notes: string;
}) {
  const supabase = createAdminClient();
  const totalCents = order.unitPriceCents * order.quantity;
  const { data, error } = await supabase
    .from("orders")
    .insert({
      product_id: order.productId,
      product_name: order.productName,
      color: order.color,
      quantity: order.quantity,
      unit_price_cents: order.unitPriceCents,
      total_cents: totalCents,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      notes: order.notes,
      status: "pending",
      order_source: "site",
      payment_provider: "mercado_pago",
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id as string;
}

export async function createManualOrder(order: {
  productId: string | null;
  productName: string;
  color: string;
  quantity: number;
  unitPriceCents: number;
  customerName: string;
  customerContact: string;
  notes: string;
  status: string;
}) {
  const supabase = createAdminClient();
  const totalCents = order.unitPriceCents * order.quantity;
  const { error } = await supabase.from("orders").insert({
    product_id: order.productId,
    product_name: order.productName,
    color: order.color,
    quantity: order.quantity,
    unit_price_cents: order.unitPriceCents,
    total_cents: totalCents,
    customer_name: order.customerName,
    customer_phone: order.customerContact,
    notes: order.notes,
    status: order.status,
    order_source: "manual",
    payment_provider: "manual",
  });

  if (error) {
    throw error;
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);

  if (error) {
    throw error;
  }
}

export async function attachPaymentPreference(orderId: string, preferenceId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({ payment_preference_id: preferenceId })
    .eq("id", orderId);

  if (error) {
    throw error;
  }
}
