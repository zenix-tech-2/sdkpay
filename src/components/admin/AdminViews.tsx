"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity, AlertTriangle, ArrowLeft, ArrowLeftRight, Bell, Check, Copy, Database,
  Download, ExternalLink, Eye, FileText, Headset, KeyRound, Link2, Megaphone,
  Plus, RefreshCw, Save, Search, Server, Settings, ShieldCheck, Smartphone, Star,
  Trash2, Users, Wallet, X, Zap,
} from "lucide-react";
import { useAdmin } from "@/components/admin/AdminProvider";
import * as Extended from "@/components/admin/AdminExtendedViews";
import {
  adminDate, Card, CardHeader, downloadCsv, MetricCard, Modal, money, PageHeader,
  relativeDate, SearchInput, StatusPill, Table, useQueryId,
} from "@/components/admin/AdminCommon";
import { CountryFlag, ProviderIcon } from "@/components/IconAssets";
import type { AdminKyc, AdminMember, AdminTicket, AdminUpdate } from "@/lib/admin-types";

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return <div className="flex items-center justify-between gap-4 border-b border-[#f0f3f9] px-5 py-3 last:border-b-0"><span className="text-[12px] text-[#7b879f]">{label}</span><span className="text-right text-[12px] font-bold text-[#25314d]">{value || "—"}</span></div>;
}

function FilterPills({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) {
  return <div className="flex flex-wrap gap-2">{options.map((option) => <button key={option} onClick={() => onChange(option)} className={`rounded-full border px-3 py-1.5 text-[11px] font-bold ${value === option ? "border-[#111a38] bg-[#111a38] text-white" : "border-[#dce5f3] bg-white text-[#5d6882]"}`}>{option}</button>)}</div>;
}

function Empty({ text }: { text: string }) {
  return <div className="px-5 py-10 text-center text-[12px] text-[#8b96b0]">{text}</div>;
}

export function AdminSection({ section }: { section: string }) {
  if (section === "users") return <UsersView />;
  if (section === "kyc") return <KycView />;
  if (section === "api-keys") return <ApiKeysView />;
  if (section === "transactions") return <TransactionsView />;
  if (section === "payment-links") return <PaymentLinksView />;
  if (section === "refunds") return <RefundsView />;
  if (section === "updates") return <UpdatesView />;
  if (section === "notifications") return <NotificationsView />;
  if (section === "reviews") return <ReviewsView />;
  if (section === "support") return <SupportView />;
  if (section === "monitoring") return <MonitoringView />;
  if (section === "audit") return <AuditView />;
  if (section === "merchant-app") return <MerchantAppView />;
  if (section === "docs") return <DocsView />;
  if (section === "settings") return <SettingsView />;
  if (section === "client-users") return <Extended.ClientUsersView />;
  if (section === "client-kyc") return <Extended.ClientKycView />;
  if (section === "wallets") return <Extended.WalletsView />;
  if (section === "client-transactions") return <Extended.ClientTransactionsView />;
  if (section === "client-notifications") return <Extended.ClientNotificationsView />;
  if (section === "support-inbox") return <Extended.SupportInboxView />;
  if (section === "withdrawals") return <Extended.WithdrawalsView />;
  if (section === "providers") return <Extended.ProvidersView />;
  if (section === "fees") return <Extended.FeesView />;
  if (section === "feature-flags") return <Extended.FeatureFlagsView />;
  if (section === "team") return <Extended.TeamView />;
  if (section === "catalog") return <Extended.CatalogView />;
  if (section === "reports") return <Extended.ReportsView />;
  return <OverviewView />;
}

function OverviewView() {
  const { data, refresh } = useAdmin();
  if (!data) return null;
  const m = data.metrics;
  const max = Math.max(1, ...[m.transactions, m.members, m.openTickets, m.pendingKyc]);
  const bars = [
    ["Transactions", m.transactions, "#2442d6"], ["Members", m.members, "#00b578"], ["Tickets", m.openTickets, "#ffb800"], ["KYC", m.pendingKyc, "#e11d48"],
  ] as const;
  return (
    <div>
      <PageHeader kicker="LIVE OPERATIONS" title="Operations overview" subtitle="SDK Pay Admin · independent deployment console" actions={<button onClick={() => void refresh()} className="admin-btn admin-btn-soft"><RefreshCw size={15} /> Refresh</button>} />
      <div className="motion-up relative overflow-hidden rounded-[22px] bg-[#111a38] px-6 py-7 text-white shadow-[0_20px_45px_rgba(17,26,56,.18)]">
        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[#2442d6]/35 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4"><div><p className="text-[11px] font-extrabold tracking-[.18em] text-[#9fb0db]">ADMIN CONTROL CENTER</p><h2 className="font-display mt-2 text-[28px] font-extrabold sm:text-[36px]">Operations console</h2><p className="mt-2 max-w-xl text-[13px] leading-relaxed text-[#c7d2ee]">Users, KYC, transactions, disputes, webhooks and API health are consolidated here. Every action is written to the independent admin audit log.</p></div><span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[12px] font-bold"><ShieldCheck size={16} /> Super admin</span></div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Members" value={m.members} note={`${m.activeMembers} active accounts`} icon={<Users size={18} />} tone="navy" />
        <MetricCard label="Pending KYC" value={m.pendingKyc} note="Identity reviews" icon={<ShieldCheck size={18} />} tone="yellow" />
        <MetricCard label="Transactions" value={m.transactions} note={`${money(m.successfulVolume)} successful`} icon={<ArrowLeftRight size={18} />} tone="green" />
        <MetricCard label="Open tickets" value={m.openTickets} note={`${m.unreadNotifications} unread alerts`} icon={<Headset size={18} />} tone="red" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <Card className="p-5"><CardHeader title="Activity distribution" subtitle="Live snapshot from admin tables" /><div className="space-y-4 p-5">{bars.map(([label, value, color]) => <div key={label}><div className="mb-1 flex justify-between text-[12px] font-semibold text-[#5d6882]"><span>{label}</span><strong className="text-[#17213d]">{value}</strong></div><div className="h-2 rounded-full bg-[#eef2f8]"><div className="h-full rounded-full transition-all" style={{ width: `${(value / max) * 100}%`, background: color }} /></div></div>)}</div></Card>
        <Card className="p-5"><CardHeader title="System health" subtitle="Provider + database" /><div className="space-y-3 p-5"><DetailRow label="Database" value={<span className="text-[#17854d]">{m.databaseOnline ? "Online" : "Offline"} · {m.databaseLatency} ms</span>} /><DetailRow label="Gateway" value={<span className={m.gatewayStatus === "online" ? "text-[#17854d]" : "text-[#d43c4c]"}>{m.gatewayLabel}</span>} /><DetailRow label="Mode" value={m.mode} /><DetailRow label="Failed webhooks" value={m.failedWebhooks} /><DetailRow label="Avg latency" value={`${m.avgLatency} ms`} /></div></Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card><CardHeader title="Recent transactions" actions={<Link href="/admin/transactions" className="text-[11px] font-bold text-[#1d63b8]">View all →</Link>} /><Table headers={["Reference", "Member", "Amount", "Status"]} empty={data.transactions.length === 0}>{data.transactions.slice(0, 5).map((t) => <tr key={t.id}><td className="font-mono text-[11px]">{t.reference}</td><td>{t.memberName}</td><td>{money(t.amount, t.currency)}</td><td><StatusPill status={t.status} /></td></tr>)}</Table></Card>
        <Card><CardHeader title="Needs attention" actions={<Link href="/admin/kyc?filter=pending" className="text-[11px] font-bold text-[#1d63b8]">Review KYC →</Link>} /><div className="space-y-3 p-5">{[
          ["KYC submissions", `${m.pendingKyc} pending`, "/admin/kyc", <ShieldCheck size={17} key="k" />],
          ["Refund disputes", `${m.pendingRefunds} pending`, "/admin/refunds", <AlertTriangle size={17} key="r" />],
          ["Support tickets", `${m.openTickets} open`, "/admin/support", <Headset size={17} key="s" />],
          ["Webhook failures", `${m.failedWebhooks} failed`, "/admin/monitoring", <Activity size={17} key="w" />],
        ].map(([label, value, href, icon]) => <Link key={String(label)} href={String(href)} className="flex items-center gap-3 rounded-[12px] border border-[#e7ecf5] px-4 py-3 hover:border-[#ffd66b]"><span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#f2f6fd] text-[#5d6882]">{icon as ReactNode}</span><span className="flex-1 text-[13px] font-bold text-[#25314d]">{String(label)}</span><span className="text-[12px] font-bold text-[#71809b]">{String(value)}</span><ExternalLink size={15} /></Link>)}</div></Card>
      </div>
    </div>
  );
}

function UsersView() {
  const { data, action } = useAdmin();
  const { id, setQueryId } = useQueryId();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [note, setNote] = useState("");
  const member = data?.members.find((m) => m.id === id);
  useEffect(() => {
    if (!data || !id) return;
    const existing = data.notes.find((n) => n.targetType === "member" && n.targetId === id);
    setNote(existing?.body ?? "");
  }, [data, id]);
  if (!data) return null;
  const rows = data.members.filter((m) => `${m.fullName} ${m.email} ${m.business} ${m.country}`.toLowerCase().includes(query.toLowerCase()) && (filter === "all" || m.status === filter));

  if (id && member) {
    const kyc = data.kyc.filter((k) => k.memberId === member.id);
    const keys = data.apiKeys.filter((k) => k.memberId === member.id);
    const txs = data.transactions.filter((t) => t.memberId === member.id);
    return (
      <div>
        <button onClick={() => setQueryId(null)} className="mb-4 flex items-center gap-2 text-[12px] font-bold text-[#6d7d9e]"><ArrowLeft size={16} /> Back to users</button>
        <PageHeader title={member.fullName} subtitle={member.email} kicker="USER PROFILE" actions={<StatusPill status={member.accountStatus} label={`Account ${member.accountStatus}`} />} />
        <Card className="overflow-hidden"><DetailRow label="Phone" value={member.phone} /><DetailRow label="Country" value={<span className="flex items-center justify-end gap-2"><CountryFlag code="CM" size={20} square /> {member.country}</span>} /><DetailRow label="Business" value={member.business} /><DetailRow label="Role" value={member.role} /><DetailRow label="Joined" value={adminDate(member.joinedAt)} /><DetailRow label="Last login" value={adminDate(member.lastLoginAt)} /><DetailRow label="Active sessions" value={member.activeSessions} /><DetailRow label="Webhook URL" value={member.webhookUrl} /><DetailRow label="Balances" value={<span className="text-[11px]">{member.balances}</span>} /></Card>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card><CardHeader title="KYC submissions" /><Table headers={["Submitted", "Document", "Status", ""]} empty={kyc.length === 0}>{kyc.map((k) => <tr key={k.id}><td>{adminDate(k.submittedAt)}</td><td>{k.documentType}</td><td><StatusPill status={k.status} /></td><td><button onClick={() => router.push(`/admin/kyc?id=${k.id}`)} className="text-[11px] font-bold text-[#1d63b8]">Review →</button></td></tr>)}</Table></Card>
          <Card><CardHeader title="API keys" /><Table headers={["Name", "Env", "Key", "Status"]} empty={keys.length === 0}>{keys.map((k) => <tr key={k.id}><td>{k.name}</td><td><StatusPill status={k.environment} /></td><td className="font-mono text-[11px]">{k.keyMasked}</td><td><StatusPill status={k.status} /></td></tr>)}</Table></Card>
        </div>
        <Card className="mt-5"><CardHeader title="Recent transactions" /><Table headers={["Reference", "Amount", "Status", "When"]} empty={txs.length === 0}>{txs.slice(0, 8).map((t) => <tr key={t.id}><td className="font-mono text-[11px]">{t.reference}</td><td>{money(t.amount, t.currency)}</td><td><StatusPill status={t.status} /></td><td>{relativeDate(t.createdAt)}</td></tr>)}</Table></Card>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card className="p-5"><h2 className="text-[15px] font-extrabold text-[#17213d]">Account controls</h2><p className="mt-1 text-[12px] text-[#8b96b0]">Suspend or restore access instantly. Actions are audited.</p><button onClick={() => void action("members", member.status === "active" ? "suspend" : "activate", member.id)} className={`admin-btn mt-4 ${member.status === "active" ? "admin-btn-danger" : "admin-btn-soft"}`}>{member.status === "active" ? "Suspend account" : "Activate account"}</button></Card>
          <Card className="p-5"><h2 className="text-[15px] font-extrabold text-[#17213d]">Internal note</h2><textarea value={note} onChange={(e) => setNote(e.target.value)} className="mt-3 h-24 w-full resize-none rounded-[12px] border border-[#dce5f3] p-3 text-[13px] outline-none focus:border-[#ffb800]" placeholder="Private admin note..." /><button onClick={() => void action("notes", "create", 0, { targetType: "member", targetId: member.id, body: note })} className="admin-btn admin-btn-soft mt-3"><Save size={15} /> Save note</button></Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Users" subtitle="Merchant and client accounts" kicker="DIRECTORY" actions={<span className="admin-pill blue">{data.members.length} accounts</span>} />
      <Card className="mb-4 p-4"><div className="flex flex-wrap items-center gap-3"><SearchInput value={query} onChange={setQuery} placeholder="Search name, email, business..." /><FilterPills options={["all", "active", "pending", "suspended"]} value={filter} onChange={setFilter} /></div></Card>
      <Card><Table headers={["User", "Country", "Business", "Status", "Joined", ""]} empty={rows.length === 0}>{rows.map((m: AdminMember) => <tr key={m.id}><td><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-extrabold text-white" style={{ background: m.avatarColor }}>{m.initials}</span><span><span className="block text-[13px] font-bold text-[#17213d]">{m.fullName}</span><span className="block text-[10px] text-[#8b96b0]">{m.email}</span></span></div></td><td>{m.country}</td><td>{m.business}</td><td><StatusPill status={m.status} /></td><td>{adminDate(m.joinedAt, false)}</td><td><button onClick={() => setQueryId(m.id)} className="admin-btn admin-btn-soft h-[34px] px-3 text-[11px]"><Eye size={13} /> View</button></td></tr>)}</Table></Card>
    </div>
  );
}

function KycView() {
  const { data, action } = useAdmin();
  const { id, setQueryId } = useQueryId();
  const [filter, setFilter] = useState("approved");
  const [note, setNote] = useState("");
  const kyc = data?.kyc.find((k) => k.id === id);
  if (!data) return null;
  const rows = data.kyc.filter((k) => filter === "all" || k.status === filter);

  if (id && kyc) return <KycDetail kyc={kyc} note={note} setNote={setNote} onBack={() => setQueryId(null)} onDecision={(decision) => action("kyc", decision, kyc.id, { note })} />;

  return (
    <div>
      <PageHeader title="KYC approvals" subtitle="Review identity documents and applications" kicker="COMPLIANCE" actions={<span className="admin-pill yellow">{data.metrics.pendingKyc} pending</span>} />
      <div className="mb-4"><FilterPills options={["pending", "approved", "rejected", "all"]} value={filter} onChange={setFilter} /></div>
      <Card><Table headers={["Applicant", "Document", "Country", "Submitted", "Status", ""]} empty={rows.length === 0}>{rows.map((k: AdminKyc) => <tr key={k.id}><td><span className="block text-[13px] font-bold text-[#17213d]">{k.applicantName}</span><span className="block text-[10px] text-[#8b96b0]">{k.email}</span></td><td>{k.documentType}</td><td>{k.country}</td><td>{adminDate(k.submittedAt)}</td><td><StatusPill status={k.status} /></td><td><button onClick={() => setQueryId(k.id)} className="admin-btn admin-btn-dark h-[34px] px-4 text-[11px]">Review</button></td></tr>)}</Table></Card>
    </div>
  );
}

function KycDetail({ kyc, note, setNote, onBack, onDecision }: { kyc: AdminKyc; note: string; setNote: (value: string) => void; onBack: () => void; onDecision: (decision: "approve" | "reject") => void }) {
  return (
    <div>
      <button onClick={onBack} className="mb-4 flex items-center gap-2 text-[12px] font-bold text-[#6d7d9e]"><ArrowLeft size={16} /> Back to KYC approvals</button>
      <PageHeader title={`KYC · ${kyc.applicantName}`} subtitle={`Submitted ${adminDate(kyc.submittedAt)}`} actions={<StatusPill status={kyc.status} label={kyc.status === "approved" ? "Approved" : undefined} />} />
      <Card className="p-4"><div className="grid gap-4 sm:grid-cols-2"><div><p className="admin-mini-label mb-2">Front (recto)</p><div className="flex h-[150px] items-center justify-center rounded-[12px] border border-[#dce5f3] bg-white"><div className="h-full w-1/2 bg-black" /></div></div><div><p className="admin-mini-label mb-2">Back (verso)</p><div className="flex h-[150px] items-center justify-center rounded-[12px] border border-[#dce5f3] bg-white"><div className="h-full w-1/2 bg-black" /></div></div></div></Card>
      <Card className="mt-4"><CardHeader title="Application" /><p className="px-5 py-4 text-[12px] leading-relaxed text-[#5d6882]">{kyc.applicationText || "No additional application text."}</p></Card>
      <Card className="mt-4 overflow-hidden"><DetailRow label="Applicant" value={<span className="text-[#1d63b8]">{kyc.email}</span>} /><DetailRow label="Document" value={kyc.documentType} /><DetailRow label="Document no." value={kyc.documentNo} /><DetailRow label="Date of birth" value={kyc.dateOfBirth} /><DetailRow label="Country" value={kyc.country} /><DetailRow label="Business" value={kyc.business} /><DetailRow label="Website" value={kyc.website} /><DetailRow label="Reviewed" value={adminDate(kyc.reviewedAt)} /></Card>
      <Card className="mt-4 p-5"><h2 className="text-[15px] font-extrabold text-[#17213d]">Decision</h2><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note to the user (required when rejecting)" className="mt-3 h-24 w-full resize-none rounded-[12px] border border-[#dce5f3] p-3 text-[13px] outline-none focus:border-[#ffb800]" /><div className="mt-4 grid grid-cols-2 gap-3"><button onClick={() => onDecision("approve")} className="admin-btn admin-btn-primary h-[50px]"><Check size={17} /> Approve</button><button onClick={() => onDecision("reject")} className="admin-btn admin-btn-danger h-[50px]"><X size={17} /> Reject</button></div></Card>
    </div>
  );
}

function ApiKeysView() {
  const { data, action } = useAdmin();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [env, setEnv] = useState("live");
  if (!data) return null;
  return (
    <div>
      <PageHeader title="API keys" subtitle="Merchant credentials and access status" kicker="SECURITY" actions={<button onClick={() => setOpen(true)} className="admin-btn admin-btn-primary"><Plus size={16} /> New key</button>} />
      <Card><Table headers={["Name", "Env", "Key", "Status", "Created", ""]} empty={data.apiKeys.length === 0}>{data.apiKeys.map((k) => <tr key={k.id}><td className="font-bold text-[#17213d]">{k.name}</td><td><StatusPill status={k.environment} /></td><td className="font-mono text-[11px]">{k.keyMasked}</td><td><StatusPill status={k.status} /></td><td>{adminDate(k.createdAt, false)}</td><td><button onClick={() => void action("apiKeys", "toggle", k.id)} className="admin-btn admin-btn-soft h-[32px] px-3 text-[10px]">{k.status === "active" ? "Revoke" : "Activate"}</button></td></tr>)}</Table></Card>
      <Modal open={open} title="Create API key" onClose={() => setOpen(false)}><div className="space-y-3"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Key name" className="admin-input" /><select value={env} onChange={(e) => setEnv(e.target.value)} className="admin-input"><option value="live">Live</option><option value="test">Test</option></select><button onClick={() => { void action("apiKeys", "create", 0, { name: name || "New key", environment: env }); setOpen(false); setName(""); }} className="admin-btn admin-btn-primary w-full">Create key</button></div></Modal>
    </div>
  );
}

function TransactionsView() {
  const { data } = useAdmin();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<number | null>(null);
  if (!data) return null;
  const rows = data.transactions.filter((t) => `${t.reference} ${t.memberName} ${t.provider} ${t.method}`.toLowerCase().includes(query.toLowerCase()) && (filter === "all" || t.status === filter));
  const tx = data.transactions.find((t) => t.id === selected);
  return (
    <div>
      <PageHeader title="Transactions" subtitle="Payment ledger across providers" kicker="FINANCE" actions={<button onClick={() => downloadCsv("admin-transactions.csv", ["Reference", "Member", "Amount", "Status", "Provider", "When"], rows.map((t) => [t.reference, t.memberName, money(t.amount, t.currency), t.status, t.provider, adminDate(t.createdAt)]))} className="admin-btn admin-btn-soft"><Download size={15} /> Export CSV</button>} />
      <Card className="mb-4 p-4"><div className="flex flex-wrap items-center gap-3"><SearchInput value={query} onChange={setQuery} placeholder="Search reference, member, provider..." /><FilterPills options={["all", "successful", "failed", "pending"]} value={filter} onChange={setFilter} /></div></Card>
      <Card><Table headers={["Reference", "Member", "Amount", "Provider", "Status", "When", ""]} empty={rows.length === 0}>{rows.map((t) => <tr key={t.id}><td className="font-mono text-[11px]">{t.reference}</td><td>{t.memberName}</td><td className="font-bold">{money(t.amount, t.currency)}</td><td><span className="flex items-center gap-2"><ProviderIcon name={t.provider} size={24} />{t.provider}</span></td><td><StatusPill status={t.status} /></td><td>{relativeDate(t.createdAt)}</td><td><button onClick={() => setSelected(t.id)} className="admin-btn admin-btn-soft h-[32px] px-3 text-[10px]"><Eye size={13} /> Details</button></td></tr>)}</Table></Card>
      <Modal open={Boolean(tx)} title="Transaction details" onClose={() => setSelected(null)}>{tx && <div className="space-y-2"><DetailRow label="Reference" value={tx.reference} /><DetailRow label="Member" value={tx.memberName} /><DetailRow label="Amount" value={money(tx.amount, tx.currency)} /><DetailRow label="Provider" value={tx.provider} /><DetailRow label="Method" value={tx.method} /><DetailRow label="Status" value={<StatusPill status={tx.status} />} /><DetailRow label="Created" value={adminDate(tx.createdAt)} /></div>}</Modal>
    </div>
  );
}

function PaymentLinksView() {
  const { data } = useAdmin();
  const [copied, setCopied] = useState("");
  if (!data) return null;
  return (
    <div><PageHeader title="Payment links" subtitle="Hosted checkout links from the merchant app" kicker="CHECKOUT" actions={<span className="admin-pill blue">{data.clientLinks.length} links</span>} /><Card><Table headers={["Title", "Slug", "Amount", "Status", "Views", ""]} empty={data.clientLinks.length === 0}>{data.clientLinks.map((l) => <tr key={l.id}><td className="font-bold text-[#17213d]">{l.title}</td><td className="font-mono text-[11px]">/pay/{l.slug}</td><td>{money(l.amount, l.currency)}</td><td><StatusPill status={l.status} /></td><td>{l.views}</td><td className="flex gap-2"><button onClick={() => { void navigator.clipboard?.writeText(`/pay/${l.slug}`); setCopied(String(l.id)); }} className="admin-btn admin-btn-soft h-[32px] px-3 text-[10px]">{copied === String(l.id) ? <Check size={13} /> : <Copy size={13} />}</button><a href={`/pay/${l.slug}`} target="_blank" rel="noreferrer" className="admin-btn admin-btn-soft h-[32px] px-3 text-[10px]"><ExternalLink size={13} /></a></td></tr>)}</Table></Card></div>
  );
}

function RefundsView() {
  const { data, action } = useAdmin();
  if (!data) return null;
  return <div><PageHeader title="Refunds & disputes" subtitle="Review and resolve payment disputes" kicker="OPERATIONS" actions={<span className="admin-pill yellow">{data.metrics.pendingRefunds} pending</span>} /><Card><Table headers={["Reference", "Member", "Amount", "Reason", "Status", ""]} empty={data.refunds.length === 0}>{data.refunds.map((r) => <tr key={r.id}><td className="font-mono text-[11px]">{r.reference}</td><td>{r.memberName}</td><td>{money(r.amount, r.currency)}</td><td>{r.reason}</td><td><StatusPill status={r.status} /></td><td>{r.status === "pending" && <div className="flex gap-2"><button onClick={() => void action("refunds", "approve", r.id)} className="admin-btn h-[32px] px-3 text-[10px] text-[#17854d]">Approve</button><button onClick={() => void action("refunds", "reject", r.id)} className="admin-btn admin-btn-danger h-[32px] px-3 text-[10px]">Reject</button></div>}</td></tr>)}</Table></Card></div>;
}

function UpdatesView() {
  const { data, action } = useAdmin();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<AdminUpdate | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  if (!data) return null;
  const openCreate = () => { setEdit(null); setTitle(""); setBody(""); setOpen(true); };
  const openEdit = (item: AdminUpdate) => { setEdit(item); setTitle(item.title); setBody(item.body); setOpen(true); };
  return (
    <div><PageHeader title="Updates & media" subtitle="Announcements, corrections and opportunities" kicker="COMMUNICATION" actions={<button onClick={openCreate} className="admin-btn admin-btn-primary"><Plus size={16} /> New publication</button>} />
      <div className="space-y-3">{data.updates.length === 0 && <Card><Empty text="No publications yet." /></Card>}{data.updates.map((u) => <Card key={u.id} className="flex flex-wrap items-center gap-4 p-4"><img src={u.imageUrl} alt="" className="h-[62px] w-[86px] rounded-[10px] object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-[14px] font-extrabold text-[#17213d]">📌 {u.title}</p><p className="mt-1 text-[11px] text-[#8b96b0]">{u.category} · {u.mediaCount} média(s) · {adminDate(u.scheduledAt, false)}</p><div className="mt-2"><StatusPill status={u.status} label={u.status === "published" ? "Publié" : undefined} /></div></div><div className="flex gap-2"><button onClick={() => openEdit(u)} className="admin-btn admin-btn-soft h-[36px] w-[36px] px-0"><FileText size={15} /></button><button onClick={() => void action("updates", "toggle", u.id)} className="admin-btn admin-btn-soft h-[36px] w-[36px] px-0"><Eye size={15} /></button><button onClick={() => void action("updates", "pin", u.id)} className="admin-btn admin-btn-soft h-[36px] w-[36px] px-0"><Star size={15} /></button><button onClick={() => void action("updates", "delete", u.id)} className="admin-btn admin-btn-danger h-[36px] w-[36px] px-0"><Trash2 size={15} /></button></div></Card>)}</div>
      <Modal open={open} title={edit ? "Edit publication" : "New publication"} onClose={() => setOpen(false)}><div className="space-y-3"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="admin-input" /><textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message" className="h-24 w-full resize-none rounded-[12px] border border-[#dce5f3] p-3 text-[13px]" /><button onClick={() => { if (edit) void action("updates", "update", edit.id, { title, body }); else void action("updates", "create", 0, { title, body, category: "À venir", status: "draft" }); setOpen(false); }} className="admin-btn admin-btn-primary w-full">Save</button></div></Modal>
    </div>
  );
}

function NotificationsView() {
  const { data, action } = useAdmin();
  if (!data) return null;
  return <div><PageHeader title="Notifications" subtitle="Operational alerts and system messages" kicker="INBOX" actions={<button onClick={() => void action("notifications", "readAll", 0)} className="admin-btn admin-btn-soft"><Check size={15} /> Mark all read</button>} /><div className="space-y-3">{data.notifications.length === 0 && <Card><Empty text="Inbox is clear." /></Card>}{data.notifications.map((n) => <Card key={n.id} className={`flex items-center gap-4 p-4 ${n.isRead ? "" : "border-[#ffd66b] bg-[#fffdf6]"}`}><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef2fa]"><Bell size={17} /></span><div className="min-w-0 flex-1"><p className="text-[13px] font-extrabold text-[#17213d]">{n.title}</p><p className="mt-1 text-[12px] text-[#6d7d9e]">{n.message}</p><p className="mt-1 text-[10px] text-[#8b96b0]">{adminDate(n.createdAt)}</p></div>{!n.isRead && <button onClick={() => void action("notifications", "read", n.id)} className="admin-btn admin-btn-soft h-[32px] px-3 text-[10px]">Mark read</button>}<button onClick={() => void action("notifications", "delete", n.id)} className="admin-btn admin-btn-danger h-[32px] w-[32px] px-0"><X size={14} /></button></Card>)}</div></div>;
}

function ReviewsView() {
  const { data, action } = useAdmin();
  if (!data) return null;
  return <div><PageHeader title="Reviews" subtitle="Moderate public merchant reviews" kicker="TRUST & SAFETY" /><Card><Table headers={["Author", "Rating", "Comment", "Status", ""]} empty={data.reviews.length === 0}>{data.reviews.map((r) => <tr key={r.id}><td className="font-bold">{r.author}</td><td>{"★".repeat(r.rating)}</td><td>{r.comment}</td><td><StatusPill status={r.status} /></td><td><button onClick={() => void action("reviews", r.status === "published" ? "hide" : "publish", r.id)} className="admin-btn admin-btn-soft h-[32px] px-3 text-[10px]">{r.status === "published" ? "Hide" : "Publish"}</button></td></tr>)}</Table></Card></div>;
}

function SupportView() {
  const { data, action } = useAdmin();
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  if (!data) return null;
  const rows = data.tickets.filter((t) => filter === "all" || t.status === filter);
  const ticket: AdminTicket | undefined = data.tickets.find((t) => t.id === selected);
  return <div><PageHeader title="Support tickets" subtitle="Merchant support queue" kicker="HELPDESK" actions={<span className="admin-pill red">{data.metrics.openTickets} open</span>} /><Card className="mb-4 p-4"><FilterPills options={["all", "open", "pending", "closed"]} value={filter} onChange={setFilter} /></Card><div className="grid gap-4 lg:grid-cols-[1fr_.8fr]"><Card><Table headers={["Subject", "Requester", "Priority", "Status", ""]} empty={rows.length === 0}>{rows.map((t) => <tr key={t.id}><td className="font-bold">{t.subject}</td><td>{t.requester}</td><td><StatusPill status={t.priority} /></td><td><StatusPill status={t.status} /></td><td><button onClick={() => setSelected(t.id)} className="admin-btn admin-btn-soft h-[32px] px-3 text-[10px]">Open</button></td></tr>)}</Table></Card><Card className="p-5">{!ticket ? <Empty text="Select a ticket to respond." /> : <><h2 className="text-[16px] font-extrabold text-[#17213d]">{ticket.subject}</h2><p className="mt-1 text-[12px] text-[#8b96b0]">{ticket.requester} · {adminDate(ticket.createdAt)}</p><div className="mt-4 rounded-[12px] bg-[#f5f8ff] p-4 text-[13px] text-[#4b5875]">{ticket.lastMessage || "No message yet."}</div><textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Admin reply..." className="mt-4 h-24 w-full resize-none rounded-[12px] border border-[#dce5f3] p-3 text-[13px]" /><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => { void action("tickets", "reply", ticket.id, { message: reply, status: "pending" }); setReply(""); }} className="admin-btn admin-btn-primary"><Save size={15} /> Send reply</button><button onClick={() => void action("tickets", "status", ticket.id, { status: "closed" })} className="admin-btn admin-btn-soft"><Check size={15} /> Close</button></div></>}</Card></div></div>;
}

function MonitoringView() {
  const { data, action, refresh } = useAdmin();
  if (!data) return null;
  const m = data.metrics;
  const failedWebhooks = data.webhooks.filter((w) => w.status === "failed");
  const cards = [
    ["Database", m.databaseOnline ? "Online" : "Offline", `${m.databaseLatency} ms response time`, m.databaseOnline ? "green" : "red"],
    ["Gateway (Mobile Money)", m.gatewayStatus === "online" ? "Reachable" : "Unreachable", m.gatewayLabel, m.gatewayStatus === "online" ? "green" : "red"],
    ["Mode", m.mode, "System mode", "green"],
    ["Failed webhooks", m.failedWebhooks, "Last 24h", m.failedWebhooks ? "red" : "green"],
    ["Requests · 24h", m.requests24h, "API calls", "navy"],
    ["Client errors (4xx)", m.clientErrors, "Last 24h", m.clientErrors ? "yellow" : "green"],
    ["Server errors (5xx)", m.serverErrors, "Last 24h", m.serverErrors ? "red" : "green"],
    ["avg latency", `${m.avgLatency} ms`, "API requests", "navy"],
  ] as const;
  return (
    <div><PageHeader title="Monitoring" subtitle="System health, API traffic and webhook delivery" kicker="OBSERVABILITY" actions={<button onClick={() => { void action("monitoring", "purge", 0); setTimeout(() => void refresh(), 250); }} className="admin-btn admin-btn-soft"><Trash2 size={15} /> Purge logs &gt; 30 days</button>} />
      <div className="grid gap-3 sm:grid-cols-2">{cards.map(([label, value, note, tone]) => <Card key={label} className="p-4"><p className="admin-mini-label">{label}</p><p className="mt-2 text-[18px] font-extrabold" style={{ color: tone === "red" ? "#d43c4c" : tone === "green" ? "#17854d" : tone === "yellow" ? "#c28a05" : "#17213d" }}>{value}</p><p className="mt-1 text-[11px] text-[#8b96b0]">{note}</p></Card>)}</div>
      <h2 className="mt-7 text-[13px] font-extrabold text-[#17213d]">Top endpoints · 24h</h2><Card className="mt-2"><Table headers={["Endpoint", "Requests"]} empty={data.apiRequests.length === 0}>{Object.entries(data.apiRequests.reduce<Record<string, number>>((acc, r) => { acc[r.endpoint] = (acc[r.endpoint] ?? 0) + 1; return acc; }, {})).map(([endpoint, count]) => <tr key={endpoint}><td className="font-mono text-[11px]">{endpoint}</td><td>{count}</td></tr>)}</Table>{data.apiRequests.length === 0 && <p className="pb-4 text-center text-[11px] text-[#8b96b0]">No traffic yet.</p>}</Card>
      <h2 className="mt-7 text-[13px] font-extrabold text-[#17213d]">Failed webhook deliveries</h2><Card className="mt-2"><Table headers={["Event", "URL", "HTTP", "Attempts", "When"]} empty={failedWebhooks.length === 0}>{failedWebhooks.map((w) => <tr key={w.id}><td>{w.event}</td><td className="font-mono text-[11px]">{w.url}</td><td>{w.httpStatus}</td><td>{w.attempts}</td><td>{relativeDate(w.createdAt)}</td></tr>)}</Table>{failedWebhooks.length === 0 && <p className="pb-4 text-center text-[11px] text-[#17854d]">All webhooks delivered ✓</p>}</Card>
      <h2 className="mt-7 text-[13px] font-extrabold text-[#17213d]">Latest API requests</h2><Card className="mt-2"><Table headers={["Status", "Request", "Env", "Latency", "Error", "When"]} empty={data.apiRequests.length === 0}>{data.apiRequests.slice(0, 10).map((r) => <tr key={r.id}><td><StatusPill status={String(r.statusCode)} /></td><td className="font-mono text-[11px]">{r.endpoint}</td><td>{r.env}</td><td>{r.latency} ms</td><td>{r.error}</td><td>{relativeDate(r.createdAt)}</td></tr>)}</Table>{data.apiRequests.length === 0 && <p className="pb-4 text-center text-[11px] text-[#8b96b0]">No requests logged yet.</p>}</Card>
    </div>
  );
}

function AuditView() {
  const { data } = useAdmin();
  const [query, setQuery] = useState("");
  if (!data) return null;
  const rows = data.audit.filter((a) => `${a.actor} ${a.action} ${a.target} ${a.severity}`.toLowerCase().includes(query.toLowerCase()));
  return <div><PageHeader title="Audit log" subtitle="Every admin action is recorded independently" kicker="SECURITY" /><Card className="mb-4 p-4"><SearchInput value={query} onChange={setQuery} placeholder="Search actor, action or target..." /></Card><Card><Table headers={["When", "Actor", "Action", "Target", "Severity", "IP"]} empty={rows.length === 0}>{rows.map((a) => <tr key={a.id}><td>{adminDate(a.createdAt)}</td><td>{a.actor}</td><td className="font-bold">{a.action}</td><td>{a.target}</td><td><StatusPill status={a.severity} /></td><td className="font-mono text-[11px]">{a.ip}</td></tr>)}</Table></Card></div>;
}

function MerchantAppView() {
  const { data } = useAdmin();
  if (!data) return null;
  const url = data.deployment.clientAppUrl || "/";
  return <div><PageHeader title="Merchant app" subtitle="Separate client deployment overview" kicker="DEPLOYMENTS" actions={<a href={url} target={url.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="admin-btn admin-btn-primary"><ExternalLink size={15} /> Open merchant app</a>} /><div className="grid gap-4 sm:grid-cols-3"><MetricCard label="Client app" value="Online" note={url} icon={<Smartphone size={18} />} tone="green" /><MetricCard label="Database" value={data.deployment.databaseMode === "admin" ? "Admin DB" : "Shared DB"} note={data.metrics.databaseOnline ? "Connection healthy" : "Offline"} icon={<Database size={18} />} tone={data.metrics.databaseOnline ? "green" : "red"} /><MetricCard label="Provider" value={data.deployment.providerPrimaryConfigured ? "Live" : "Demo"} note={`Backup ${data.deployment.providerBackupConfigured ? "live" : "demo"}`} icon={<Server size={18} />} tone={data.deployment.providerPrimaryConfigured ? "green" : "yellow"} /></div><Card className="mt-5 p-6"><h2 className="text-[16px] font-extrabold text-[#17213d]">Deployment isolation</h2><p className="mt-2 text-[13px] leading-relaxed text-[#6d7d9e]">This admin console uses a separate cookie (<code>sdkpay_admin_session</code>), separate admin users/sessions tables and a dedicated <code>/api/admin/*</code> namespace. Set <code>ADMIN_ONLY_DEPLOYMENT=1</code> on the admin Vercel project to redirect all non-admin routes here, and optionally point <code>ADMIN_DATABASE_URL</code> to a separate database.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><DetailRow label="Session" value={data.session.email} /><DetailRow label="Role" value={data.session.role} /><DetailRow label="Environment" value={data.deployment.environment} /><DetailRow label="Client URL" value={url} /></div></Card></div>;
}

function DocsView() {
  const { data } = useAdmin();
  if (!data) return null;
  return <div><PageHeader title="Admin docs" subtitle="Independent API and deployment reference" kicker="DOCUMENTATION" /><div className="grid gap-4 lg:grid-cols-2"><Card className="p-5"><h2 className="text-[16px] font-extrabold">Admin API</h2><div className="admin-doc-box mt-3">{`POST /api/admin/auth/login\nPOST /api/admin/auth/logout\nGET  /api/admin/session\nGET  /api/admin/data\nPOST /api/admin/action`}</div><p className="mt-3 text-[12px] leading-relaxed text-[#6d7d9e]">Every action accepts <code>{`{ entity, action, id, payload }`}</code> and writes an audit log entry.</p></Card><Card className="p-5"><h2 className="text-[16px] font-extrabold">Deployment variables</h2><div className="admin-doc-box mt-3">{`ADMIN_ONLY_DEPLOYMENT=1\nADMIN_DATABASE_URL=postgresql://...\nADMIN_EMAIL=you@domain.com\nADMIN_PASSWORD=strong-secret\nNEXT_PUBLIC_CLIENT_APP_URL=https://client.app\nADMIN_SESSION_TTL_DAYS=7`}</div><p className="mt-3 text-[12px] text-[#6d7d9e]">Never expose admin credentials to the browser. All admin API calls stay server-side.</p></Card></div><Card className="mt-4 p-5"><h2 className="text-[16px] font-extrabold">Provider routing</h2><p className="mt-2 text-[13px] leading-relaxed text-[#6d7d9e]">Ashtechpay Direct API is primary for Mobile Money, Saaspay.me is the fallback, and Ashtechpay is always used for crypto. Current status: primary {data.deployment.providerPrimaryConfigured ? "live" : "demo"}, backup {data.deployment.providerBackupConfigured ? "live" : "demo"}.</p><a href="/docs/direct" target="_blank" rel="noreferrer" className="admin-btn admin-btn-soft mt-4"><FileText size={15} /> Open integration documentation</a></Card></div>;
}

function SettingsView() {
  const { data, action } = useAdmin();
  const [maintenance, setMaintenance] = useState(false);
  const [supportEmail, setSupportEmail] = useState("");
  useEffect(() => {
    if (!data) return;
    setMaintenance(data.settings.find((s) => s.key === "maintenanceMode")?.value === "true");
    setSupportEmail(data.settings.find((s) => s.key === "supportEmail")?.value ?? "support@sdkpay.com");
  }, [data]);
  if (!data) return null;
  return <div><PageHeader title="Admin settings" subtitle="Session, security and deployment preferences" kicker="CONFIGURATION" /><div className="grid gap-4 lg:grid-cols-2"><Card className="p-5"><h2 className="text-[16px] font-extrabold">Session</h2><div className="mt-3"><DetailRow label="Admin" value={data.session.email} /><DetailRow label="Role" value={data.session.role} /><DetailRow label="Last login" value={adminDate(data.session.lastLoginAt)} /><DetailRow label="Database" value={data.deployment.databaseMode} /><DetailRow label="Deployment" value={data.deployment.adminOnly ? "Admin only" : "Combined preview"} /></div></Card><Card className="p-5"><h2 className="text-[16px] font-extrabold">Operational preferences</h2><div className="mt-4 flex items-center justify-between rounded-[12px] border border-[#e2e9f5] px-4 py-3"><div><p className="text-[13px] font-bold text-[#25314d]">Maintenance mode</p><p className="text-[11px] text-[#8b96b0]">Display a maintenance banner on the client app.</p></div><button onClick={() => { const next = !maintenance; setMaintenance(next); void action("settings", "update", 0, { key: "maintenanceMode", value: String(next) }); }} className={`relative h-[30px] w-[54px] rounded-full ${maintenance ? "bg-[#ffb800]" : "bg-[#dce5f3]"}`}><span className={`absolute top-[3px] h-6 w-6 rounded-full bg-white transition-all ${maintenance ? "left-[26px]" : "left-[3px]"}`} /></button></div><label className="mt-4 block text-[12px] font-bold text-[#5d6882]">Support email<input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="admin-input mt-2" /></label><button onClick={() => void action("settings", "update", 0, { key: "supportEmail", value: supportEmail })} className="admin-btn admin-btn-primary mt-4"><Save size={15} /> Save preferences</button></Card></div></div>;
}
