"use client";
import Link from "next/link";
import { cn } from "@shared/lib/cn";
import BentoCard from "@/components/ui/BentoCard";
import { copy } from "@/content/narrative";

type Variant = "compact" | "full";

export default function ActivateBento({
  variant = "compact",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  return (
    <BentoCard
      title={copy.activate.title}
      description={
        variant === "compact"
          ? copy.activate.descCompact
          : copy.activate.descFull
      }
      className={cn(className)}
    >
      <div className="flex flex-col items-center justify-center mt-4 space-y-6">
        <Link href="/activate" className="cta-orb ring-cyan">
          Activate Account
        </Link>
        <p className="text-sm opacity-80">
          <em>{copy.activate.tagline}</em>
        </p>
      </div>
    </BentoCard>
  );
}
