export type LinkInput = {
  title: string;
  description: string;
  amount: number;
  freeAmount: boolean;
  pdfUrl: string;
  allowedCountries: string;
  imageUrl: string;
  expiryDate: string;
  redirectUrl: string;
  iconEmoji: string;
  slugHint: string;
};

export function parseLinkInput(body: Record<string, unknown>): { values: LinkInput; error?: string } {
  const title = String(body.title ?? "").trim();
  const freeAmount = body.freeAmount === true || body.freeAmount === "true";
  const amount = freeAmount ? 0 : Math.round(Number(body.amount ?? 0));
  const slugHint = String(body.customSlug ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const values: LinkInput = {
    title,
    description: String(body.description ?? "").trim(),
    amount: Number.isFinite(amount) ? amount : 0,
    freeAmount,
    pdfUrl: String(body.pdfUrl ?? "").trim(),
    allowedCountries: Array.isArray(body.allowedCountries) ? body.allowedCountries.join(",") : String(body.allowedCountries ?? "all").trim() || "all",
    imageUrl: String(body.imageUrl ?? "").trim(),
    expiryDate: String(body.expiryDate ?? "").trim(),
    redirectUrl: String(body.redirectUrl ?? "").trim(),
    iconEmoji: String(body.iconEmoji ?? "🔗").trim() || "🔗",
    slugHint,
  };
  if (!title) return { values, error: "Le titre du lien est obligatoire" };
  if (!freeAmount && (!Number.isFinite(amount) || amount < 100)) return { values, error: "Le montant minimum est de 100 FCFA" };
  if (values.imageUrl.length > 8_000_000) return { values, error: "L'image est trop volumineuse (5 MB maximum)" };
  return { values };
}

export function linkColumns(values: LinkInput) {
  return {
    title: values.title,
    description: values.description,
    amount: values.amount,
    freeAmount: values.freeAmount,
    pdfUrl: values.pdfUrl,
    allowedCountries: values.allowedCountries,
    imageUrl: values.imageUrl,
    expiryDate: values.expiryDate,
    redirectUrl: values.redirectUrl,
    iconEmoji: values.iconEmoji,
  };
}
