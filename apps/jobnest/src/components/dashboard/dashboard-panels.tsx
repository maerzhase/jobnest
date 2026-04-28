import type { Icon } from "@tabler/icons-react";
import { DashboardInset, DashboardSurface } from "./dashboard-surface";

export function Panel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <DashboardSurface as="section" className="p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      <div className="mt-5">{children}</div>
    </DashboardSurface>
  );
}

export function StatPanel({
  icon: Icon,
  label,
  value,
  hint,
  className,
  iconClassName,
}: {
  icon: Icon;
  label: string;
  value: string;
  hint: string;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <DashboardSurface className={`p-4 ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <DashboardInset
          className={`flex h-9 w-9 items-center justify-center text-muted-foreground ${iconClassName ?? ""}`}
        >
          <Icon aria-hidden="true" className="size-4" />
        </DashboardInset>
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </DashboardSurface>
  );
}

export function SummaryPanel({
  icon: Icon,
  title,
  lines,
}: {
  icon: Icon;
  title: string;
  lines: string[];
}) {
  return (
    <DashboardSurface className="p-4">
      <div className="flex items-center gap-2">
        <DashboardInset className="flex h-8 w-8 items-center justify-center text-muted-foreground">
          <Icon aria-hidden="true" className="size-4" />
        </DashboardInset>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </DashboardSurface>
  );
}

export function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <DashboardInset className="flex items-center justify-between gap-2 px-3 py-2 md:block md:text-right">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </DashboardInset>
  );
}
