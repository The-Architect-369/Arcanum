import ActivateBento from "@/components/ui/ActivateBento";

export const metadata = {
  title: "Activate Account — ARCnet",
  description: "Create your ARCnet DID and begin your journey on the constellation.",
};

export default function ActivatePage() {
  return (
    <main className="snap-container">
      <section className="snap-section">
        <div className="section-full">
          <div className="w-full max-w-6xl mx-auto">
            <ActivateBento variant="full" />
          </div>
        </div>
      </section>
    </main>
  );
}
