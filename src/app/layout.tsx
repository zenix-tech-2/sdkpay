import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SDK Pay — Integrate · Pay · Grow",
  description:
    "SDK Pay is the payment infrastructure for African businesses: Mobile Money, crypto, payment links, payouts and a developer-first API.",
  icons: { icon: "/logo-icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#f6c21a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
