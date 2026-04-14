"use client";

import { cva } from "class-variance-authority";
import { formatStatusLabel, type ApplicationStatus } from "../../lib/status";

type ApplicationStatusBadgeProps = {
  status: string;
};

const statusBadgeVariants = cva(
  "inline-flex rounded-sm px-2 py-1 text-xs font-semibold uppercase tracking-wide",
  {
    variants: {
      status: {
        saved: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
        applied: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
        interview: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
        offer: "bg-green-500/10 text-green-700 dark:text-green-300",
        rejected: "bg-red-500/10 text-red-700 dark:text-red-300",
      },
    },
    defaultVariants: {
      status: "saved",
    },
  }
);

export function ApplicationStatusBadge({
  status,
}: ApplicationStatusBadgeProps) {
  return (
    <span className={statusBadgeVariants({ status: status as ApplicationStatus })}>
      {formatStatusLabel(status)}
    </span>
  );
}
