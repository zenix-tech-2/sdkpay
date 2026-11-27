import type { Metadata, Viewport } from "next";
import PwaInstall from "@/components/PwaInstall";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SDK Pay | Paiements en ligne pour l'Afrique",
  description:
    "SDK PAY permet aux créateurs, entrepreneurs et commerçants de vendre leurs produits physiques ou numériques avec un lien de paiement.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: { capable: true, title: "SDK Pay", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#2563eb" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-slate-900 antialiased">{children}
        <PwaInstall />
      </body>
    </html>
  );
}
