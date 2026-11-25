import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ChevronLeft, IdCard, BookUser, CarFront, BadgeCheck, ShieldX, Clock3, ZoomIn } from "lucide-react";
import { db } from "@/db";
import { kycSubmissions, users } from "@/db/schema";
import { ApproveButton, RejectForm } from "@/components/admin-review-actions";

const docLabel = (t: string) => (t === "national_id" ? "National ID card" : t === "passport" ? "Passport" : "Driver's licence");
const docIcon = (t: string) => (t === "national_id" ? IdCard : t === "passport" ? BookUser : CarFront);

export default async function AdminKycReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db.select({ sub: kycSubmissions, user: users }).from(kycSubmissions).innerJoin(users, eq(users.id, kycSubmissions.userId)).where(eq(kycSubmissions.id, id)).limit(1);
  if (!row) notFound();
  const { sub, user } = row;
  const DocIcon = docIcon(sub.docType);
  const decided = sub.status !== "pending";

  const images: { label: string; src: string | null }[] = [
    { label: "Front — document", src: sub.frontImage },
    { label: "Back — document", src: sub.backImage },
    { label: "Selfie — liveness", src: sub.selfieImage },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/kyc" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 transition hover:text-ink"><ChevronLeft size={16} /> Back to queue</Link>
        <span className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-widest ${sub.status === "approved" ? "bg-emerald-100 text-emerald-700" : sub.status === "rejected" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-800"}`}>
          {sub.status === "approved" ? <BadgeCheck size={14} /> : sub.status === "rejected" ? <ShieldX size={14} /> : <Clock3 size={14} />} {sub.status}
        </span>
      </div>

      <h1 className="mt-3 text-[26px] font-extrabold tracking-tight text-ink">Review submission</h1>
      <p className="text-[13px] text-slate-500">{sub.fullName} · <span className="font-mono text-[12px]">{sub.docNumber}</span></p>

      <div className="mt-5 grid gap-5 xl:grid-cols-5">
        {/* documents */}
        <div className="grid gap-4 sm:grid-cols-2 xl:col-span-3">
          {images.filter((i) => i.src).map((img) => (
            <figure key={img.label} className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ${img.label.startsWith("Selfie") ? "sm:col-span-2" : ""}`}>
              <a href={img.src ?? "#"} target="_blank" rel="noreferrer" className="group relative block" title="Open full size">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src ?? ""} alt={img.label} className={`w-full object-contain bg-slate-100 ${img.label.startsWith("Selfie") ? "h-80" : "h-64"}`} />
                <span className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-xl bg-navy2/70 text-white opacity-0 backdrop-blur transition group-hover:opacity-100"><ZoomIn size={17} /></span>
              </a>
              <figcaption className="border-t border-slate-100 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">{img.label}</figcaption>
            </figure>
          ))}
        </div>

        {/* decision column */}
        <div className="space-y-4 xl:col-span-2">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-[14px] font-extrabold text-ink"><DocIcon size={17} className="text-navy3" /> Verification request</p>
            <dl className="mt-3 divide-y divide-slate-100 text-[13px]">
              {[
                ["Full name", sub.fullName],
                ["Date of birth", sub.dateOfBirth ?? "—"],
                ["Document", docLabel(sub.docType)],
                ["Document no.", sub.docNumber],
                ["Submitted", sub.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 py-2"><dt className="text-slate-400">{k}</dt><dd className="text-right font-bold text-ink">{v}</dd></div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <p className="text-[14px] font-extrabold text-ink">Account profile</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy/90 text-[15px] font-black text-gold">{user.fullName.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}</span>
              <span><span className="block text-[15px] font-extrabold text-ink">{user.fullName}</span><span className="block text-[12px] text-slate-500">@{user.username} · {user.publicId}</span></span>
            </div>
            <dl className="mt-3 divide-y divide-slate-100 text-[13px]">
              {[["Email", user.email], ["Phone", user.phone ?? "—"], ["Country", user.country ?? "—"], ["Account created", user.createdAt.toLocaleDateString("en-GB", { dateStyle: "medium", timeZone: "UTC" })]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 py-2"><dt className="text-slate-400">{k}</dt><dd className="text-right font-semibold text-ink">{v}</dd></div>
              ))}
            </dl>
          </section>

          {decided ? (
            <section className={`rounded-2xl border p-5 shadow-sm ${sub.status === "approved" ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
              <p className="text-[13px] font-extrabold text-ink">Decision recorded</p>
              <p className="mt-1 text-[12.5px] leading-snug text-slate-600">
                {sub.status === "approved" ? "This identity was approved." : `Rejected: ${sub.rejectionReason ?? "—"}`}
                {sub.reviewedBy && <><br />by {sub.reviewedBy}{sub.reviewedAt ? ` · ${sub.reviewedAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC` : ""}</>}
              </p>
            </section>
          ) : (
            <section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-[14px] font-extrabold text-ink">Decision</p>
              <ApproveButton submissionId={sub.id} />
              <div className="border-t border-slate-100 pt-3"><RejectForm submissionId={sub.id} /></div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
