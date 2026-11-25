import { handleProviderWebhook } from "@/lib/webhooks";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const raw = await req.text();
  const result = await handleProviderWebhook("saspay", raw, req.headers);
  const status = "status" in result && typeof result.status === "number" ? result.status : result.ok ? 200 : 400;
  return Response.json(result, { status });
}
