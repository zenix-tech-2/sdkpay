export function formatMoney(value: number, currency = "XAF") {
  return `${new Intl.NumberFormat("fr-FR").format(value)} ${currency === "XAF" ? "FCFA" : currency}`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function formatUsdt(value: number, digits = 4) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}

export function formatXafDecimal(value: number) {
  return new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export function formatCountdown(seconds: number, withHours = false) {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  if (withHours) return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(secs)}` : `${minutes}:${pad(secs)}`;
}

export function randomCode(length = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
