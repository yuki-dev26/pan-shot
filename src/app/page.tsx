import { VideoStudio } from "@/components/VideoStudio";

export default function Home() {
  return (
    <main className="relative z-1 flex min-h-dvh flex-col gap-4 p-[max(1rem,env(safe-area-inset-left))] pt-[max(0.75rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:gap-6 sm:p-[clamp(1.25rem,3vw,2.5rem)] sm:pt-[clamp(1rem,2.5vw,1.75rem)]">
      <header className="grid max-w-3xl animate-rise gap-1.5 sm:gap-2">
        <h1 className="m-0 max-w-full leading-none">
          <img
            src="/title.png"
            alt="PanShot"
            className="block h-auto w-[min(100%,14rem)] max-w-full select-none sm:w-[min(100%,18rem)] md:w-[min(100%,22rem)]"
            draggable={false}
          />
        </h1>
        <p className="m-0 font-display text-[clamp(1rem,4.5vw,1.45rem)] leading-snug tracking-tight text-ink text-pretty sm:whitespace-nowrap">
          イラストの見どころを指定するだけで、映えるカメラワーク動画に。
        </p>
        <p className="m-0 max-w-xl text-[0.9rem] leading-relaxed text-muted sm:text-[clamp(0.95rem,2vw,1.05rem)]">
          見どころを指定して、ブラウザだけでカメラワーク動画を書き出せます。
        </p>
      </header>

      <VideoStudio />

      <footer className="mt-auto animate-rise text-[0.7rem] tracking-wide text-muted wrap-break-word sm:text-sm [animation-delay:140ms]">
        STILL → CUT-IN → PULL BACK · LOCAL ONLY
      </footer>
    </main>
  );
}
