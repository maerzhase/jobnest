import { formatDateTime } from "../../lib/date";

export function DashboardHeader({ latestEventAt }: { latestEventAt: string | null }) {
  return (
    <div className="sticky top-0 z-10 border-b border-border/40 backdrop-blur-xl backdrop-saturate-150 dark:bg-card/50">
      <div className="flex flex-col gap-2 px-4 py-3 sm:px-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2>Dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A read on pipeline health, momentum, and where your applications are converting.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {latestEventAt
            ? `Latest activity ${formatDateTime(latestEventAt)}`
            : "No activity yet"}
        </p>
      </div>
    </div>
  );
}

export function DashboardLoadingState() {
  return (
    <section className="flex h-full min-h-0 w-full flex-col">
      <DashboardHeader latestEventAt={null} />
      <div className="m-4 rounded-2xl border border-dashed border-border/70 px-5 py-8 text-sm text-muted-foreground sm:m-5">
        Building your dashboard…
      </div>
    </section>
  );
}

export function DashboardEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border/70 px-5 py-8 text-sm text-muted-foreground">
      Add a few applications and status updates to unlock charts and KPI trends here.
    </div>
  );
}
