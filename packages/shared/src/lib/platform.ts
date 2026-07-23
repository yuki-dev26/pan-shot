export function isDesktopApp(): boolean {
  if (typeof window === "undefined") return false;
  const desktop = (window as Window & { panshot?: { platform: string } })
    .panshot;
  if (desktop != null) return true;
  return /Electron/i.test(navigator.userAgent);
}
