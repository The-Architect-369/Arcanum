export default function ArchitectGate({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="public-home updates-app architect-app">
      <header className="current-header">
        <a className="current-lockup" href="https://updates.the-arcanum.net/">
          <img src="/logo-arcanum.svg" width="36" height="36" alt="" />
          <span>
            <strong>Architect</strong>
            <small>Protected workspace</small>
          </span>
        </a>
      </header>
      <main id="architect-main" className="architect-reading">
        <div className="architect-login">
          <h1>{title}</h1>
          {children}
          <p>
            <a href="https://updates.the-arcanum.net/">
              Return to public Current ↗
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
