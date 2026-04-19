import { ApplicationStatusBadge } from "../application-tracker/application-status-badge";
import type {
  RecentActivityMetric,
  StatusMetric,
  WeeklyBucket,
} from "./dashboard-metrics";
import { DashboardInset } from "./dashboard-surface";

export function TrendBarChart({ data }: { data: WeeklyBucket[] }) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <div className="grid gap-3">
      <div className="flex h-52 items-end gap-2">
        {data.map((item) => (
          <div className="flex min-w-0 flex-1 flex-col items-center gap-2" key={item.label}>
            <span className="text-[11px] text-muted-foreground">{item.count}</span>
            <DashboardInset className="relative flex h-40 w-full items-end overflow-hidden">
              <div
                className="w-full rounded-t-lg bg-[linear-gradient(180deg,color-mix(in_srgb,var(--foreground)_16%,transparent),color-mix(in_srgb,var(--foreground)_64%,transparent))] transition-[height]"
                style={{
                  height: `${Math.max((item.count / maxCount) * 100, item.count > 0 ? 12 : 0)}%`,
                }}
              />
            </DashboardInset>
            <span className="text-[11px] text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SparkBarChart({ data }: { data: RecentActivityMetric[] }) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <div className="grid gap-3">
      <div className="flex h-44 items-end gap-2">
        {data.map((item, index) => (
          <div className="flex min-w-0 flex-1 flex-col items-center gap-2" key={`${item.label}-${index}`}>
            <DashboardInset className="flex h-32 w-full items-end overflow-hidden">
              <div
                className="w-full rounded-lg bg-[linear-gradient(180deg,rgba(34,197,94,0.24),rgba(34,197,94,0.76))]"
                style={{
                  height: `${Math.max((item.count / maxCount) * 100, item.count > 0 ? 10 : 0)}%`,
                }}
              />
            </DashboardInset>
            <span className="text-[11px] text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatusBreakdownChart({ data }: { data: StatusMetric[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-[13rem_minmax(0,1fr)] md:items-center">
      <StatusDonutChart data={data} />
      <div className="grid gap-2">
        {data.map((item) => (
          <div
            className="flex items-center justify-between gap-3"
            key={item.status}
          >
            <DashboardInset className="flex w-full items-center justify-between gap-3 px-3 py-2">
              <div className="flex items-center gap-2">
                <StatusDot status={item.status} />
                <ApplicationStatusBadge status={item.status} />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{item.count}</p>
                <p className="text-xs text-muted-foreground">{item.share}%</p>
              </div>
            </DashboardInset>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusDonutChart({ data }: { data: StatusMetric[] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const circumference = 2 * Math.PI * 44;
  let offset = 0;

  return (
    <div className="mx-auto flex w-full max-w-[13rem] flex-col items-center justify-center gap-3">
      <svg aria-hidden="true" className="h-44 w-44 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="44" fill="none" stroke="var(--muted)" strokeWidth="14" />
        {data.map((item) => {
          const dash = total === 0 ? 0 : (item.count / total) * circumference;
          const circle = (
            <circle
              cx="60"
              cy="60"
              fill="none"
              key={item.status}
              r="44"
              stroke={getStatusColor(item.status)}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              strokeWidth="14"
            />
          );
          offset += dash;
          return circle;
        })}
      </svg>
      <div className="text-center">
        <p className="text-3xl font-semibold tracking-tight text-foreground">{total}</p>
        <p className="text-sm text-muted-foreground">tracked applications</p>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: getStatusColor(status) }}
    />
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case "saved":
      return "rgb(59 130 246)";
    case "applied":
      return "rgb(147 51 234)";
    case "interview":
      return "rgb(245 158 11)";
    case "offer":
      return "rgb(34 197 94)";
    case "rejected":
      return "rgb(239 68 68)";
    default:
      return "rgb(148 163 184)";
  }
}
