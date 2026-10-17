export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return "https://panshot.yukip02.com";
  return raw.replace(/\/$/, "");
}
