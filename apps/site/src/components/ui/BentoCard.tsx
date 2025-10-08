"use client";
import { PropsWithChildren } from "react";
import { cn } from "@/lib/cn";

type Props = PropsWithChildren<{
  title: string;
  description?: string;
  className?: string;
  /** When true, the card becomes a column and the child area can grow/shrink */
  stacked?: boolean;
  /** Extra classes applied to the child wrapper div */
  bodyClassName?: string;
}>;

export default function BentoCard({
  title,
  description,
  children,
  className,
  stacked = false,
  bodyClassName,
}: Props) {
  return (
    <article className={cn("bento-card", stacked && "flex flex-col", className)}>
      <div className="bento-ring" />
      <header>
        <h3 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h3>
        {description && <p className="mt-3 p text-white/80">{description}</p>}
      </header>

      {children && (
        <div className={cn("mt-6", stacked && "flex-1 min-h-0", bodyClassName)}>
          {children}
        </div>
      )}
    </article>
  );
}
