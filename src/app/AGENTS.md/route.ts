import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { cwd } from "node:process";

export const dynamic = "force-static";

/** Serves the repo-root AGENTS.md as text/plain (single source of truth). */
export function GET() {
  let body = "AGENTS.md not found";
  try {
    body = readFileSync(`${cwd()}/AGENTS.md`, "utf8");
  } catch {
    /* fall through to 404-ish content */
  }
  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
