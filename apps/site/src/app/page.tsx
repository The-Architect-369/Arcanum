import HeroBento from "@/components/ui/HeroBento";
import ActivateBento from "@/components/ui/ActivateBento";
import BentoShowcase from "@/components/ui/BentoShowcase";

export default function SiteHome() {
  const arcnet = [
    { title: "Decentralized Community", desc: "Join a network owned by its users, where your input shapes the constellation." },
    { title: "Sovereign Security", desc: "Enjoy true privacy with no central surveillance — you control your data, you decide what to share." },
    { title: "Web3 Freedom", desc: "Experience a truly decentralized platform where your voice can’t be silenced and your choices shape the network." },
    { title: "User-Driven Control", desc: "Customize your digital space — no ads, no algorithms — just a constellation of connections on your terms." },
    { title: "Collective Creation", desc: "Be part of an evolving tapestry where every member adds to the shared story and the network grows with you." }
  ];

  const mana = [
    { title: "Earn As You Engage", desc: "Gain MANA, our native cryptocurrency, simply by participating — the more you connect, the more you earn." },
    { title: "Marketplace of Possibilities", desc: "Use MANA to unlock exclusive content, services, and community-driven experiences." },
    { title: "True Ownership", desc: "MANA is your stake in the network that rewards your contributions and lets your value grow." },
    { title: "Seamless Transactions", desc: "Transact easily and securely with MANA, enjoying fast, borderless payments that keep you in control." },
    { title: "Fuel Your Growth", desc: "Use MANA to customize your journey, support creators, and shape the ARCnet’s evolving universe." }
  ];

  const tempus = [
    { title: "ARCnet’s celestial clock", desc: "Tempus is the ARCnet’s heartbeat, measuring time by the movement of stars and planets." },
    { title: "Daily cosmic actions", desc: "Align everyday choices with cosmic cycles to bring intention and harmony into your routine." },
    { title: "Why use the Tempus", desc: "Celestial time keeps the ARCnet connected to cosmic order, creating a unified rhythm for all." },
    { title: "Plan your destiny", desc: "Use Tempus to plan actions and milestones with lunar, solar, and zodiacal flows." },
    { title: "Harmonize with the universe", desc: "Move in sync with shared cosmic rhythms to feel aligned with the constellation around you." }
  ];

  return (
    <main className="snap-container">
      {/* HERO */}
      <section className="snap-section">
        <div className="section-full">
          <div className="w-full max-w-6xl mx-auto">
            <HeroBento />
          </div>
        </div>
      </section>

      {/* ARCnet Showcase (no CTA) */}
      <section className="snap-section">
        <div className="section-full">
          <div className="w-full max-w-6xl mx-auto">
            <BentoShowcase
              title="Welcome to ARCnet"
              description="A constellation of connections, woven together by your light, forming a tapestry of true digital freedom."
              items={arcnet}
              showCta={false}
            />
          </div>
        </div>
      </section>

      {/* MANA Showcase (no CTA) */}
      <section className="snap-section">
        <div className="section-full">
          <div className="w-full max-w-6xl mx-auto">
            <BentoShowcase
              title="Welcome to MANA"
              description="The currency of empowerment within ARCnet, fueling your cosmic journey."
              items={mana}
              showCta={false}
            />
          </div>
        </div>
      </section>

      {/* Tempus Showcase (no CTA) */}
      <section className="snap-section">
        <div className="section-full">
          <div className="w-full max-w-6xl mx-auto">
            <BentoShowcase
              title="Welcome to Tempus"
              description="ARCnet’s celestial clock, guiding our shared time through the rhythms of the cosmos."
              items={tempus}
              showCta={false}
            />
          </div>
        </div>
      </section>

      {/* Bottom CTA — reusing ActivateBento (compact) */}
      <section className="snap-section">
        <div className="section-full">
          <div className="w-full max-w-6xl mx-auto">
            <ActivateBento variant="compact" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-4 px-4">
        <div className="mx-auto w-full max-w-6xl py-6 text-xs text-white/60 border-t border-white/10">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="/legal#terms"   className="hover:underline">Terms of Service</a>
            <a href="/legal#privacy" className="hover:underline">Privacy Policy</a>
            <a href="/legal#cookies" className="hover:underline">Cookie Policy</a>
            <a href="/legal"         className="hover:underline">Legal</a>
          </div>
          <p className="mt-3">© {new Date().getFullYear()} ARCnet. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
