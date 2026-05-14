import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Natolli Studio | Pedidos artesanais",
  description: "Bolsas e pecas artesanais sob encomenda em Salvador.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
