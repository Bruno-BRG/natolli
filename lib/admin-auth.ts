import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export function isAdminEmail(email?: string | null) {
  const allowedEmails = process.env.ADMIN_EMAILS?.split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (!allowedEmails?.length) {
    return true;
  }

  return Boolean(email && allowedEmails.includes(email.toLowerCase()));
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

  if (!isAdminEmail(user.email)) {
    redirect("/admin/login?status=unauthorized");
  }

  return user;
}
