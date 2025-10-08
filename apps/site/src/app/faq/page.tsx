export const metadata = { title: "FAQ — ARCnet" };

export default function FAQ() {
  return (
    <main className="section">
      <div className="card p-6 md:p-10 mt-20 space-y-8">
        <header id="top">
          <h1 className="h1">FAQ</h1>
          <p className="mt-3 opacity-80">Answers about activation, privacy, and the ArcNet.</p>
        </header>

        <section id="activate" aria-labelledby="activate-title" className="space-y-3">
          <h2 id="activate-title" className="h2">How does activation work?</h2>
          <p className="p opacity-85">
            You’ll create a decentralized identifier (DID), save a recovery method, and link your device and Hope companion.
          </p>
        </section>
      </div>
    </main>
  );
}
