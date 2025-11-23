import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vestogestao - Gestão de Projetos",
  description: "Sistema de gestão de projetos interno",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}

