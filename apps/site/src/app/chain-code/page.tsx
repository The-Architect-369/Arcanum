export const metadata = { title: "Get Chain Code — $1" };

export default function ChainCodePage() {
  return (
    <main className="section">
      <div className="card p-6 md:p-10">
        <h1 className="h1">Get Chain Code — $1</h1>
        <p className="mt-3 opacity-90">
          Chain Code is your verified key to the ArcNet. It proves you&apos;re real,
          unlocks your Hope node, and grants full access to the ecosystem.
        </p>

        <ol className="mt-6 list-decimal list-inside space-y-2 opacity-90">
          <li>Use any email to create your account.</li>
          <li>Buy Chain Code for <b>$1</b> to activate your Hope node.</li>
          <li>Enter the ArcNet: Nexus (community), Tempus (cosmic time), Text (chat), and Vitae (growth).</li>
        </ol>

        <div className="mt-8 flex flex-wrap gap-3">
          <a className="carousel-btn" href="https://app.arcanum.io/chain-code">Open in App</a>
          <a className="carousel-btn" href="/downloads">Download Options</a>
        </div>

        <p className="mt-6 text-sm opacity-70">
          Payments are processed in-app. If you can&apos;t open the app, use the Download options to install first.
        </p>
      </div>
    </main>
  );
}
