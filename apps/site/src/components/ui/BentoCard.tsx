"use client";
import { cn } from "@/lib/cn";

export default function BentoCard({
  title,
  description,
  className,
  children,
}: {
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("card popcard ring-soft glow-cyan", className)}>
      {title ? (
        <div className="stack" style={{ ["--space" as any]: "var(--space-3)" }}>
          <div className="stack pop-stagger auto" style={{ ["--space" as any]: "var(--space-2)" }}>
            <h2 className="h1 gradient-text">{title}</h2>
            {description ? <p className="p muted">{description}</p> : null}
          </div>
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
