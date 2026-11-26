"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Activity, ArrowLeftRight, BarChart3, Bell, Check, Download, Eye, Inbox, KeyRound,
  Package, Percent, Plus, RefreshCw, Route, Search, Settings, ShieldCheck, ToggleLeft,
  Trash2, UserCog, Wallet, X,
} from "lucide-react";
import { useAdmin } from "@/components/admin/AdminProvider";
import {
  adminDate, Card, CardHeader, downloadCsv, MetricCard, Modal, money, PageHeader,
  relativeDate, SearchInput, StatusPill, Table,
} from "@/components/admin/AdminCommon";
import { CountryFlag, ProviderIcon } from "@/components/IconAssets";

function FilterPills({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return <div className="flex flex-wrap gap-2">{options.map((option) => <button key={option} onClick={() => onChange(option)} className={`rounded-full border px-3 py-1.5 text-[11px] font-bold ${value === option ? "border-[#111a38] bg-[#111a38] text-white" : "border-[#dce5f3] bg-white text-[#5d6882]"}`}>{option}</button>)}</div>;
}

function ActionButton({ children, onClick, tone = "soft" }: { children: ReactNode; onClick: () => void; tone?: "soft" | "primary" | "danger" }) {
  return <button onClick={onClick} className={`admin-btn h-[32px] px-3 text-[10px] ${tone === "primary" ? "admin-btn-primary" : tone === "danger" ? "admin-btn-danger" : "admin-btn-soft"}`}>{children}</button>;
}

export function ClientUsersView() {
  const { data, action } = useAdmin();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<number | null>(null);
  const [delta, setDelta] = useState("");
  if (!data) return null;
  const rows = data.clientUsers.filter((u) => `${u.fullName} ${u.email} ${u.username} ${u.countryCode} ${u.apiKey}`.toLowerCase().includes(query.toLowerCase()) && (filter === "all" || u.status === filter));
  return <div><PageHeader kicker="CLIENT APP" title="Merchant accounts" subtitle="Real users from the SDK Pay client database" actions={<span className="admin-pill blue">{data.clientUsers.length} accounts</span>} /><Card className="mb-4 p-4"><div className="flex flex-wrap items-center gap-3"><SearchInput value={query} onChange={setQuery} placeholder="Search name, email, username..." /><FilterPills options={["all", "active", "suspended"]} value={filter} onChange={setFilter} /></div></Card><Card><Table headers={["Merchant", "Country", "Status", "KYC", "Risk", "Balance", "API key", ""]} empty={rows.length === 0}>{rows.map((u) => <tr key={u.id}><td><span className="block text-[13px] font-bold text-[#17213d]">{u.fullName}</span><span className="block text-[10px] text-[#8b96b0]">{u.email} · @{u.username}</span></td><td><span className="flex items-center gap-2"><CountryFlag code={u.countryCode} size={20} square />{u.countryCode}</span></td><td><StatusPill status={u.status} /></td><td><StatusPill status={u.kycStatus} /></td><td><StatusPill status={u.riskLevel} /></td><td>{money(u.balance)}<span className="block text-[10px] text-[#8b96b0]">{u.usdtBalance.toFixed(2)} USDT</span></td><td className="font-mono text-[10px]">{u.apiKey.slice(0, 10)}…</td><td className="flex flex-wrap gap-1"><ActionButton onClick={() => void action("clientUsers", "status", u.id, { status: u.status === "active" ? "suspended" : "active" })}>{u.status === "active" ? "Suspend" : "Activate"}</ActionButton><ActionButton onClick={() => void action("clientUsers", "kyc", u.id, { status: "verified" })}>Verify KYC</ActionButton><ActionButton onClick={() => void action("clientUsers", "regenerateKey", u.id)}><KeyRound size={12} /> Key</ActionButton><ActionButton onClick={() => setSelected(u.id)}><Eye size={12} /> Balance</ActionButton></td></tr>)}</Table></Card><Modal open={Boolean(selected)} title="Adjust wallet balance" onClose={() => setSelected(null)}><p className="text-[12px] text-[#6d7d9e]">Use a positive amount to credit, negative to debit.</p><input value={delta} onChange={(e) => setDelta(e.target.value.replace(/[^0-9-]/g, ""))} placeholder="Delta XAF" className="admin-input mt-3" /><button onClick={() => { if (selected) void action("clientUsers", "balance", selected, { delta: Number(delta) || 0 }); setSelected(null); setDelta(""); }} className="admin-btn admin-btn-primary mt-3 w-full">Apply adjustment</button></Modal></div>;
}

export function ClientKycView() {
  const { data, action } = useAdmin();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [decision, setDecision] = useState<"approve" | "reject">("approve");
  const [note, setNote] = useState("");
  if (!data) return null;
  const rows = data.clientKycUpdates.filter((k) => `${k.fullName} ${k.documentType} ${k.documentNumber} ${k.status}`.toLowerCase().includes(query.toLowerCase()));
  return <div><PageHeader kicker="COMPLIANCE" title="Client KYC submissions" subtitle="Identity update requests from the merchant app" actions={<span className="admin-pill yellow">{rows.filter((k) => k.status === "pending").length} pending</span>} /><Card className="mb-4 p-4"><SearchInput value={query} onChange={setQuery} placeholder="Search applicant or document..." /></Card><Card><Table headers={["Applicant", "Document", "Number", "Status", "Submitted", ""]} empty={rows.length === 0}>{rows.map((k) => <tr key={k.id}><td className="font-bold">{k.fullName}</td><td>{k.documentType}</td><td className="font-mono text-[11px]">{k.documentNumber}</td><td><StatusPill status={k.status} /></td><td>{adminDate(k.createdAt)}</td><td className="flex gap-2"><ActionButton onClick={() => { setSelected(k.id); setDecision("approve"); setNote(""); }} tone="primary">Approve</ActionButton><ActionButton onClick={() => { setSelected(k.id); setDecision("reject"); setNote(""); }} tone="danger">Reject</ActionButton></td></tr>)}</Table></Card><Modal open={Boolean(selected)} title={decision === "approve" ? "Approve KYC" : "Reject KYC"} onClose={() => setSelected(null)}><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Review note (required when rejecting)" className="h-24 w-full resize-none rounded-[12px] border border-[#dce5f3] p-3 text-[13px]" /><button onClick={() => { if (selected) void action("clientKyc", decision, selected, { note }); setSelected(null); }} className="admin-btn admin-btn-primary mt-3 w-full">Submit decision</button></Modal></div>;
}

export function WalletsView() {
  const { data, action } = useAdmin();
  const [selected, setSelected] = useState<number | null>(null);
  const [delta, setDelta] = useState("");
  if (!data) return null;
  return <div><PageHeader kicker="CLIENT APP" title="Wallets & balances" subtitle="All merchant currency accounts" actions={<span className="admin-pill blue">{data.clientWallets.length} wallets</span>} /><div className="mb-4 grid gap-3 sm:grid-cols-3"><MetricCard label="Total wallets" value={data.clientWallets.length} icon={<Wallet size={18} />} tone="navy" /><MetricCard label="Primary" value={data.clientWallets.filter((w) => w.isPrimary).length} icon={<Check size={18} />} tone="green" /><MetricCard label="Frozen" value={data.clientWallets.filter((w) => w.status !== "active").length} icon={<ShieldCheck size={18} />} tone="red" /></div><Card><Table headers={["Wallet", "Merchant", "Balance", "Status", "Created", ""]} empty={data.clientWallets.length === 0}>{data.clientWallets.map((w) => <tr key={w.id}><td><span className="flex items-center gap-2"><CountryFlag code={w.countryName === "Cameroon XAF" ? "CM" : w.currency} size={22} square /><span><span className="block text-[13px] font-bold text-[#17213d]">{w.currency}</span><span className="block text-[10px] text-[#8b96b0]">{w.countryName}</span></span></span></td><td>#{w.userId}{w.isPrimary && <span className="ml-2 admin-pill blue">Primary</span>}</td><td>{w.balance.toFixed(2)}</td><td><StatusPill status={w.status} /></td><td>{adminDate(w.createdAt, false)}</td><td className="flex gap-2"><ActionButton onClick={() => void action("clientWallets", "toggle", w.id)}>{w.status === "active" ? "Freeze" : "Unfreeze"}</ActionButton><ActionButton onClick={() => setSelected(w.id)}>Adjust</ActionButton></td></tr>)}</Table></Card><Modal open={Boolean(selected)} title="Adjust wallet balance" onClose={() => setSelected(null)}><input value={delta} onChange={(e) => setDelta(e.target.value.replace(/[^0-9.-]/g, ""))} placeholder="Delta" className="admin-input" /><button onClick={() => { if (selected) void action("clientWallets", "balance", selected, { delta: Number(delta) || 0 }); setSelected(null); setDelta(""); }} className="admin-btn admin-btn-primary mt-3 w-full">Apply</button></Modal></div>;
}

export function ClientTransactionsView() {
  const { data } = useAdmin();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  if (!data) return null;
  const rows = data.clientTransactions.filter((t) => `${t.reference} ${t.type} ${t.provider} ${t.method} ${t.note}`.toLowerCase().includes(query.toLowerCase()) && (filter === "all" || t.status === filter));
  return <div><PageHeader kicker="LEDGER" title="Client transactions" subtitle="Live transaction records from the merchant app" actions={<ActionButton onClick={() => downloadCsv("client-ledger.csv", ["Reference", "Type", "Direction", "Amount", "Status", "Provider", "When"], rows.map((t) => [t.reference, t.type, t.direction, money(t.amount, t.currency), t.status, t.provider, adminDate(t.createdAt)]))}><Download size={12} /> Export</ActionButton>} /><Card className="mb-4 p-4"><div className="flex flex-wrap items-center gap-3"><SearchInput value={query} onChange={setQuery} placeholder="Search reference, type, provider..." /><FilterPills options={["all", "completed", "pending", "failed"]} value={filter} onChange={setFilter} /></div></Card><Card><Table headers={["Reference", "Type", "Amount", "Provider", "Status", "When"]} empty={rows.length === 0}>{rows.map((t) => <tr key={t.id}><td className="font-mono text-[11px]">{t.reference}</td><td>{t.type}<span className="block text-[10px] text-[#8b96b0]">{t.direction}</span></td><td className="font-bold">{money(t.amount, t.currency)}</td><td><span className="flex items-center gap-2"><ProviderIcon name={t.provider} size={22} />{t.provider}</span></td><td><StatusPill status={t.status} /></td><td>{relativeDate(t.createdAt)}</td></tr>)}</Table></Card></div>;
}

export function ClientNotificationsView() {
  const { data, action } = useAdmin();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("1");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  if (!data) return null;
  const rows = data.clientNotifications.filter((n) => `${n.title} ${n.message} ${n.type}`.toLowerCase().includes(query.toLowerCase()));
  return <div><PageHeader kicker="CLIENT APP" title="Merchant alerts" subtitle="Notifications visible inside the client dashboard" actions={<button onClick={() => setOpen(true)} className="admin-btn admin-btn-primary"><Plus size={15} /> New alert</button>} /><Card className="mb-4 p-4"><SearchInput value={query} onChange={setQuery} placeholder="Search alerts..." /></Card><Card><Table headers={["Title", "User", "Type", "Status", "When", ""]} empty={rows.length === 0}>{rows.map((n) => <tr key={n.id}><td><span className="block text-[13px] font-bold text-[#17213d]">{n.title}</span><span className="block text-[10px] text-[#8b96b0]">{n.message}</span></td><td>#{n.userId}</td><td><StatusPill status={n.type} /></td><td><StatusPill status={n.isRead ? "read" : "unread"} /></td><td>{adminDate(n.createdAt)}</td><td className="flex gap-2">{!n.isRead && <ActionButton onClick={() => void action("clientNotifications", "read", n.id)}>Mark read</ActionButton>}<ActionButton tone="danger" onClick={() => void action("clientNotifications", "delete", n.id)}><Trash2 size={12} /></ActionButton></td></tr>)}</Table></Card><Modal open={open} title="Create merchant alert" onClose={() => setOpen(false)}><div className="space-y-3"><input value={userId} onChange={(e) => setUserId(e.target.value.replace(/[^0-9]/g, ""))} placeholder="User ID" className="admin-input" /><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="admin-input" /><textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" className="h-24 w-full resize-none rounded-[12px] border border-[#dce5f3] p-3 text-[13px]" /><button onClick={() => { void action("clientNotifications", "create", 0, { userId: Number(userId) || 1, title: title || "Admin notice", message, type: "info" }); setOpen(false); setTitle(""); setMessage(""); }} className="admin-btn admin-btn-primary w-full">Publish alert</button></div></Modal></div>;
}

export function SupportInboxView() {
  const { data, action } = useAdmin();
  const [selected, setSelected] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  if (!data) return null;
  const item = data.clientSupportMessages.find((m) => m.id === selected);
  return <div><PageHeader kicker="SUPPORT" title="Support inbox" subtitle="Messages submitted from the client app" actions={<span className="admin-pill blue">{data.clientSupportMessages.length} messages</span>} /><div className="grid gap-4 lg:grid-cols-[1fr_.8fr]"><Card><Table headers={["From", "Subject", "Status", "Priority", "When", ""]} empty={data.clientSupportMessages.length === 0}>{data.clientSupportMessages.map((m) => <tr key={m.id}><td><span className="block font-bold text-[#17213d]">{m.email}</span><span className="block text-[10px] text-[#8b96b0]">{m.message.slice(0, 48)}</span></td><td>{m.subject}</td><td><StatusPill status={m.status} /></td><td><StatusPill status={m.priority} /></td><td>{relativeDate(m.createdAt)}</td><td><ActionButton onClick={() => setSelected(m.id)}><Eye size={12} /> Open</ActionButton></td></tr>)}</Table></Card><Card className="p-5">{!item ? <p className="py-10 text-center text-[12px] text-[#8b96b0]">Select a message.</p> : <><h2 className="text-[16px] font-extrabold">{item.subject}</h2><p className="mt-1 text-[11px] text-[#8b96b0]">{item.email} · {adminDate(item.createdAt)}</p><div className="mt-4 rounded-[12px] bg-[#f5f8ff] p-4 text-[13px] text-[#4b5875]">{item.message}</div><textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Admin reply..." className="mt-4 h-24 w-full resize-none rounded-[12px] border border-[#dce5f3] p-3 text-[13px]" /><div className="mt-3 flex gap-2"><button onClick={() => { void action("clientSupport", "reply", 0, { subject: `Re: ${item.subject}`, message: reply, priority: item.priority }); setReply(""); }} className="admin-btn admin-btn-primary">Send reply</button><button onClick={() => void action("clientSupport", "status", item.id, { status: "closed" })} className="admin-btn admin-btn-soft">Close</button></div></>}</Card></div></div>;
}

export function WithdrawalsView() {
  const { data, action } = useAdmin();
  if (!data) return null;
  const clientWithdrawals = data.clientTransactions.filter((t) => t.type === "withdraw" || t.type === "crypto_withdraw");
  return <div><PageHeader kicker="PAYOUTS" title="Withdrawals" subtitle="Manual review queue and client-app withdrawal ledger" /><div className="mb-4 grid gap-3 sm:grid-cols-3"><MetricCard label="Pending review" value={data.metrics.pendingWithdrawals} icon={<Download size={18} />} tone="yellow" /><MetricCard label="Client withdrawals" value={clientWithdrawals.length} icon={<ArrowLeftRight size={18} />} tone="navy" /><MetricCard label="Processed" value={data.withdrawals.filter((w) => w.status === "processed").length} icon={<Check size={18} />} tone="green" /></div><Card><CardHeader title="Manual review queue" /><Table headers={["Member", "Amount", "Method", "Status", "Requested", ""]} empty={data.withdrawals.length === 0}>{data.withdrawals.map((w) => <tr key={w.id}><td className="font-bold">{w.memberName}</td><td>{money(w.amount, w.currency)}</td><td>{w.method}</td><td><StatusPill status={w.status} /></td><td>{adminDate(w.requestedAt)}</td><td>{w.status === "pending" && <div className="flex gap-2"><ActionButton tone="primary" onClick={() => void action("withdrawals", "approve", w.id)}>Approve</ActionButton><ActionButton tone="danger" onClick={() => void action("withdrawals", "reject", w.id)}>Reject</ActionButton></div>}</td></tr>)}</Table></Card><Card className="mt-4"><CardHeader title="Client withdrawal ledger" /><Table headers={["Reference", "Amount", "Provider", "Status", "When"]} empty={clientWithdrawals.length === 0}>{clientWithdrawals.map((t) => <tr key={t.id}><td className="font-mono text-[11px]">{t.reference}</td><td>{money(t.amount, t.currency)}</td><td>{t.provider}</td><td><StatusPill status={t.status} /></td><td>{relativeDate(t.createdAt)}</td></tr>)}</Table></Card></div>;
}

export function ProvidersView() {
  const { data, action } = useAdmin();
  const [selected, setSelected] = useState<number | null>(null);
  const [primary, setPrimary] = useState("ashtechpay");
  const [fallback, setFallback] = useState("saaspay");
  if (!data) return null;
  const item = data.providerRoutes.find((r) => r.id === selected);
  return <div><PageHeader kicker="ROUTING" title="Provider routing" subtitle="Ashtechpay primary, Saaspay.me fallback, Ashtechpay-only crypto" actions={<span className="admin-pill green">Crypto: Ashtechpay only</span>} /><Card><Table headers={["Country", "Operator", "Primary", "Fallback", "Status", ""]} empty={data.providerRoutes.length === 0}>{data.providerRoutes.map((r) => <tr key={r.id}><td><span className="flex items-center gap-2"><CountryFlag code={r.country} size={20} square />{r.country}</span></td><td className="font-bold">{r.operator}</td><td><span className="flex items-center gap-2"><ProviderIcon name={r.primaryProvider} size={22} />{r.primaryProvider}</span></td><td><span className="flex items-center gap-2"><ProviderIcon name={r.fallbackProvider} size={22} />{r.fallbackProvider}</span></td><td><StatusPill status={r.status} /></td><td className="flex gap-2"><ActionButton onClick={() => void action("providerRoutes", "toggle", r.id)}>{r.status === "active" ? "Disable" : "Enable"}</ActionButton><ActionButton onClick={() => { setSelected(r.id); setPrimary(r.primaryProvider); setFallback(r.fallbackProvider); }}><Settings size={12} /> Edit</ActionButton></td></tr>)}</Table></Card><Modal open={Boolean(item)} title="Edit provider route" onClose={() => setSelected(null)}><div className="space-y-3"><select value={primary} onChange={(e) => setPrimary(e.target.value)} className="admin-input"><option value="ashtechpay">Ashtechpay</option><option value="saaspay">Saaspay.me</option></select><select value={fallback} onChange={(e) => setFallback(e.target.value)} className="admin-input"><option value="saaspay">Saaspay.me</option><option value="ashtechpay">Ashtechpay</option></select><button onClick={() => { if (selected) void action("providerRoutes", "update", selected, { primaryProvider: primary, fallbackProvider: fallback }); setSelected(null); }} className="admin-btn admin-btn-primary w-full">Save route</button></div></Modal></div>;
}

export function FeesView() {
  const { data, action } = useAdmin();
  const [draft, setDraft] = useState<Record<number, { percent: number; fixed: number }>>({});
  useEffect(() => { if (data) setDraft(Object.fromEntries(data.feeRules.map((r) => [r.id, { percent: r.percent, fixed: r.fixed }]))); }, [data]);
  if (!data) return null;
  return <div><PageHeader kicker="REVENUE" title="Fee rules" subtitle="Transparent pricing applied across payment flows" /><Card><Table headers={["Scope", "Percent", "Fixed", "Currency", "Status", ""]} empty={data.feeRules.length === 0}>{data.feeRules.map((r) => <tr key={r.id}><td className="font-bold">{r.scope}</td><td><input type="number" value={draft[r.id]?.percent ?? r.percent} onChange={(e) => setDraft({ ...draft, [r.id]: { percent: Number(e.target.value), fixed: draft[r.id]?.fixed ?? r.fixed } })} className="h-[34px] w-[80px] rounded-[8px] border border-[#dce5f3] px-2 text-[12px]" /> %</td><td><input type="number" value={draft[r.id]?.fixed ?? r.fixed} onChange={(e) => setDraft({ ...draft, [r.id]: { percent: draft[r.id]?.percent ?? r.percent, fixed: Number(e.target.value) } })} className="h-[34px] w-[90px] rounded-[8px] border border-[#dce5f3] px-2 text-[12px]" /></td><td>{r.currency}</td><td><StatusPill status={r.status} /></td><td><ActionButton tone="primary" onClick={() => void action("feeRules", "update", r.id, draft[r.id] ?? { percent: r.percent, fixed: r.fixed })}>Save</ActionButton></td></tr>)}</Table></Card></div>;
}

export function FeatureFlagsView() {
  const { data, action } = useAdmin();
  if (!data) return null;
  return <div><PageHeader kicker="PLATFORM" title="Feature flags" subtitle="Enable or disable merchant-app capabilities" actions={<span className="admin-pill green">{data.metrics.featureFlagsOn} enabled</span>} /><div className="grid gap-3 sm:grid-cols-2">{data.featureFlags.map((f) => <Card key={f.key} className="flex items-center gap-4 p-5"><span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#f2f6fd]"><ToggleLeft size={20} /></span><div className="flex-1"><p className="text-[14px] font-extrabold text-[#17213d]">{f.label}</p><p className="mt-1 text-[11px] text-[#8b96b0]">{f.description}</p><code className="text-[10px] text-[#6d7d9e]">{f.key}</code></div><button onClick={() => void action("featureFlags", "toggle", 0, { key: f.key })} className={`relative h-[30px] w-[54px] shrink-0 rounded-full ${f.enabled ? "bg-[#ffb800]" : "bg-[#dce5f3]"}`}><span className={`absolute top-[3px] h-6 w-6 rounded-full bg-white transition-all ${f.enabled ? "left-[26px]" : "left-[3px]"}`} /></button></Card>)}</div></div>;
}

export function TeamView() {
  const { data, action } = useAdmin();
  if (!data) return null;
  return <div><PageHeader kicker="ACCESS CONTROL" title="Team & roles" subtitle="Admin back-office operators" actions={<span className="admin-pill blue">{data.teamMembers.length} members</span>} /><Card><Table headers={["Name", "Email", "Role", "Status", "Last active", ""]} empty={data.teamMembers.length === 0}>{data.teamMembers.map((m) => <tr key={m.id}><td className="font-bold">{m.name}</td><td>{m.email}</td><td><select value={m.role} onChange={(e) => void action("team", "role", m.id, { role: e.target.value })} className="h-[34px] rounded-[8px] border border-[#dce5f3] px-2 text-[11px]"><option value="super_admin">super_admin</option><option value="kyc_reviewer">kyc_reviewer</option><option value="finance">finance</option><option value="support">support</option><option value="auditor">auditor</option></select></td><td><StatusPill status={m.status} /></td><td>{adminDate(m.lastActiveAt)}</td><td><ActionButton onClick={() => void action("team", "toggle", m.id)}>{m.status === "active" ? "Suspend" : "Activate"}</ActionButton></td></tr>)}</Table></Card></div>;
}

export function CatalogView() {
  const { data, action } = useAdmin();
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("all");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  if (!data) return null;
  const sections = ["all", ...Array.from(new Set(data.catalogItems.map((i) => i.section)))];
  const rows = data.catalogItems.filter((i) => (section === "all" || i.section === section) && `${i.title} ${i.subtitle} ${i.status}`.toLowerCase().includes(query.toLowerCase()));
  return <div><PageHeader kicker="OPERATIONS" title="Catalog & requests" subtitle="Content, services, products and manual review requests" actions={<button onClick={() => setOpen(true)} className="admin-btn admin-btn-primary"><Plus size={15} /> New item</button>} /><Card className="mb-4 p-4"><div className="flex flex-wrap items-center gap-3"><SearchInput value={query} onChange={setQuery} placeholder="Search catalog..." /><FilterPills options={sections} value={section} onChange={setSection} /></div></Card><Card><Table headers={["Section", "Title", "Detail", "Status", "Amount", ""]} empty={rows.length === 0}>{rows.map((i) => <tr key={i.id}><td><StatusPill status={i.section} /></td><td className="font-bold">{i.title}</td><td>{i.subtitle}</td><td><StatusPill status={i.status} /></td><td>{i.amount ? money(i.amount) : "—"}</td><td className="flex gap-2"><ActionButton onClick={() => void action("catalogItems", "toggle", i.id)}>Toggle</ActionButton><ActionButton tone="danger" onClick={() => void action("catalogItems", "delete", i.id)}><Trash2 size={12} /></ActionButton></td></tr>)}</Table></Card><Modal open={open} title="New catalog item" onClose={() => setOpen(false)}><div className="space-y-3"><select value={section === "all" ? "content" : section} onChange={(e) => setSection(e.target.value)} className="admin-input"><option value="content">content</option><option value="services">services</option><option value="products">products</option><option value="requests">requests</option></select><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="admin-input" /><input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Description" className="admin-input" /><button onClick={() => { void action("catalogItems", "create", 0, { section: section === "all" ? "content" : section, title: title || "New item", subtitle, status: "active", amount: 0 }); setOpen(false); setTitle(""); setSubtitle(""); }} className="admin-btn admin-btn-primary w-full">Create</button></div></Modal></div>;
}

export function ReportsView() {
  const { data, refresh } = useAdmin();
  const [range, setRange] = useState("30d");
  if (!data) return null;
  const groups = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of [...data.transactions, ...data.clientTransactions]) map[t.provider] = (map[t.provider] ?? 0) + t.amount;
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [data]);
  const max = Math.max(1, ...groups.map(([, value]) => value));
  return <div><PageHeader kicker="ANALYTICS" title="Reports" subtitle="Revenue, volume and operational health" actions={<><button onClick={() => void refresh()} className="admin-btn admin-btn-soft"><RefreshCw size={15} /> Refresh</button><button onClick={() => downloadCsv("sdkpay-admin-report.csv", ["Reference", "Member / Type", "Amount", "Status", "Provider", "When"], [...data.transactions.map((t) => [t.reference, t.memberName, money(t.amount, t.currency), t.status, t.provider, adminDate(t.createdAt)]), ...data.clientTransactions.map((t) => [t.reference, t.type, money(t.amount, t.currency), t.status, t.provider, adminDate(t.createdAt)])])} className="admin-btn admin-btn-primary"><Download size={15} /> Export CSV</button></>} /><div className="mb-4"><FilterPills options={["7d", "30d", "90d", "all"]} value={range} onChange={setRange} /></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><MetricCard label="Merchant users" value={data.metrics.clientUsers} icon={<UserCog size={18} />} tone="navy" /><MetricCard label="Total volume" value={money(data.metrics.successfulVolume)} icon={<BarChart3 size={18} />} tone="green" /><MetricCard label="Transactions" value={data.metrics.transactions} icon={<ArrowLeftRight size={18} />} tone="blue" /><MetricCard label="Failed" value={data.metrics.failedTransactions} icon={<Activity size={18} />} tone="red" /></div><div className="mt-4 grid gap-4 lg:grid-cols-2"><Card className="p-5"><CardHeader title="Volume by provider" subtitle={`Range ${range}`} /><div className="space-y-4 p-5">{groups.map(([provider, value]) => <div key={provider}><div className="mb-1 flex justify-between text-[12px] font-semibold"><span className="flex items-center gap-2"><ProviderIcon name={provider} size={20} />{provider}</span><strong>{money(value)}</strong></div><div className="h-2 rounded-full bg-[#eef2f8]"><div className="h-full rounded-full bg-[#2442d6]" style={{ width: `${(value / max) * 100}%` }} /></div></div>)}</div></Card><Card className="p-5"><CardHeader title="Operational snapshot" /><div className="space-y-3 p-5">{[
    ["Open tickets", data.metrics.openTickets, <HeadsetIcon key="a" />],
    ["Pending KYC", data.metrics.pendingKyc, <ShieldCheck size={16} key="b" />],
    ["Unread alerts", data.metrics.unreadNotifications, <Bell size={16} key="c" />],
    ["Feature flags on", data.metrics.featureFlagsOn, <ToggleLeft size={16} key="d" />],
    ["Provider routes", data.metrics.providerRoutes, <Route size={16} key="e" />],
    ["Team members", data.metrics.teamMembers, <UserCog size={16} key="f" />],
  ].map(([label, value, icon]) => <div key={String(label)} className="flex items-center gap-3 rounded-[12px] bg-[#f7f9fd] px-4 py-3"><span className="text-[#2442d6]">{icon as ReactNode}</span><span className="flex-1 text-[12px] font-bold text-[#25314d]">{String(label)}</span><strong className="text-[12px]">{String(value)}</strong></div>)}</div></Card></div></div>;
}

function HeadsetIcon() { return <Inbox size={16} />; }
