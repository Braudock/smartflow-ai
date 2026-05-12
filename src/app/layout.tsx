import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "SmartFlow AI",
  description: "Automacoes com Gemini, Google APIs e Firebase."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
