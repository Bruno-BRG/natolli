import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env.local");

if (existsSync(envPath)) {
  const env = await readFile(envPath, "utf8");
  for (const line of env.split(/\r?\n/)) {
    const match = line.match(/^([^#=\s]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = "product-images";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const files = [
  ["bolsa-bordo-alca-madeira.png", "products/bolsa-bordo-alca-madeira.png", "bolsa-bordo"],
  ["bolsa-rosa-franja.png", "products/bolsa-rosa-franja.png", "bolsa-rosa"],
  ["logo-principal.png", "products/logo-principal.png", "peca-personalizada"],
  ["logo-nome.png", "brand/logo-nome.png", null],
  ["logo-simbolo.png", "brand/logo-simbolo.png", null],
  ["fundo-folhas-direita.png", "brand/fundo-folhas-direita.png", null],
  ["fundo-folhas-esquerda.png", "brand/fundo-folhas-esquerda.png", null],
];

const { error: bucketError } = await supabase.storage.createBucket(bucket, {
  public: true,
  fileSizeLimit: 5 * 1024 * 1024,
  allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
});

if (bucketError && !bucketError.message.toLowerCase().includes("already exists")) {
  throw bucketError;
}

for (const [filename, storagePath, productId] of files) {
  const localPath = path.join(root, "public", "loja", "img", filename);
  const body = await readFile(localPath);
  const contentType = filename.endsWith(".webp") ? "image/webp" : "image/png";
  const { error } = await supabase.storage.from(bucket).upload(storagePath, body, {
    contentType,
    upsert: true,
  });

  if (error) {
    throw error;
  }

  const publicUrl = supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
  console.log(`${filename} -> ${publicUrl}`);

  if (productId) {
    const { error: updateError } = await supabase
      .from("products")
      .update({ image_url: publicUrl })
      .eq("id", productId);

    if (updateError) {
      throw updateError;
    }
  }
}
