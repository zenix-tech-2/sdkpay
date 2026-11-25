import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { db } from "@/db";
import { kycSubmissions, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import AdminNav from "./nav";
import { ArrowLeft, ShieldCheck, LogOut } from "lucide-react";
import { logout } from "@/lib/actions";

export const metadata = { title: "SDK Pay Admin — Control plane" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const [[kyc], [sus]] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(kycSubmissions).where(eq(kycSubmissions.status, "pending")),
    db.select({ n: sql<number>`count(*)::int` }).from(users).where(eq(users.status, "suspended")),
  ]);

  return (
    <div className="min-h-screen bg-[#0A0F2C] text-white" style={{ backgroundImage: "radial-gradient(60rem 40rem at 20% -10%, rgba(46,107,235,0.14), transparent 60%), radial-gradient(50rem 35rem at 90% 110%, rgba(255,189,13,0.07), transparent 60%)" }}>
      <div className="fixed inset-x-0 top-0 z-50 h-[3px] bg-gradient-to-r from-[#FFBD0D] via-violet-500 to-sky-400" />
      <AdminNav pendingCount={kyc?.n ?? 0} email={user.email} suspendedCount={sus?.n ?? 0} />

      {/* mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/5 bg-[#0E1434]/90 px-4 backdrop-blur-md lg:hidden">
        <span className="flex items-center gap-2 text-[15px] font-black text-white"><ShieldCheck size={19} className="text-[#FFBD0D]" /> SDK <span className="text-[#FFBD0D]">Admin</span></span>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" aria-label="Back to app" className="rounded-lg border border-white/10 p-2 text-white/70"><ArrowLeft size={17} /></Link>
          <form action={logout}><button type="submit" aria-label="Log out" className="rounded-lg border border-white/10 p-2 text-red-400"><LogOut size={17} /></button></form>
        </div>
      </header>

      <div className="lg:pl-[272px]">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
