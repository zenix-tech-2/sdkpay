import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { db } from "@/db";
import { kycSubmissions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import AdminNav from "./nav";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = { title: "SDK Pay Admin — Compliance console" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(kycSubmissions).where(eq(kycSubmissions.status, "pending"));
  const pending = row?.n ?? 0;

  return (
    <div className="min-h-screen bg-mist" style={{ backgroundImage: "radial-gradient(#d8dbe4 1.1px, transparent 1.1px)", backgroundSize: "22px 22px" }}>
      <div className="fixed inset-x-0 top-0 z-50 h-[3px] bg-gradient-to-r from-sky-400 via-gold to-violet-600" />
      <AdminNav pendingCount={pending} email={user.email} />
      {/* mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/70 bg-white/85 px-4 backdrop-blur-md lg:hidden">
        <span className="flex items-center gap-2 text-[15px] font-black text-[#0E1A38]"><ShieldCheck size={19} className="text-navy3" /> SDK Admin</span>
        <Link href="/dashboard" className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500"><ArrowLeft size={15} /> App</Link>
      </header>
      <div className="lg:pl-[264px]">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
