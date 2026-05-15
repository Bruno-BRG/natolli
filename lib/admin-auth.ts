import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

const defaultAdminUserIds = ["a52301a0-eaca-4e2e-ba35-97a779b92f49"];

function getAllowedAdminUserIds() {
  const configuredIds = process.env.ADMIN_USER_IDS?.split(",") ?? [];

  return [...defaultAdminUserIds, ...configuredIds]
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
  const allowedEmails = process.env.ADMIN_EMAILS?.split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (!allowedEmails?.length) {
    return true;
  }

  return Boolean(email && allowedEmails.includes(email.toLowerCase()));
}

export function isAdminUser(user?: { id?: string | null; email?: string | null } | null) {
  const allowedUserIds = getAllowedAdminUserIds();

  if (user?.id && allowedUserIds.includes(user.id.toLowerCase())) {
    return true;
  }

  return isAdminEmail(user?.email);
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireAdmin() {
  const user = await getCurrentAdmin();

  if (!user) {
    redirect("/admin/login");
  }

  if (!isAdminUser(user)) {
    redirect("/admin/login?status=unauthorized");
  }

  return user;
}
