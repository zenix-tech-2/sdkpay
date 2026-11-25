import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { paymentLinks } from "@/db/schema";
import PayCheckout from "@/components/pay-checkout";
import { ShieldCheck, Link2, AlertTriangle } from "lucide-react";

export const metadata = { title: "Pay securely — SDK Pay" };

export default async function PayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [link] = await db.select().from(paymentLinks).where(eq(paymentLinks.slug, slug)).limit(1);
  const headerList = await headers();
  const host = headerList.get("host") ?? "sdkpay.com";

  const expired = link?.expiresAt && link.expiresAt < new Date();

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundImage: "radial-gradient(#d8dbe4 1.1px, transparent 1.1px)", backgroundSize: "22px 22px", backgroundColor: "#eef0f4" }}>
      {/* top bar */}
      <header className="flex h-14 items-center justify-between border-b border-slate-200/60 bg-white/70 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon.svg" alt="SDK Pay" className="h-7 w-auto" />
          <span className="text-[13px] font-black tracking-tight text-[#0E1A38]">SDK <span className="text-violet-600">Pay</span> <span className="font-semibold text-slate-400">Checkout</span></span>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600"><ShieldCheck size={14} /> Secured</span>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        {!link || !link.active ? (
          <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-xl">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50"><AlertTriangle size={38} className="text-amber-500" /></span>
            <h1 className="mt-4 text-[20px] font-extrabold text-ink">This payment link is unavailable</h1>
            <p className="mt-1.5 text-[13px] text-slate-500">{!link ? "It may have been deleted or the URL is incorrect." : "The merchant deactivated this link. Please contact them directly."}</p>
            <a href="/" className="mt-5 flex h-12 items-center justify-center gap-2 rounded-2xl bg-navy text-[14px] font-bold text-white"><Link2 size={16} /> Go to SDK Pay</a>
          </div>
        ) : expired ? (
          <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-xl">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50"><AlertTriangle size={38} className="text-red-400" /></span>
            <h1 className="mt-4 text-[20px] font-extrabold text-ink">This link has expired</h1>
            <p className="mt-1.5 text-[13px] text-slate-500">The merchant set an expiry on this payment link. Ask them to send you a new one.</p>
            <a href="/" className="mt-5 flex h-12 items-center justify-center gap-2 rounded-2xl bg-navy text-[14px] font-bold text-white">Go to SDK Pay</a>
          </div>
        ) : (
          <PayCheckout
            slug={slug}
            title={link.title}
            description={link.description}
            amount={link.amount === null ? null : Number(link.amount)}
            currency={link.currency}
            redirectUrl={link.redirectUrl}
          />
        )}
      </main>

      <footer className="flex h-12 items-center justify-center border-t border-slate-200/60 text-[11px] text-slate-400">
        © 2026 SDK Pay Inc. · <span className="mx-1.5 hidden sm:inline">Hosted checkout</span> · {host}
      </footer>
    </div>
  );
}
