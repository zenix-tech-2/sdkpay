"use client";

import { useEffect, useState } from "react";
import { Plus, X, ShieldCheck } from "lucide-react";
import { PageTitle, Th, Td, Empty, Pill, agoShort } from "@/components/admin/ui";

export default function AdminTeam() {
  const [rows, setRows] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "support" });
  const [err, setErr] = useState("");
  const [forbidden, setForbidden] = useState(false);

  async function load() {
    const r = await fetch("/api/admin/admins");
    if (r.status === 403) {
      setForbidden(true);
      return;
    }
    const d = await r.json();
    setRows(d.admins ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    setErr("");
    const r = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    if (!r.ok) {
      setErr(d.error);
      return;
    }
    setModal(false);
    setForm({ name: "", email: "", password: "", role: "support" });
    load();
  }

  async function toggle(a: any) {
    const r = await fetch("/api/admin/admins", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: a.id, isActive: !a.isActive }),
    });
    if (!r.ok) {
      const d = await r.json();
      alert(d.error);
      return;
    }
    load();
  }

  if (forbidden) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <ShieldCheck size={28.8} className="mx-auto text-slate-300" />
        <p className="mt-3 text-[12.5px] font-extrabold">Super admin only</p>
        <p className="text-[10.5px] font-medium text-slate-500">Ask a super admin to manage the team.</p>
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="Team"
        sub="Admin accounts and roles"
        right={
          <button onClick={() => setModal(true)} className="flex items-center gap-1.5 rounded-full bg-[#f0a500] px-4 py-2.5 text-[11px] font-extrabold text-white">
            <Plus size={12.6} /> New admin
          </button>
        }
      />
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[620px]">
          <thead>
            <tr className="border-b border-slate-100">
              <Th>Admin</Th><Th>Role</Th><Th>Status</Th><Th>Last login</Th><Th right> </Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-b border-slate-50 last:border-0">
                <Td>
                  <span className="block font-bold">{a.name}</span>
                  <span className="block text-[10px] text-slate-400">{a.email}</span>
                </Td>
                <Td><Pill color={a.role === "super" ? "yellow" : "blue"}>{a.role}</Pill></Td>
                <Td><Pill color={a.isActive ? "green" : "red"}>{a.isActive ? "Active" : "Disabled"}</Pill></Td>
                <Td>{a.lastLoginAt ? agoShort(a.lastLoginAt) : "Never"}</Td>
                <Td right>
                  <button
                    onClick={() => toggle(a)}
                    className={`rounded-lg px-3 py-1.5 text-[10px] font-extrabold ${a.isActive ? "bg-red-50 text-red-500" : "bg-green-100 text-green-700"}`}
                  >
                    {a.isActive ? "Disable" : "Enable"}
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <Empty>No admins.</Empty>}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal(false)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6">
            <button onClick={() => setModal(false)} className="absolute right-4 top-4 text-slate-400"><X size={16.2} /></button>
            <h3 className="text-[15px] font-extrabold">New admin</h3>
            {err && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-[10px] font-bold text-red-600">{err}</p>}
            <div className="mt-4 space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[11px] font-bold" />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[11px] font-bold" />
              <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password (min. 8)" type="password" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[11px] font-bold" />
              <div className="grid grid-cols-2 gap-2">
                {(["support", "super"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setForm({ ...form, role: r })}
                    className={`rounded-2xl border-2 py-2.5 text-[11px] font-extrabold capitalize ${form.role === r ? "border-yellow-400 bg-yellow-50" : "border-slate-200 text-slate-400"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <button onClick={create} className="w-full rounded-full bg-[#f0a500] py-3.5 text-[11.5px] font-extrabold text-white">
                Create admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
