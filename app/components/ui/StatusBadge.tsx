import React from "react";
import { cn } from "../../lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  let colorClass = "bg-surface-muted text-foreground border-surface-border";
  let dotClass = "bg-slate-500";

  if (normalized.includes("active") || normalized.includes("completed") || normalized.includes("success")) {
    colorClass = "bg-success-light/40 text-success-foreground border-success-light";
    dotClass = "bg-success";
  } else if (normalized.includes("pending") || normalized.includes("progress")) {
    colorClass = "bg-warning-light/40 text-warning-foreground border-warning-light";
    dotClass = "bg-warning";
  } else if (normalized.includes("fail") || normalized.includes("cancel") || normalized.includes("dropped")) {
    colorClass = "bg-danger-light/40 text-danger-foreground border-danger-light";
    dotClass = "bg-danger";
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold border", colorClass, className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", dotClass)} />
      {status}
    </span>
  );
}
