import * as React from "react";
import { cn } from "@/lib/cn";

const STAGE_STYLE: React.CSSProperties = {
  height: "calc(100dvh - 7rem - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
  minHeight: "calc(100dvh - 7rem - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
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
