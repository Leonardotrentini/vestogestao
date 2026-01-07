import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/common/ToastProvider";

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
      <body className="antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}










