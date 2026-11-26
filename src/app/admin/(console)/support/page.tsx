"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { PageTitle, Th, Td, Empty, statusPill, agoShort } from "@/components/admin/ui";

export default function AdminSupport() {
  const [rows, setRows] = useState<any[]>([]);
  const [tab, setTab] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [thread, setThread] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  async function load() {
    const r = await fetch(`/api/admin/tickets?status=${tab}`);
    const d = await r.json();
    setRows(d.tickets ?? []);
  }

  useEffect(() => {
    load();
  }, [tab]);

  async function open(id: string) {
    setOpenId(id);
    const r = await fetch(`/api/admin/tickets?id=${id}`);
    setThread(await r.json());
  }

  async function sendReply() {
    if (!reply.trim() || !openId) return;
    setSending(true);
    await fetch("/api/admin/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId: openId, message: reply }),
    });
    setReply("");
    setSending(false);
    open(openId);
    load();
  }

  async function setStatus(status: string) {
    if (!openId) return;
    await fetch("/api/admin/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: openId, status }),
    });
    open(openId);
    load();
  }

  if (openId && thread?.ticket) {
    const t = thread.ticket;
    return (
      <div>
        <button onClick={() => { setOpenId(null); setThread(null); }} className="flex items-center gap-1 text-[11.5px] font-bold text-slate-500">
          <ArrowLeft size={14} /> Tickets
        </button>
        <div className="mt-2 flex items-start justify-between gap-2">
          <div>
            <h1 className="text-[17.5px] font-extrabold">{t.subject}</h1>
            <p className="text-[11px] font-medium text-slate-500">{thread.user?.email} · {t.category} · {agoShort(t.createdAt)}</p>
          </div>
          {statusPill(t.status)}
        </div>
        <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-[12.5px] font-medium leading-relaxed">{t.message}</p>
        </div>
        <div className="mt-3 space-y-2">
          {(thread.replies ?? []).map((m: any) => (
            <div key={m.id} className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[12px] font-medium ${m.author === "admin" ? "ml-auto bg-[#10132e] text-white" : "bg-white shadow-sm"}`}>
              {m.message}
              <span className="mt-1 block text-[10px] opacity-60">{agoShort(m.createdAt)} · {m.author}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendReply()}
            placeholder="Write a reply..."
            className="flex-1 rounded-2xl bg-white px-4 py-3 text-[12.5px] font-medium shadow-sm"
          />
          <button onClick={sendReply} disabled={sending || !reply.trim()} className="rounded-2xl bg-[#f0a500] px-5 text-white disabled:opacity-50">
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={() => setStatus("open")} className="rounded-xl bg-white px-4 py-2 text-[11px] font-bold shadow-sm">Reopen</button>
          <button onClick={() => setStatus("closed")} className="rounded-xl bg-white px-4 py-2 text-[11px] font-bold shadow-sm">Close ticket</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageTitle title="Support tickets" sub="Merchant conversations" />
      <div className="flex gap-2">
        {["all", "open", "answered", "closed"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-[11.5px] font-bold capitalize ${tab === t ? "bg-[#10132e] text-white" : "bg-white text-slate-600 shadow-sm"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-3 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-100">
              <Th>Subject</Th><Th>Merchant</Th><Th>Status</Th><Th>When</Th><Th right> </Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-b border-slate-50 last:border-0">
                <Td><span className="block font-bold">{t.subject}</span><span className="block text-[10.5px] text-slate-400">{t.category}</span></Td>
                <Td>{t.email || "—"}</Td>
                <Td>{statusPill(t.status)}</Td>
                <Td>{agoShort(t.createdAt)}</Td>
                <Td right>
                  <button onClick={() => open(t.id)} className="rounded-lg bg-[#10132e] px-3.5 py-1.5 text-[11px] font-bold text-white">
                    Open
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <Empty>No tickets.</Empty>}
      </div>
    </div>
  );
}
