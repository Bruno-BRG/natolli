import Image from "next/image";
import { redirect } from "next/navigation";
import { signInAdmin } from "@/app/admin/auth-actions";
import { getCurrentAdmin } from "@/lib/admin-auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; message?: string }>;
}) {
  const user = await getCurrentAdmin();

  if (user) {
    redirect("/admin");
  }

  const params = await searchParams;

  return (
    <main className="admin-login-page">
      <form className="admin-login-card" action={signInAdmin}>
        <a className="brand" href="/" aria-label="Natolli Studio">
          <Image className="brand-logo" src="/loja/img/logo.jpeg" alt="Natolli Admin" width={132} height={86} priority />
        </a>

        <div>
          <p className="eyebrow">Acesso restrito</p>
          <h1>Entrar no painel</h1>
        </div>

        {params?.status ? <LoginStatus status={params.status} message={params.message} /> : null}

        <label>
          E-mail
          <input name="email" type="email" placeholder="admin@natolli.com" autoComplete="email" required />
        </label>

        <label>
          Senha
          <input name="password" type="password" placeholder="Sua senha" autoComplete="current-password" required />
        </label>

        <button className="button primary" type="submit">
          Entrar
        </button>
      </form>
    </main>
  );
}

function LoginStatus({ status, message }: { status: string; message?: string }) {
  const text =
    status === "signed-out"
      ? "Voce saiu do painel."
      : status === "invalid"
        ? "Preencha e-mail e senha."
        : status === "unauthorized"
          ? "Este e-mail nao tem permissao para acessar o admin."
          : `Nao foi possivel entrar.${message ? ` ${message}` : ""}`;

  return (
    <div className="messages compact" role="status">
      <p>{text}</p>
    </div>
  );
}
