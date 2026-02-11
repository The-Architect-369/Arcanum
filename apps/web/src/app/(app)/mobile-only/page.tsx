export default function MobileOnly() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <h1 className="text-xl font-semibold">ARCnet is Mobile-Only</h1>
        <p className="mt-3 text-white/70">
          Open <span className="font-medium">app.arcanum.io</span> on your phone to use ARCnet, or install it from your device’s browser.
        </p>
      </div>
    </main>
  );
}
