"use client";
import { cn } from "@shared/lib/cn";

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
    <div
      className={cn(
        // 🔒 Unified Bento frame dimensions
        "relative w-full max-w-[94vw] sm:max-w-[720px] md:max-w-[960px] lg:max-w-[1100px] mx-auto",
        "min-h-[480px] sm:min-h-[560px] md:min-h-[640px] lg:min-h-[720px]",
        // ✨ Surface styling
        "rounded-2xl bg-neutral-900/60 backdrop-blur-md border border-white/10 shadow-lg",
        // 🧭 Center and padding
        "flex flex-col items-center justify-center text-center p-6 sm:p-8",
        // 🎬 Motion
        "transition-transform duration-300 hover:scale-[1.02]",
        className
      )}
    >
      {title ? (
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-semibold gradient-text">{title}</h2>
          {description && (
            <p className="text-base opacity-80 max-w-prose mx-auto">{description}</p>
          )}
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
