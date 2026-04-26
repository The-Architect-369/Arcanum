import * as React from "react";
import { cn } from "@/lib/cn";

export default function AppStage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex min-h-full flex-col", className)}>{children}</div>;
}
