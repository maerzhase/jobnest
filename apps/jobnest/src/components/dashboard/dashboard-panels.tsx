import type { Icon } from "@tabler/icons-react";

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
    <section className="rounded-2xl border border-border/65 bg-background/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function StatPanel({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: Icon;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border/65 bg-background/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/70 text-muted-foreground">
          <Icon aria-hidden="true" className="size-4" />
        </div>
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
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
    <div className="rounded-2xl border border-border/65 bg-background/45 p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/70 text-muted-foreground">
          <Icon aria-hidden="true" className="size-4" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}

export function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 md:block md:text-right">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
