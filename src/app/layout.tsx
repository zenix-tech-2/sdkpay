import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./motion.css";

export const metadata: Metadata = {
  title: "SDK Pay | Paiements en ligne pour l'Afrique",
  description: "SDK Pay permet aux créateurs, entrepreneurs et commerçants de vendre en ligne et de recevoir leurs paiements via Mobile Money, cartes bancaires et liens de paiement.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
