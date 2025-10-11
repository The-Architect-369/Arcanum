"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import BentoCard from "@/components/ui/BentoCard";

type Variant = "compact" | "full";

export default function ActivateBento({
  variant = "compact",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const title = "Activate Your Account";
  const descCompact =
    "Join the ArcNet’s living constellation. Activate your account and kindle your own light. Together, we empower the network we create.";
  const descFull =
    "Create your ARCnet Decentralized Identifier — your persistent identity across the constellation. One activation secures your presence, links your devices, and invites The Hope as your guide.";

  return (
    <BentoCard
      title={title}
      description={variant === "compact" ? descCompact : descFull}
      className={cn("activate-inline grid place-items-center text-center", className)}
    >
      <div className="activate-actions">
        <Link href="/activate/start" className="cta-orb">Activate Account</Link>
        <p className="activate-tagline">
          <em>Your brilliance weaves into the cosmic tapestry, lighting the way for all.</em>
        </p>
      </div>

      {/* (optional) full variant steps can remain beneath as you had them */}
    </BentoCard>
  );
}
