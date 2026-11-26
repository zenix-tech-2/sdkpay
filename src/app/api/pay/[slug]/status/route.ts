import { NextResponse } from "next/server";
import { db } from "@/db";
import { paymentLinks, transactions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { queryProviderStatus } from "@/lib/providers/router";
import { settleTxFromProvider } from "@/lib/providers/settle";
import { demoEnabled } from "@/lib/providers/types";

const EXPIRY_MS = 8 * 60 * 1000;
const DEMO_APPROVE_MS = 15 * 1000;

/** Public poll for a payment-link checkout: GET /api/pay/:slug/status?ref=SDK-P-... */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ref = new URL(req.url).searchParams.get("ref");
  if (!ref) return NextResponse.json({ error: "Missing ref" }, { status: 400 });

  const links = await db.select().from(paymentLinks).where(eq(paymentLinks.slug, slug)).limit(1);
  if (!links.length) return NextResponse.json({ error: "Lien introuvable." }, { status: 404 });
  const link = links[0];
  const rows = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.reference, ref), eq(transactions.paymentLinkId, link.id)))
    .limit(1);
  if (!rows.length) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  let tx = rows[0];

  if (tx.status === "pending") {
    const live = (tx.provider === "ashtechpay" || tx.provider === "saaspay") && tx.providerRef && !tx.providerRef.includes("DEMO");
    if (live) {
      const s = await queryProviderStatus(tx.provider as "ashtechpay" | "saaspay", tx.providerRef!);
      if (s.status !== "pending") {
        const settled = await settleTxFromProvider({
          providerRef: tx.providerRef!,
          reference: tx.reference,
          status: s.status,
          provider: tx.provider === "ashtechpay" ? "AshTechPay" : "SasPay",
        });
        if (settled) tx = settled as typeof tx;
      }
    } else if (demoEnabled() && tx.provider === "demo" && Date.now() - new Date(tx.createdAt).getTime() > DEMO_APPROVE_MS) {
      const settled = await settleTxFromProvider({ reference: tx.reference, status: "success", provider: "Demo" });
      if (settled) tx = settled as typeof tx;
    }
    if (tx.status === "pending" && Date.now() - new Date(tx.createdAt).getTime() > EXPIRY_MS) {
      await db
        .update(transactions)
        .set({ status: "failed", updatedAt: new Date() })
        .where(and(eq(transactions.id, tx.id), eq(transactions.status, "pending")));
      tx = { ...tx, status: "failed" };
    }
  }

  return NextResponse.json({
    status: tx.status,
    reference: tx.reference,
    amount: tx.amount,
    ...(tx.status === "success" ? { pdfUrl: link.pdfUrl, redirectUrl: link.redirectUrl } : {}),
  });
}
