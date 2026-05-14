"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/utils/supabase/admin";

const PRODUCT_IMAGES_BUCKET = "product-images";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parsePriceToCents(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const price = Number.parseFloat(normalized);

  if (!Number.isFinite(price) || price <= 0) {
    return null;
  }

  return Math.round(price * 100);
}

function getText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function redirectWithError(message: string): never {
  redirect(`/admin?status=error&message=${encodeURIComponent(message)}`);
}

function getClient() {
  try {
    return createAdminClient();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Supabase admin nao configurado.";
    redirectWithError(message);
  }
}

async function ensureProductBucket(supabase: ReturnType<typeof createAdminClient>) {
  const { error } = await supabase.storage.createBucket(PRODUCT_IMAGES_BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
  });

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw error;
  }
}

async function uploadProductImage({
  file,
  productId,
  supabase,
}: {
  file: File | null;
  productId: string;
  supabase: ReturnType<typeof createAdminClient>;
}) {
  if (!file || file.size === 0) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Envie uma imagem PNG, JPG, WEBP ou GIF.");
  }

  await ensureProductBucket(supabase);

  const extension = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `products/${productId}-${Date.now()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    throw error;
  }

  return supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}

function refreshAdmin() {
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const name = getText(formData, "name");
  const description = getText(formData, "description");
  const manualImageUrl = getText(formData, "image_url");
  const priceCents = parsePriceToCents(formData.get("price"));

  if (!name || !priceCents) {
    redirect("/admin?status=invalid");
  }

  const supabase = getClient();
  const productId = slugify(name) || `produto-${Date.now()}`;

  try {
    const uploadedImageUrl = await uploadProductImage({
      file: formData.get("image_file") as File | null,
      productId,
      supabase,
    });

    const { error } = await supabase.from("products").insert({
      id: productId,
      name,
      description,
      image_url: uploadedImageUrl || manualImageUrl || "/loja/img/logo-natolli.png",
      price_cents: priceCents,
      active: true,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel salvar o produto.";
    redirectWithError(message);
  }

  refreshAdmin();
  redirect("/admin?status=created");
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();

  const id = getText(formData, "id");
  const name = getText(formData, "name");
  const description = getText(formData, "description");
  const manualImageUrl = getText(formData, "image_url");
  const priceCents = parsePriceToCents(formData.get("price"));

  if (!id || !name || !priceCents) {
    redirect("/admin?status=invalid");
  }

  const supabase = getClient();

  try {
    const uploadedImageUrl = await uploadProductImage({
      file: formData.get("image_file") as File | null,
      productId: id,
      supabase,
    });

    const update: Record<string, string | number | boolean> = {
      name,
      description,
      price_cents: priceCents,
      active: formData.get("active") === "on",
    };

    if (uploadedImageUrl || manualImageUrl) {
      update.image_url = uploadedImageUrl || manualImageUrl;
    }

    const { error } = await supabase.from("products").update(update).eq("id", id);

    if (error) {
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel atualizar o produto.";
    redirectWithError(message);
  }

  refreshAdmin();
  redirect("/admin?status=updated");
}

export async function toggleProduct(formData: FormData) {
  await requireAdmin();

  const id = getText(formData, "id");
  const active = formData.get("active") === "true";

  if (!id) {
    redirect("/admin?status=invalid");
  }

  const supabase = getClient();
  const { error } = await supabase.from("products").update({ active: !active }).eq("id", id);

  if (error) {
    redirectWithError(error.message);
  }

  refreshAdmin();
  redirect(`/admin?status=${active ? "archived" : "restored"}`);
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();

  const id = getText(formData, "id");

  if (!id) {
    redirect("/admin?status=invalid");
  }

  const supabase = getClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    redirectWithError(error.message);
  }

  refreshAdmin();
  redirect("/admin?status=deleted");
}
