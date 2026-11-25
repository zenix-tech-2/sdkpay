export function fmtAmount(n: number, decimals = 0): string {
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** 13248 → "13 248 FCFA" */
export function fmtFCFA(n: number, opts?: { signed?: boolean; currency?: string }) {
  const currency = opts?.currency ?? "FCFA";
  const abs = Math.abs(n);
  const body = `${fmtAmount(abs, abs % 1 !== 0 ? 2 : 0)} ${currency}`;
  if (!opts?.signed) return n < 0 ? `-${body}` : body;
  return `${n < 0 ? "-" : "+"}${body}`;
}

export function fmtUSDT(n: number, opts?: { signed?: boolean }) {
  const abs = Math.abs(n);
  const body = `${abs.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} USDT`;
  if (!opts?.signed) return n < 0 ? `-${body}` : body;
  return `${n < 0 ? "-" : "+"}${body}`;
}

export function fmtDateTime(d: Date): string {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).replace(",", " at") + " UTC";
}

/** "18 NOVEMBER 2026" */
export function fmtDayLabel(d: Date): string {
  return d
    .toLocaleString("en-GB", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" })
    .toUpperCase();
}

/** "22:50" */
export function fmtTime(d: Date): string {
  return d.toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" });
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function randomRef(prefix: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < 15; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${out}`;
}

export function shortSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function txTitle(t: { type: string; operator?: string | null }): string {
  switch (t.type) {
    case "deposit":
      return "Mobile Money Deposit";
    case "withdrawal":
      return "Withdrawal";
    case "internal_transfer":
      return "Internal transfer";
    case "mobile_money_send":
      return "Mobile Money Send";
    case "crypto_send":
      return "USDT Send";
    case "crypto_deposit":
      return "USDT Deposit";
    case "payment_received":
      return "Payment received";
    case "adjustment":
      return "Manual adjustment";
    default:
      return "Transaction";
  }
}
