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
        <Link href="/admin/kyc" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/45 transition hover:text-white"><ChevronLeft size={16} /> Back to queue</Link>
        <span className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-widest ${sub.status === "approved" ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-400" : sub.status === "rejected" ? "border-red-400/40 bg-red-500/10 text-red-400" : "border-amber-400/40 bg-amber-500/10 text-amber-300"}`}>
          {sub.status === "approved" ? <BadgeCheck size={13} /> : sub.status === "rejected" ? <ShieldX size={13} /> : <Clock3 size={13} />} {sub.status}
        </span>
      </div>

      <h1 className="mt-3 text-[26px] font-black tracking-tight text-white">Review submission</h1>
      <p className="text-[12.5px] text-white/40">{sub.fullName} · <span className="font-mono text-[11px]">{sub.docNumber}</span></p>

      <div className="mt-5 grid gap-4 xl:grid-cols-5">
        {/* documents */}
        <div className="grid gap-3 sm:grid-cols-2 xl:col-span-3">
          {images.filter((i) => i.src).map((img) => (
            <figure key={img.label} className={`overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] ${img.label.startsWith("Selfie") ? "sm:col-span-2" : ""}`}>
              <a href={img.src ?? "#"} target="_blank" rel="noreferrer" className="group relative block" title="Open full size">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src ?? ""} alt={img.label} className={`w-full bg-black/40 object-contain ${img.label.startsWith("Selfie") ? "h-80" : "h-64"}`} />
                <span className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-xl bg-black/60 text-white opacity-0 backdrop-blur transition group-hover:opacity-100"><ZoomIn size={17} /></span>
              </a>
              <figcaption className="border-t border-white/5 px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/35">{img.label}</figcaption>
            </figure>
          ))}
        </div>

        {/* decision column */}
        <div className="space-y-4 xl:col-span-2">
          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
            <p className="flex items-center gap-2 text-[13px] font-extrabold text-white/80"><DocIcon size={16} className="text-[#FFBD0D]" /> Verification request</p>
            <dl className="mt-3 divide-y divide-white/5 text-[12px]">
              {[
                ["Full name", sub.fullName],
                ["Date of birth", sub.dateOfBirth ?? "—"],
                ["Document", docLabel(sub.docType)],
                ["Document no.", sub.docNumber],
                ["Submitted", sub.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 py-2"><dt className="text-white/40">{k}</dt><dd className="text-right font-bold text-white/85">{v}</dd></div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
            <p className="text-[13px] font-extrabold text-white/80">Account profile</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFBD0D]/15 text-[13px] font-black text-[#FFBD0D]">{user.fullName.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}</span>
              <span><span className="block text-[14px] font-extrabold text-white">{user.fullName}</span><span className="block text-[11px] text-white/40">@{user.username} · {user.publicId}</span></span>
            </div>
            <dl className="mt-3 divide-y divide-white/5 text-[12px]">
              {[["Email", user.email], ["Phone", user.phone ?? "—"], ["Country", user.country ?? "—"], ["Account created", user.createdAt.toLocaleDateString("en-GB", { dateStyle: "medium", timeZone: "UTC" })]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 py-2"><dt className="text-white/40">{k}</dt><dd className="text-right font-semibold text-white/80">{v}</dd></div>
              ))}
            </dl>
            <Link href={`/admin/users/${user.id}`} className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#FFBD0D] hover:underline">Open full user profile →</Link>
          </section>

          {decided ? (
            <section className={`rounded-2xl border p-5 ${sub.status === "approved" ? "border-emerald-400/30 bg-emerald-500/[0.07]" : "border-red-400/30 bg-red-500/[0.07]"}`}>
              <p className="text-[13px] font-extrabold text-white/80">Decision recorded</p>
              <p className="mt-1 text-[12px] leading-relaxed text-white/55">
                {sub.status === "approved" ? "This identity was approved." : `Rejected: ${sub.rejectionReason ?? "—"}`}
                {sub.reviewedBy && <><br />by {sub.reviewedBy}{sub.reviewedAt ? ` · ${sub.reviewedAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC` : ""}</>}
              </p>
            </section>
          ) : (
            <section className="space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
              <p className="text-[13px] font-extrabold text-white/80">Decision</p>
              <ApproveButton submissionId={sub.id} />
              <div className="border-t border-white/5 pt-4"><RejectForm submissionId={sub.id} /></div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
