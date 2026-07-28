import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 p-6 text-center">
      <p className="m-0 font-display text-6xl leading-none tracking-tight text-ink">
        404
      </p>
      <p className="m-0 max-w-sm font-sans text-sm leading-relaxed text-muted">
        This page could not be found. / ページが見つかりませんでした。
      </p>
      <Link
        href="/"
        className="border border-line px-4 py-2.5 font-sans text-sm text-ink transition-[background,border-color] hover:border-white/28 hover:bg-white/4"
      >
        PanShot
      </Link>
    </main>
  );
}
