import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

const statusCopy = {
  sucesso: {
    eyebrow: "Pagamento aprovado",
    title: "Seu pedido foi recebido.",
    body: "A Natolli vai acompanhar os detalhes da encomenda pelo Instagram informado no pedido.",
  },
  pendente: {
    eyebrow: "Pagamento pendente",
    title: "Seu pagamento esta em analise.",
    body: "Assim que o Mercado Pago confirmar, seguimos com seu pedido.",
  },
  falha: {
    eyebrow: "Pagamento nao concluido",
    title: "Nao conseguimos finalizar o pagamento.",
    body: "Voce pode tentar novamente ou falar com a Natolli pelo Instagram.",
  },
} as const;

export default async function PaymentStatus({
  params,
}: {
  params: Promise<{ status: string }>;
}) {
  const { status } = await params;
  const copy = statusCopy[status as keyof typeof statusCopy];

  if (!copy) {
    notFound();
  }

  return (
    <main className="status-page">
      <section className="status-card">
        <Link className="brand" href="/" aria-label="Natolli Studio">
          <Image className="brand-logo" src="/loja/img/logo.jpeg" alt="Natolli Studio" width={132} height={86} priority />
        </Link>

        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.body}</p>

        <Link className="button primary" href="/">
          Voltar para a loja
        </Link>
      </section>
    </main>
  );
}
