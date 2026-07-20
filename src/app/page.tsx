import { VideoStudio } from "@/components/VideoStudio";

export default function Home() {
  return (
    <main className="relative z-1 flex min-h-dvh flex-col gap-5 p-[max(1rem,env(safe-area-inset-left))] pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:gap-[clamp(1.5rem,4vw,2.75rem)] sm:p-[clamp(1.25rem,3vw,2.5rem)]">
      <header className="grid max-w-3xl animate-rise gap-2 sm:gap-3">
        <h1 className="m-0 max-w-full bg-linear-to-br from-white via-accent to-accent-2 bg-clip-text font-display text-[clamp(1.7rem,8vw,6.5rem)] leading-[0.92] font-extrabold tracking-[-0.045em] text-transparent wrap-break-word sm:text-[clamp(2.75rem,10vw,6.5rem)]">
          QuickScene
        </h1>
        <p className="m-0 max-w-lg font-display text-[clamp(1rem,4.5vw,1.45rem)] leading-snug tracking-tight text-ink">
          イラストをおしゃれなカットイン映像に
        </p>
        <p className="m-0 max-w-xl text-[0.9rem] leading-relaxed text-muted sm:text-[clamp(0.95rem,2vw,1.05rem)]">
          イラストにカットイン演出を加えて、おしゃれな動画に変換するツール
        </p>
      </header>

      <VideoStudio />

      <footer className="mt-auto animate-rise text-[0.7rem] tracking-wide text-muted wrap-break-word sm:text-sm [animation-delay:140ms]">
        STILL → CUT-IN → PULL BACK · LOCAL ONLY
      </footer>
    </main>
  );
}
