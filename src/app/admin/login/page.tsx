"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((d) => {
        if (d.admin) router.replace("/admin");
        if (d.defaultsHint) setHint(true);
      })
      .catch(() => {});
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const r = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (!r.ok) {
        setErr(d.error);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setErr("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#10132e] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#f0a500]">
            <ShieldCheck size={32} className="text-[#10132e]" />
          </span>
          <h1 className="mt-4 text-[26px] font-extrabold text-white">SDK Pay Admin</h1>
          <p className="text-[13.5px] font-medium text-slate-400">Separate secure console · independent session</p>
        </div>
        <form onSubmit={submit} className="mt-6 rounded-3xl bg-white p-6 shadow-2xl">
          {err && (
            <p className="mb-3 rounded-xl bg-red-50 px-3 py-2.5 text-[13px] font-bold text-red-600">{err}</p>
          )}
          {hint && (
            <p className="mb-3 rounded-xl bg-yellow-50 px-3 py-2.5 text-[12px] font-semibold text-yellow-800">
              First run: use <b>admin@sdkpay.com</b> / <b>Admin123!</b> — then set ADMIN_EMAIL /
              ADMIN_PASSWORD env vars.
            </p>
          )}
          <label className="text-[13px] font-extrabold">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="admin@sdkpay.com"
            className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-[14px] font-bold focus:border-yellow-500"
            autoComplete="username"
          />
          <label className="mt-4 block text-[13px] font-extrabold">Password</label>
          <div className="relative mt-1.5">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={show ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-12 text-[14px] font-bold focus:border-yellow-500"
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              {show ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
          <button
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#f0a500] py-3.5 text-[15px] font-extrabold text-white disabled:opacity-60"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-center text-[11.5px] font-medium text-slate-500">
          Deploy target: {process.env.NEXT_PUBLIC_DEPLOY_TARGET || "all"} · SDK Pay v1.7h
        </p>
      </div>
    </div>
  );
}
