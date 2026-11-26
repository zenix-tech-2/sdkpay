import { getSessionUser } from "@/lib/auth";
import { publicUser } from "@/lib/auth";
import type { User } from "@/db/schema";

export async function requireUser(): Promise<{ user: User } | { response: Response }> {
  const user = await getSessionUser();
  if (!user) return { response: Response.json({ error: "Non authentifié" }, { status: 401 }) };
  return { user };
}

export function isUserResult(result: { user: User } | { response: Response }): result is { user: User } {
  return "user" in result;
}

export function meResponse(user: User) {
  return { user: publicUser(user) };
}

export function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Une erreur est survenue";
  return Response.json({ error: message }, { status: 500 });
}
