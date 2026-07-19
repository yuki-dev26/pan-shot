import { VideoStudio } from "@/components/VideoStudio";

export default function Home() {
  return (
    <main className="page">
      <header className="brand-block">
        <h1 className="brand">BAERU</h1>
        <p className="tagline">
          <strong>一枚絵を、バえる動画に。</strong>
          見どころへ寄って、切って、最後は全体へ引く。シンプルなカットイン演出をそのまま書き出せます。
        </p>
      </header>

      <VideoStudio />

      <footer className="foot">STILL → CUT-IN → PULL BACK · LOCAL ONLY</footer>
    </main>
  );
}
