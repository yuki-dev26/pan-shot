import { VideoStudio } from "@/components/VideoStudio";

export default function Home() {
  return (
    <main className="relative z-1 flex min-h-dvh flex-col gap-[clamp(1.5rem,4vw,2.75rem)] p-[clamp(1.25rem,3vw,2.5rem)]">
      <header className="grid max-w-3xl animate-rise gap-3">
        <h1 className="m-0 bg-linear-to-br from-white via-accent to-accent-2 bg-clip-text font-display text-[clamp(3.4rem,10vw,6.5rem)] leading-[0.9] font-extrabold tracking-[-0.04em] text-transparent">
          QuickScene
        </h1>
        <p className="m-0 max-w-md text-[clamp(1rem,2.2vw,1.15rem)] leading-relaxed text-muted">
          一枚絵の見どころを指定するだけで、自然なカットイン動画になるツール。
        </p>
      </header>

      <VideoStudio />

      <footer className="mt-auto animate-rise text-sm tracking-wide text-muted [animation-delay:140ms]">
        STILL → CUT-IN → PULL BACK · LOCAL ONLY
      </footer>
    </main>
  );
}
