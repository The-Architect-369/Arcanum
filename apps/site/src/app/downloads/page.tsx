export const metadata = { title: "Downloads — Arcanum" };
export default function Downloads() {
  return (
    <main className="section">
      <div className="card p-6 md:p-10">
        <h1 className="h1">Download Arcanum</h1>
        <p className="mt-3 opacity-90">Mobile-first. Desktop builds coming after launch.</p>
        <ul className="mt-5 space-y-2 list-disc list-inside opacity-90">
          <li>Android (APK / Play Store)</li>
          <li>iOS (App Store)</li>
          <li>Open the app in browser: <a className="underline" href="https://app.arcanum.io">app.arcanum.io</a></li>
        </ul>
      </div>
    </main>
  );
}
