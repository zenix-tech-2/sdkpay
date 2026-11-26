"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, IdCard } from "lucide-react";
import { Card, statusPill } from "@/components/admin/ui";

export default function AdminKycDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/kyc/${id}`).then((r) => r.json()).then(setData).catch(() => {});
  }, [id]);

  async function decide(decision: "approve" | "reject") {
    setErr("");
    if (decision === "reject" && !note.trim()) {
      setErr("A note to the user is required when rejecting.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/kyc/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, note }),
      });
      const d = await r.json();
      if (!r.ok) {
        setErr(d.error);
        return;
      }
      router.push("/admin/kyc");
    } finally {
      setBusy(false);
    }
  }

  if (!data?.submission) return <p className="py-16 text-center text-[14px] font-bold text-slate-400">Loading...</p>;
  const s = data.submission;
  const u = data.user ?? {};

  function Doc({ label, url, name }: { label: string; url: string | null; name: string | null }) {
    return (
      <div>
        <p className="mb-1.5 text-[12px] font-medium text-slate-400">{label}</p>
        {url ? (
          <a href={url} target="_blank" className="block overflow-hidden rounded-2xl border border-slate-200">
            <img src={url} alt={label} className="h-44 w-full object-cover" />
          </a>
        ) : (
          <div className="flex h-44 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 text-slate-400">
            <IdCard size={30} />
            <p className="px-4 text-center text-[12px] font-semibold">{name || "No file uploaded"}</p>
            <p className="text-[11px]">Demo upload · filename only</p>
          </div>
        )}
      </div>
    );
  }

  function Row({ label, value, link }: { label: string; value: string; link?: string }) {
    return (
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0">
        <span className="text-[13px] font-medium text-slate-400">{label}</span>
        {link ? (
          <Link href={link} className="text-right text-[13px] font-bold text-sky-600">{value}</Link>
        ) : (
          <span className="text-right text-[13.5px] font-semibold">{value}</span>
        )}
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/kyc" className="flex items-center gap-1 text-[13px] font-bold text-slate-500">
        <ArrowLeft size={16} /> KYC approvals
      </Link>
      <div className="mt-1 flex items-start justify-between gap-2">
        <div>
          <h1 className="text-[24px] font-extrabold">KYC · {u.fullName || "Applicant"}</h1>
          <p className="text-[12.5px] font-medium text-slate-500">
            Submitted {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
          </p>
        </div>
        {statusPill(s.status)}
      </div>

      <Card className="mt-3 grid gap-4 sm:grid-cols-2">
        <Doc label="Front (recto)" url={s.frontUrl} name={s.frontName} />
        <Doc label="Back (verso)" url={s.backUrl} name={s.backName} />
      </Card>

      <Card className="mt-3">
        <p className="text-[14px] font-extrabold">Application</p>
        <p className="mt-1 break-all font-mono text-[11.5px] text-slate-500">{s.id}</p>
      </Card>

      <Card className="mt-3 !py-2">
        <Row label="Applicant" value={u.email || "—"} link={u.id ? `/admin/users/${u.id}` : undefined} />
        <Row label="Document" value={s.idType} />
        <Row label="Document no." value={s.idNumber || "—"} />
        <Row label="Country" value={u.country || "—"} />
        <Row label="Phone" value={u.phone || "—"} />
        <Row
          label="Reviewed"
          value={s.reviewedAt ? new Date(s.reviewedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—"}
        />
      </Card>

      <Card className="mt-3">
        <p className="text-[14px] font-extrabold">Decision</p>
        {err && <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-[12.5px] font-bold text-red-600">{err}</p>}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Note to the user (required when rejecting)"
          className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-[13.5px] font-medium"
        />
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          <button
            onClick={() => decide("approve")}
            disabled={busy}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#f0a500] py-3 text-[14px] font-extrabold text-white disabled:opacity-60"
          >
            <Check size={16} strokeWidth={3} /> Approve
          </button>
          <button
            onClick={() => decide("reject")}
            disabled={busy}
            className="rounded-xl bg-rose-50 py-3 text-[14px] font-extrabold text-rose-600 disabled:opacity-60"
          >
            Reject
          </button>
        </div>
      </Card>
    </div>
  );
}
