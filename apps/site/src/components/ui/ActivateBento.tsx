"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import BentoCard from "@/components/ui/BentoCard";

type Variant = "compact" | "full";

/**
 * Activation explainer bento.
 * - compact: homepage CTA (marketing copy, single button, tagline)
 * - full: /activate explainer with steps + primary button
 */
export default function ActivateBento({
  variant = "compact",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const Title = "Activate Your Account";
  const DescCompact =
    "Join the ArcNet’s living constellation. Activate your account and kindle your own light. Together, we empower the network we create.";
  const DescFull =
    "Create your ARCnet Decentralized Identifier — your persistent identity across the constellation. One activation secures your presence, links your devices, and invites The Hope as your guide.";

  return (
    <BentoCard
      title={Title}
      description={variant === "compact" ? DescCompact : DescFull}
      className={cn("vh-card vh-tall vh-pad grid place-items-center text-center", className)}
    >
      {variant === "compact" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="cta-wrap">
            <Link href="/activate/start" className="cta-primary">Activate Account</Link>
          </div>
          <p className="text-xs md:text-sm text-white/70">
            <em>Your brilliance weaves into the cosmic tapestry, lighting the way for all.</em>
          </p>
        </div>
      ) : (
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-5">
          <ol className="grid gap-3 text-left text-sm md:text-base text-white/85 w-full">
            <li className="flex gap-3">
              <span className="stepdot">1</span>
              <div>
                <strong>Create your DID.</strong> This is your on-chain identifier (private keys stay with you).
              </div>
            </li>
            <li className="flex gap-3">
              <span className="stepdot">2</span>
              <div>
                <strong>Secure & recover.</strong> Save a recovery phrase or passkey. You’re always in control.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="stepdot">3</span>
              <div>
                <strong>Link your device & Hope.</strong> Bind a device and summon The Hope to assist.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="stepdot">4</span>
              <div>
                <strong>Download the app.</strong> Finish by installing ARCnet and signing in with your DID.
              </div>
            </li>
          </ol>

          <div className="flex items-center gap-3">
            <div className="cta-wrap">
              <Link href="/activate/start" className="cta-primary">Begin Activation</Link>
            </div>
            <Link href="/faq#activate" className="bento-badge">How it works</Link>
          </div>

          <p className="text-[11px] text-white/45">
            By continuing you agree to the{" "}
            <Link href="/legal#terms" className="underline decoration-white/30 hover:decoration-white">Terms</Link>{" "}
            and{" "}
            <Link href="/legal#privacy" className="underline decoration-white/30 hover:decoration-white">Privacy</Link>.
          </p>
        </div>
      )}
    </BentoCard>
  );
}
