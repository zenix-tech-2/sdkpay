"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Lock } from "lucide-react";
import { PageTitle, Card } from "@/components/admin/ui";

const FIELDS = [
  { key: "momo_fee", label: "Mobile Money fee rate", hint: "0.04 = 4% on deposits, withdrawals, transfers, collections", type: "rate" },
  { key: "crypto_deposit_fee", label: "Crypto deposit fee rate", hint: "0.025 = 2.5% on USDT deposits", type: "rate" },
  { key: "crypto_flat_fee_usdt", label: "Crypto withdrawal flat fee (USDT)", hint: "Flat fee per USDT withdrawal / transfer", type: "number" },
  { key: "min_deposit", label: "Min. Mobile Money deposit", hint: "FCFA", type: "number" },
  { key: "min_withdraw", label: "Min. withdrawal", hint: "FCFA", type: "number" },
  { key: "max_withdraw", label: "Max. withdrawal", hint: "FCFA per transaction", type: "number" },
  { key: "min_crypto_deposit", label: "Min. crypto deposit (USDT)", hint: "USDT", type: "number" },
  { key: "max_crypto_withdraw", label: "Max. crypto withdrawal (USDT)", hint: "USDT per transaction", type: "number" },
];

export default function AdminSettings() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => {
        if (r.status === 401) return null;
        return r.json();
      })
      .then((d) => d && setValues(d.settings ?? {}))
      .catch(() => {});
  }, []);

  async function save() {
    setMsg("");
    setSaving(true);
    try {
      const r = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const d = await r.json();
      if (r.status === 403) {
        setForbidden(true);
        return;
      }
      if (!r.ok) {
        setMsg(d.error);
        return;
      }
      setMsg("Settings saved. Applies immediately to new transactions.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageTitle title="Platform settings" sub="Fees, limits and payout mode — live immediately" />
      {forbidden ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <Lock size={25.2} className="mx-auto text-slate-300" />
          <p className="mt-3 text-[12.5px] font-extrabold">Super admin only</p>
          <p className="text-[10.5px] font-medium text-slate-500">Only super admins can change platform settings.</p>
        </div>
      ) : (
        <>
          <Card>
            <div className="space-y-4">
              {FIELDS.map((f) => (
                <div key={f.key} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11.5px] font-extrabold">{f.label}</p>
                    <p className="text-[10px] font-medium text-slate-400">{f.hint}</p>
                  </div>
                  <input
                    value={values[f.key] ?? ""}
                    onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                    inputMode="decimal"
                    className="w-32 shrink-0 rounded-2xl border border-slate-200 px-4 py-2.5 text-right font-mono text-[11px] font-bold"
                  />
                </div>
              ))}
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] font-extrabold">Manual withdrawals</p>
                  <p className="text-[10px] font-medium text-slate-400">Hold MoMo withdrawals for admin approval</p>
                </div>
                <button
                  onClick={() => setValues({ ...values, manual_withdrawals: values.manual_withdrawals === "true" ? "false" : "true" })}
                  className={`relative h-[27px] w-[49px] shrink-0 rounded-full transition ${values.manual_withdrawals === "true" ? "bg-[#f0a500]" : "bg-slate-200"}`}
                >
                  <span className={`absolute top-[4px] h-[20.5px] w-[20.5px] rounded-full bg-white shadow transition-all ${values.manual_withdrawals === "true" ? "right-[4px]" : "left-[4px]"}`} />
                </button>
              </div>
            </div>
            {msg && <p className={`mt-3 rounded-xl px-3 py-2 text-[10px] font-bold ${msg.includes("saved") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{msg}</p>}
            <button
              onClick={save}
              disabled={saving}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#f0a500] py-3.5 text-[11.5px] font-extrabold text-white disabled:opacity-60"
            >
              {saving ? <Loader2 size={13.5} className="animate-spin" /> : <Save size={13.5} />}
              Save settings
            </button>
          </Card>
          <p className="mt-3 rounded-2xl bg-yellow-50 px-4 py-3 text-[10px] font-semibold text-yellow-800">
            Referral reduced-fee periods still halve the configured Mobile Money rate. Provider keys stay in
            environment variables — never in the database.
          </p>
        </>
      )}
    </div>
  );
}
