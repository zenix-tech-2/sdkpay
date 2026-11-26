"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Megaphone } from "lucide-react";
import { PageTitle, Empty, Pill, agoShort } from "@/components/admin/ui";

interface Ann {
  id: string;
  title: string;
  body: string;
  bullets: string | null;
  mediaUrl: string | null;
  status: string;
  createdAt: string;
}

export default function AdminUpdates() {
  const [rows, setRows] = useState<Ann[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Ann | null>(null);
  const [form, setForm] = useState({ title: "", body: "", bullets: "", mediaUrl: "", status: "draft" });

  async function load() {
    const r = await fetch("/api/admin/announcements");
    const d = await r.json();
    setRows(d.announcements ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setEditing(null);
    setForm({ title: "", body: "", bullets: "", mediaUrl: "", status: "draft" });
    setModal(true);
  }

  function openEdit(a: Ann) {
    setEditing(a);
    let bullets = "";
    try {
      bullets = a.bullets ? JSON.parse(a.bullets).join("\n") : "";
    } catch { /* ignore */ }
    setForm({ title: a.title, body: a.body, bullets, mediaUrl: a.mediaUrl || "", status: a.status });
    setModal(true);
  }

  async function save() {
    const payload = {
      ...form,
      bullets: form.bullets.split("\n").map((s) => s.trim()).filter(Boolean),
    };
    if (editing) {
      await fetch("/api/admin/announcements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...payload }),
      });
    } else {
      await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setModal(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this announcement?")) return;
    await fetch(`/api/admin/announcements?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <PageTitle
        title="Updates & media"
        sub="Announcements published to the merchant Updates page"
        right={
          <button onClick={openNew} className="flex items-center gap-1.5 rounded-full bg-[#f0a500] px-4 py-2.5 text-[11px] font-extrabold text-white">
            <Plus size={12.6} /> New
          </button>
        }
      />
      <div className="space-y-3">
        {rows.map((a) => (
          <div key={a.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              {a.mediaUrl ? (
                <img src={a.mediaUrl} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-500">
                  <Megaphone size={17.1} />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-extrabold">{a.title}</p>
                <p className="line-clamp-2 text-[10.5px] font-medium text-slate-500">{a.body}</p>
                <p className="mt-1.5 flex items-center gap-2 text-[10px] font-semibold text-slate-400">
                  <Pill color={a.status === "published" ? "green" : a.status === "archived" ? "gray" : "yellow"}>{a.status}</Pill>
                  {agoShort(a.createdAt)}
                </p>
              </div>
              <span className="flex shrink-0 gap-1.5">
                <button onClick={() => openEdit(a)} className="rounded-lg bg-slate-100 p-2 text-slate-600" title="Edit">
                  <Pencil size={11.7} />
                </button>
                <button onClick={() => remove(a.id)} className="rounded-lg bg-red-50 p-2 text-red-500" title="Delete">
                  <Trash2 size={11.7} />
                </button>
              </span>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="rounded-2xl bg-white shadow-sm"><Empty>No announcements yet. Publish the first one!</Empty></div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal(false)} />
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6">
            <button onClick={() => setModal(false)} className="absolute right-4 top-4 text-slate-400"><X size={16.2} /></button>
            <h3 className="text-[15px] font-extrabold">{editing ? "Edit announcement" : "New announcement"}</h3>
            <div className="mt-4 space-y-3">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[11px] font-bold" />
              <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Body" rows={3} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[11px] font-medium" />
              <textarea value={form.bullets} onChange={(e) => setForm({ ...form, bullets: e.target.value })} placeholder={"Bullets (one per line, optional)"} rows={3} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[11px] font-medium" />
              <input value={form.mediaUrl} onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })} placeholder="Media URL (optional)" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[10.5px] font-mono" />
              <div className="grid grid-cols-3 gap-2">
                {(["draft", "published", "archived"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setForm({ ...form, status: s })}
                    className={`rounded-2xl border-2 py-2.5 text-[10.5px] font-extrabold capitalize ${form.status === s ? "border-yellow-400 bg-yellow-50" : "border-slate-200 text-slate-400"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button onClick={save} className="w-full rounded-full bg-[#f0a500] py-3.5 text-[11.5px] font-extrabold text-white">
                {editing ? "Save changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
