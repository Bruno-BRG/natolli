import { cookies } from "next/headers";
import { products as fallbackProducts } from "@/lib/catalog";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export type Product = {
  id: string;
  name: string;
  price: string;
  unitPrice: number;
  image: string;
  description: string;
};

export type AdminProduct = Product & {
  active: boolean;
  createdAt: string;
};

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_cents: number;
  active: boolean;
  created_at?: string;
};

export const localFallbackProducts: Product[] = fallbackProducts.map((product) => ({ ...product }));

export function formatPriceFromCents(priceCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(priceCents / 100);
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    image: row.image_url || "/loja/img/logo-natolli.png",
    price: formatPriceFromCents(row.price_cents),
    unitPrice: row.price_cents / 100,
  };
}

function mapAdminProduct(row: ProductRow): AdminProduct {
  return {
    ...mapProduct(row),
    active: row.active,
    createdAt: row.created_at ?? "",
  };
}

export async function getProducts() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const { data, error } = await supabase
      .from("products")
      .select("id,name,description,image_url,price_cents,active")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .abortSignal(controller.signal);

    if (error) {
      console.error("Failed to load products from Supabase:", error.message);
      return localFallbackProducts;
    }

    if (!data?.length) {
      return localFallbackProducts;
    }

    return data.map(mapProduct);
  } catch (error) {
    console.error("Failed to load products from Supabase:", error);
    return localFallbackProducts;
  } finally {
    clearTimeout(timeout);
  }
}

export async function findProduct(productId: FormDataEntryValue | null) {
  const products = await getProducts();
  return products.find((product) => product.id === productId) ?? products[0];
}

export async function getAdminProducts() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select("id,name,description,image_url,price_cents,active,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load admin products from Supabase:", error.message);
      return localFallbackProducts.map((product) => ({ ...product, active: true, createdAt: "" }));
    }

    return (data ?? []).map(mapAdminProduct);
  } catch (error) {
    console.error("Failed to load admin products:", error);
    return localFallbackProducts.map((product) => ({ ...product, active: true, createdAt: "" }));
  }
}
