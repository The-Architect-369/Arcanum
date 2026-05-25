import * as React from "react";
import { cn } from "@/lib/cn";

const STAGE_STYLE: React.CSSProperties = {
  height: "calc(var(--arcanum-locked-vh) - var(--arcanum-main-top) - var(--arcanum-main-bottom))",
  minHeight: "calc(var(--arcanum-locked-vh) - var(--arcanum-main-top) - var(--arcanum-main-bottom))",
};

export default function AppStage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      style={STAGE_STYLE}
      className={cn("flex min-h-0 flex-col overflow-hidden", className)}
    >
      {children}
    </div>
  );
}
