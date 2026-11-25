import { desc, eq } from "drizzle-orm";
import Gate from "@/components/gate";
import KycFlow, { type KycSubmissionView } from "@/components/kyc-flow";
import { requireUser } from "@/lib/session";
import { db } from "@/db";
import { kycSubmissions } from "@/db/schema";

export default async function KycPage() {
  const user = await requireUser();
  const [latest] = await db.select().from(kycSubmissions).where(eq(kycSubmissions.userId, user.id)).orderBy(desc(kycSubmissions.createdAt)).limit(1);

  const view: KycSubmissionView | null = latest
    ? {
        docType: latest.docType,
        docNumber: latest.docNumber,
        fullName: latest.fullName,
        dateOfBirth: latest.dateOfBirth,
        frontImage: latest.frontImage,
        backImage: latest.backImage,
        selfieImage: latest.selfieImage,
        createdAt: latest.createdAt.toISOString(),
      }
    : null;

  return (
    <Gate>
      <KycFlow
        status={user.kycStatus}
        fullName={user.fullName}
        phone={user.phone}
        rejectionReason={user.kycRejectionReason ?? null}
        latest={view}
      />
    </Gate>
  );
}
