"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ShieldCheck } from "lucide-react";
import { approveKyc, rejectKyc } from "@/lib/actions";

export function ApproveButton({ submissionId }: { submissionId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (!confirm("Approve this identity? The account will be fully verified immediately.")) return;
        start(async () => { await approveKyc(submissionId); router.push("/admin/kyc"); });
      }}
      className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-600 py-3.5 text-[15px] font-extrabold text-white shadow transition hover:brightness-105 disabled:opacity-60"
    >
      {pending ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={19} />} Approve &amp; verify
    </button>
  );
}

export function RejectForm({ submissionId }: { submissionId: string }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const quick = ["Photo unreadable or blurry", "Document expired", "Selfie does not match document", "Name mismatch with profile", "Suspected forged document"];
  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/35">Rejection reason</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {quick.map((q) => (
          <button key={q} onClick={() => setReason(q)} className="rounded-full border border-white/10 px-2.5 py-1 text-[10.5px] font-semibold text-white/55 transition hover:border-red-400/50 hover:text-red-300">{q}</button>
        ))}
      </div>
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Explain what the user must fix to resubmit…" className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/[0.05] p-3 text-[13px] font-semibold text-white outline-none placeholder:text-white/25 focus:border-red-400/50" />
      {error && <p className="mt-1.5 rounded-lg bg-red-50 px-3 py-2 text-[11.5px] font-semibold text-red-600">{error}</p>}
      <button
        disabled={pending}
        onClick={() => {
          if (reason.trim().length < 8) { setError("Give the user a clear, actionable reason (min. 8 characters)."); return; }
          start(async () => { await rejectKyc(submissionId, reason); router.push("/admin/kyc"); });
        }}
        className="mt-2 flex h-13 w-full items-center justify-center gap-2 rounded-2xl border border-red-400/40 bg-red-500/10 py-3.5 text-[14px] font-extrabold text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
      >
        {pending ? <Loader2 size={17} className="animate-spin" /> : <XCircle size={18} />} Reject submission
      </button>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-white/30"><ShieldCheck size={12} /> The user is notified and can resubmit after fixing.</p>
    </div>
  );
}
