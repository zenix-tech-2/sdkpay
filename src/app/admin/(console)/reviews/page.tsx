"use client";

import { useEffect, useState } from "react";
import { Star, Trash2, Eye, EyeOff } from "lucide-react";
import { PageTitle, Empty, statusPill, agoShort } from "@/components/admin/ui";

export default function AdminReviews() {
  const [rows, setRows] = useState<any[]>([]);
  const [tab, setTab] = useState("all");
  const [[avg, count], setAgg] = useState([0, 0]);

  async function load() {
    const r = await fetch(`/api/admin/reviews?status=${tab}`);
    const d = await r.json();
    setRows(d.reviews ?? []);
    if (tab === "all" && d.reviews?.length) {
      const sum = d.reviews.reduce((a: number, x: any) => a + x.rating, 0);
      setAgg([sum / d.reviews.length, d.reviews.length]);
    }
  }

  useEffect(() => {
    load();
  }, [tab]);

  async function setStatus(id: string, status: string) {
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
    load();
  }

  function Stars({ n }: { n: number }) {
    return (
      <span className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={13} className={i <= n ? "text-yellow-500" : "text-slate-200"} fill="currentColor" />
        ))}
      </span>
    );
  }

  return (
    <div>
      <PageTitle
        title="Reviews"
        sub={count ? `${avg.toFixed(1)} average · ${count} reviews` : "Merchant feedback moderation"}
      />
      <div className="flex gap-2">
        {["all", "pending", "published", "hidden"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-[11.5px] font-bold capitalize ${tab === t ? "bg-[#10132e] text-white" : "bg-white text-slate-600 shadow-sm"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-3 space-y-2.5">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Stars n={r.rating} />
              <span className="ml-auto">{statusPill(r.status)}</span>
            </div>
            <p className="mt-1.5 text-[12.5px] font-medium">{r.comment || <i className="text-slate-400">No comment</i>}</p>
            <p className="mt-1 text-[10.5px] font-bold text-slate-400">{r.fullName} · {r.email} · {agoShort(r.createdAt)}</p>
            <div className="mt-2.5 flex gap-1.5">
              {r.status !== "published" && (
                <button onClick={() => setStatus(r.id, "published")} className="flex items-center gap-1 rounded-lg bg-green-100 px-3 py-1.5 text-[10.5px] font-extrabold text-green-700">
                  <Eye size={11} /> Publish
                </button>
              )}
              {r.status !== "hidden" && (
                <button onClick={() => setStatus(r.id, "hidden")} className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-[10.5px] font-extrabold text-slate-600">
                  <EyeOff size={11} /> Hide
                </button>
              )}
              <button onClick={() => remove(r.id)} className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-[10.5px] font-extrabold text-red-500">
                <Trash2 size={11} /> Delete
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="rounded-2xl bg-white shadow-sm"><Empty>No reviews.</Empty></div>
        )}
      </div>
    </div>
  );
}
