import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ashtechpay } from "@/lib/providers/ashtechpay";
import { saaspay } from "@/lib/providers/saaspay";
import { providerMode } from "@/lib/providers/types";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  return NextResponse.json({
    mode: providerMode(),
    providers: [
      {
        name: "ashtechpay",
        label: "AshTechPay Direct",
        role: "Primary · Mobile Money + crypto",
        configured: ashtechpay.isConfigured(),
        sandbox: ashtechpay.isSandbox(),
        coverage: ashtechpay.coverage(),
      },
      {
        name: "saaspay",
        label: "SasPay",
        role: "Backup · Mobile Money fallback",
        configured: saaspay.isConfigured(),
        sandbox: saaspay.isSandbox(),
        coverage: saaspay.coverage(),
      },
    ],
    rules: [
      "Crypto is always processed via AshTechPay Direct",
      "Mobile Money uses AshTechPay when the country + operator is covered",
      "SasPay automatically takes over for uncovered countries/operators or on primary errors",
      "Without API keys, providers run in transparent demo simulation",
    ],
  });
}
