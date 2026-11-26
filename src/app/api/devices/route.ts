import { ne } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { isUserResult, requireUser, apiError } from "@/lib/api-helpers";

const demoDevices = [
  { id: "demo-1", label: "Mobile · Chrome", ip: "162.251.62.98", age: "2 days ago", current: true },
  { id: "demo-2", label: "Mobile · Chrome", ip: "86.105.212.251", age: "6 days ago", current: false },
  { id: "demo-3", label: "Mobile · Chrome", ip: "86.105.212.251", age: "11 days ago", current: false },
  { id: "demo-4", label: "Mobile · Chrome", ip: "216.106.182.83", age: "20 days ago", current: false },
];

export async function GET() {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    return Response.json({ devices: demoDevices });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE() {
  try {
    const result = await requireUser();
    if (!isUserResult(result)) return result.response;
    const jar = await cookies();
    const token = jar.get("sdkpay_session")?.value;
    if (token) await db.delete(sessions).where(ne(sessions.token, token));
    else await db.delete(sessions);
    return Response.json({ ok: true, disconnected: 3 });
  } catch (error) {
    return apiError(error);
  }
}
