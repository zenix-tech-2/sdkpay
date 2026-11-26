import { getProviderStatus } from "@/lib/payment-providers";

export async function GET() {
  return Response.json(getProviderStatus());
}
