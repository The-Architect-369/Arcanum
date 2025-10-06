export default function Landing() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#070A14] p-6 text-white">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <h1 className="text-3xl font-semibold">Arcanum</h1>
        <p className="mt-3 text-white/70">
          The ArcNet — decentralized, cosmic, community-owned.
        </p>

        <a
          href="https://app.arcanum.io/?install=1"
          className="mt-8 inline-block rounded-2xl bg-indigo-500/90 px-6 py-3 font-medium hover:bg-indigo-500"
        >
          Get the App
        </a>

        <p className="mt-4 text-sm text-white/60">
          Opens the ARCnet app and attempts install if your browser supports it.
        </p>

        <div className="mt-8 text-xs text-white/50">
          For desktop preview, install on your phone first — ARCnet is mobile-only during development.
        </div>
      </div>
    </main>
  );
}
