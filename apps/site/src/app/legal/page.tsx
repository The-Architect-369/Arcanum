export const metadata = { title: "Legal — ARCnet" };

const LAST_UPDATED = "October 7, 2025";

export default function Legal() {
  return (
    <main className="section">
      <div className="card p-6 md:p-10 mt-20 space-y-10">
        <header>
          <h1 className="h1">Legal</h1>
          <p className="mt-3 opacity-80">
            Last updated: {LAST_UPDATED}. Please read these terms carefully. By using ARCnet / Arcanum (“we,” “us,” “our,” “ArcNet,” “Arcanum”),
            you agree to the Terms and acknowledge the Privacy and Cookie notices below.
          </p>
        </header>

        {/* ===================== TERMS ===================== */}
        <section id="terms" aria-labelledby="terms-title" className="space-y-6">
          <h2 id="terms-title" className="h2">Terms of Service</h2>

          <div className="space-y-4">
            <p className="p">
              These Terms of Service (“Terms”) govern your access to and use of our website, apps, software, and related services
              (collectively, the “Services”). If you do not agree to these Terms, do not use the Services.
            </p>

            <h3 className="text-xl font-semibold">1) Eligibility & Accounts</h3>
            <ul className="list-disc list-inside opacity-90 space-y-2">
              <li>You must be at least 13 years old (or the age of digital consent in your jurisdiction) to use the Services.</li>
              <li>You are responsible for maintaining the security of your device, passkeys, recovery phrases, and any linked wallet or DID credentials.</li>
              <li>We are <strong>non-custodial</strong>: you control your keys and identities. We cannot recover lost keys or funds.</li>
            </ul>

            <h3 className="text-xl font-semibold">2) Acceptable Use</h3>
            <ul className="list-disc list-inside opacity-90 space-y-2">
              <li>Do not engage in illegal activity, harassment, hate, or intellectual-property infringement.</li>
              <li>Do not attempt to hack, disrupt, or overload the Services or other users.</li>
              <li>Respect others’ privacy and follow applicable laws where you live.</li>
            </ul>

            <h3 className="text-xl font-semibold">3) Content & Intellectual Property</h3>
            <ul className="list-disc list-inside opacity-90 space-y-2">
              <li>Unless otherwise noted, the Services and their content are owned by Arcanum and protected by law.</li>
              <li>
                You retain ownership of content you submit; you grant us a non-exclusive, worldwide, royalty-free license to host and
                display it as needed to operate the Services.
              </li>
              <li>You are responsible for ensuring you have rights to the content you share.</li>
            </ul>

            <h3 className="text-xl font-semibold">4) Web3 / Token Disclaimers</h3>
            <ul className="list-disc list-inside opacity-90 space-y-2">
              <li><strong>No financial advice.</strong> Information provided is educational or entertainment in nature.</li>
              <li>Digital assets are volatile and risky. You assume all risks for transactions you initiate.</li>
              <li>We do not custody user assets. Network fees, slippage, and on-chain failures are outside our control.</li>
            </ul>

            <h3 className="text-xl font-semibold">5) Changes, Availability & Beta</h3>
            <ul className="list-disc list-inside opacity-90 space-y-2">
              <li>Features may change, be limited, or be discontinued at any time.</li>
              <li>Beta features may be unstable and can produce unexpected results.</li>
            </ul>

            <h3 className="text-xl font-semibold">6) Disclaimers & Limitation of Liability</h3>
            <p className="opacity-90">
              The Services are provided “AS IS” and “AS AVAILABLE.” To the fullest extent permitted by law, we disclaim all warranties,
              and we are not liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss of
              profits, data, goodwill, or other intangible losses.
            </p>

            <h3 className="text-xl font-semibold">7) Termination</h3>
            <p className="opacity-90">
              We may suspend or terminate access to the Services if you breach these Terms or for security and compliance reasons.
            </p>

            <h3 className="text-xl font-semibold">8) Governing Law & Dispute Resolution</h3>
            <p className="opacity-90">
              These Terms are governed by applicable U.S. law unless your local law requires otherwise. Any disputes will be resolved in
              a competent court in a venue we designate, unless mandatory local consumer protections apply. You and we each waive jury
              trial rights to the extent permitted by law.
            </p>

            <h3 className="text-xl font-semibold">9) Changes to the Terms</h3>
            <p className="opacity-90">
              We may update these Terms from time to time. We will change the “Last updated” date above and may provide additional notice
              where appropriate. Continued use of the Services means you accept the changes.
            </p>
          </div>
        </section>

        {/* ===================== PRIVACY ===================== */}
        <section id="privacy" aria-labelledby="privacy-title" className="space-y-6">
          <h2 id="privacy-title" className="h2">Privacy Policy</h2>

          <div className="space-y-4">
            <p className="p">
              This Privacy Policy explains how we handle information when you use the Services. We strive to collect the minimum data
              necessary and to prioritize user control, especially for decentralized identity (DID) and wallets.
            </p>

            <h3 className="text-xl font-semibold">1) Information We Collect</h3>
            <ul className="list-disc list-inside opacity-90 space-y-2">
              <li><strong>Account Basics:</strong> DID metadata you link, public wallet addresses, and optional profile data you provide.</li>
              <li><strong>Technical Data:</strong> IP address, device/browser type, approximate location (from IP), crash logs, and diagnostics.</li>
              <li><strong>Usage Data:</strong> Interactions with app features, non-identifying analytics, and performance metrics.</li>
              <li><strong>Content:</strong> Posts or uploads you choose to publish; storage location may be decentralized (e.g., IPFS).</li>
            </ul>

            <h3 className="text-xl font-semibold">2) How We Use Information</h3>
            <ul className="list-disc list-inside opacity-90 space-y-2">
              <li>Operate, maintain, and improve the Services and user safety.</li>
              <li>Provide support, respond to inquiries, and communicate updates.</li>
              <li>Detect, prevent, and address abuse, security, and technical issues.</li>
              <li>Comply with legal obligations where required.</li>
            </ul>

            <h3 className="text-xl font-semibold">3) How We Share Information</h3>
            <ul className="list-disc list-inside opacity-90 space-y-2">
              <li>With service providers under contract to support operations (e.g., hosting, analytics).</li>
              <li>With law enforcement or regulators when legally required.</li>
              <li>With your consent or at your direction (e.g., posting publicly to decentralized storage).</li>
              <li>We do <strong>not</strong> sell personal information.</li>
            </ul>

            <h3 className="text-xl font-semibold">4) Decentralized Identity & Wallets</h3>
            <ul className="list-disc list-inside opacity-90 space-y-2">
              <li>Private keys are your responsibility; we do not store or control them.</li>
              <li>Publishing to decentralized networks (e.g., IPFS) may make data effectively permanent and publicly accessible.</li>
            </ul>

            <h3 className="text-xl font-semibold">5) Data Retention</h3>
            <p className="opacity-90">
              We retain data only as long as necessary for the purposes above or as required by law. Some on-chain or decentralized
              data may be immutable and publicly accessible.
            </p>

            <h3 className="text-xl font-semibold">6) Your Choices & Rights</h3>
            <ul className="list-disc list-inside opacity-90 space-y-2">
              <li>Update or remove profile information you provide through in-app settings (where available).</li>
              <li>Disconnect linked accounts/wallets you no longer wish to associate.</li>
              <li>Contact us for access, correction, or deletion requests where applicable by law.</li>
            </ul>

            <h3 className="text-xl font-semibold">7) Children’s Privacy</h3>
            <p className="opacity-90">We do not knowingly collect personal information from children under 13.</p>

            <h3 className="text-xl font-semibold">8) International Users</h3>
            <p className="opacity-90">
              Information may be processed in the U.S. or other countries with different data protection laws than your country.
            </p>

            <h3 className="text-xl font-semibold">9) Changes to this Policy</h3>
            <p className="opacity-90">
              We may update this Privacy Policy from time to time. We will revise the “Last updated” date and may provide additional
              notice where appropriate.
            </p>
          </div>
        </section>

        {/* ===================== COOKIES ===================== */}
        <section id="cookies" aria-labelledby="cookies-title" className="space-y-6">
          <h2 id="cookies-title" className="h2">Cookie Notice</h2>

          <div className="space-y-4">
            <p className="p">
              We use cookies and similar technologies to provide and improve the Services, remember preferences, and perform analytics.
              You can control cookies through your browser settings. Disabling certain cookies may impact functionality.
            </p>

            <h3 className="text-xl font-semibold">Types of Cookies</h3>
            <ul className="list-disc list-inside opacity-90 space-y-2">
              <li><strong>Essential:</strong> Required for core features and security.</li>
              <li><strong>Performance/Analytics:</strong> Help us understand usage and improve the experience.</li>
              <li><strong>Preference:</strong> Remember settings such as language or theme.</li>
            </ul>
          </div>
        </section>

        {/* ===================== CONTACT ===================== */}
        <section id="contact" aria-labelledby="contact-title" className="space-y-4">
          <h2 id="contact-title" className="h2">Contact</h2>
          <p className="p opacity-90">
            Questions about these policies? Email us at <a className="underline" href="mailto:legal@arcanum.io">legal@arcanum.io</a>.
          </p>
          <p className="text-xs opacity-60">
            This page is provided for general information and does not constitute legal advice. Please consult your counsel for guidance
            specific to your situation and jurisdiction.
          </p>
        </section>
      </div>
    </main>
  );
}
