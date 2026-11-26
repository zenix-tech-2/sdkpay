"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Copy,
  Check,
  QrCode,
  Download,
  ExternalLink,
  Pencil,
  Power,
  Trash2,
  Eye,
  BadgeCheck,
  Link2,
  X,
} from "lucide-react";
import QrSheet from "@/components/dashboard/QrSheet";
import { qrDataUrl, downloadDataUrl } from "@/lib/qr";

interface PLink {
  id: string;
  title: string;
  slug: string;
  amount: number | null;
  currency: string;
  description: string | null;
  isActive: boolean;
  views: number;
  totalCollected: number;
  paymentsCount: number;
  imageUrl: string | null;
  pdfUrl: string | null;
  redirectUrl: string | null;
  allowedCountries: string;
  expiresAt: string | null;
  createdAt: string;
}

export default function LinksPage() {
  const [links, setLinks] = useState<PLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrUrl, setQrUrl] = useState("");
  const [copied, setCopied] = useState("");
  const [editing, setEditing] = useState<PLink | null>(null);
  const [editForm, setEditForm] = useState({ title: "", amount: "", description: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    const r = await fetch("/api/links");
    const d = await r.json();
    setLinks(d.links ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function fullUrl(slug: string) {
    return `${window.location.origin}/pay/${slug}`;
  }

  function copy(slug: string) {
    navigator.clipboard.writeText(fullUrl(slug));
    setCopied(slug);
    setTimeout(() => setCopied(""), 1500);
  }

  async function downloadQr(slug: string) {
    const data = await qrDataUrl(fullUrl(slug), 800);
    downloadDataUrl(data, `sdkpay-${slug}-qr.png`);
  }

  async function toggle(l: PLink) {
    await fetch(`/api/links/${l.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !l.isActive }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this payment link?")) return;
    await fetch(`/api/links/${id}`, { method: "DELETE" });
    load();
  }

  function openEdit(l: PLink) {
    setEditing(l);
    setEditForm({
      title: l.title,
      amount: l.amount ? String(l.amount) : "",
      description: l.description ?? "",
    });
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    await fetch(`/api/links/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editForm.title,
        amount: editForm.amount ? Number(editForm.amount) : null,
        description: editForm.description,
      }),
    });
    setSaving(false);
    setEditing(null);
    load();
  }

  return (
    <div>
      <h1 className="text-[30px] font-extrabold tracking-tight text-slate-900">My payment links</h1>

      <Link
        href="/dashboard/links/new"
        className="mt-4 flex items-center justify-center gap-2.5 rounded-[22px] bg-[#f0a500] py-[18px] text-[19px] font-bold text-white shadow-lg hover:bg-[#d89400]"
      >
        <Plus size={22} /> New link
      </Link>

      <p className="mt-6 text-[14px] font-bold tracking-[0.22em] text-slate-500">RECENT LINKS</p>

      {loading && (
        <p className="mt-6 text-center text-[14px] font-bold text-slate-400">Loading...</p>
      )}

      {!loading && links.length === 0 && (
        <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-[30px]">🔗</div>
          <h3 className="mt-4 text-[17px] font-extrabold">No links yet</h3>
          <p className="mt-1 text-[13px] font-medium text-slate-500">Create your first link in 4 simple steps.</p>
          <Link href="/dashboard/links/new" className="mt-4 inline-block rounded-full bg-[#f0a500] px-6 py-3 text-[14px] font-extrabold text-white">
            + New link
          </Link>
        </div>
      )}

      <div className="stagger mt-3 space-y-4">
        {links.map((l) => (
          <div key={l.id} className={`overflow-hidden rounded-[24px] bg-[#26247e] text-white shadow-lg ${!l.isActive ? "opacity-70" : ""}`}>
            <div className="flex items-center gap-3 px-4 pt-4 pb-3.5">
              {l.imageUrl ? (
                <img src={l.imageUrl} alt="" className="h-[52px] w-[52px] shrink-0 rounded-2xl bg-white object-cover" />
              ) : (
                <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-white/10">
                  <Link2 size={26} className="text-white" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[17px] font-medium">{l.title}</p>
                  {l.isActive ? (
                    <BadgeCheck size={19} className="shrink-0 text-green-400" />
                  ) : (
                    <Power size={17} className="shrink-0 text-slate-400" />
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-[14px] text-white/70">
                  <span className="flex items-center gap-1">
                    <Eye size={16} /> {l.views} clicks
                  </span>
                  <span>{l.amount ? `${l.amount.toLocaleString("fr-FR")} ${l.currency}` : "Free amount"}</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[19px] font-bold">{l.totalCollected.toLocaleString("fr-FR")} FCFA</p>
                <p className="text-[14px] text-white/60">{l.paymentsCount} pmt.</p>
              </div>
            </div>

            <div className="flex items-center gap-1 border-t border-white/15 px-4 py-3">
              <span className="max-w-[92px] truncate text-[16px] text-white/60">/pay/{l.slug}</span>
              <div className="ml-auto flex items-center gap-[15px]">
                <button onClick={() => copy(l.slug)} title="Copy link" className="text-white/90 hover:text-white">
                  {copied === l.slug ? <Check size={21} className="text-green-400" /> : <Copy size={21} />}
                </button>
                <button onClick={() => setQrUrl(fullUrl(l.slug))} title="QR code" className="text-white/90 hover:text-white">
                  <QrCode size={21} />
                </button>
                <button onClick={() => downloadQr(l.slug)} title="Download QR" className="text-white/90 hover:text-white">
                  <Download size={21} />
                </button>
                <a href={`/pay/${l.slug}`} target="_blank" title="Open link" className="text-white/90 hover:text-white">
                  <ExternalLink size={21} />
                </a>
                <button onClick={() => openEdit(l)} title="Edit" className="text-white/90 hover:text-white">
                  <Pencil size={20} />
                </button>
                <button onClick={() => toggle(l)} title={l.isActive ? "Disable" : "Enable"} className="text-orange-400 hover:text-orange-300">
                  <Power size={21} />
                </button>
                <button onClick={() => remove(l.id)} title="Delete" className="text-red-500 hover:text-red-400">
                  <Trash2 size={21} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {qrUrl && <QrSheet url={qrUrl} onClose={() => setQrUrl("")} />}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditing(null)} />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6">
            <button onClick={() => setEditing(null)} className="absolute right-4 top-4 text-slate-400">
              <X size={20} />
            </button>
            <h3 className="text-[19px] font-extrabold">Edit link</h3>
            <div className="mt-4 space-y-3">
              <input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Title"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[14px] font-bold focus:border-yellow-500"
              />
              <input
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                type="number"
                min={100}
                placeholder="Amount (empty = free)"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[14px] font-bold focus:border-yellow-500"
              />
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Description"
                rows={3}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[14px] font-medium focus:border-yellow-500"
              />
              <button
                onClick={saveEdit}
                disabled={saving}
                className="w-full rounded-full bg-[#f0a500] py-3.5 text-[14.5px] font-extrabold text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
