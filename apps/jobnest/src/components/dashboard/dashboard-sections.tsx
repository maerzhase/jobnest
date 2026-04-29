import {
  IconActivityHeartbeat,
  IconChartBar,
  IconChartLine,
  IconClockHour4,
  IconProgressCheck,
  IconRosetteDiscountCheck,
} from "@tabler/icons-react";
import { MetricCell, Panel, StatPanel, SummaryPanel } from "./dashboard-panels";
import { SparkBarChart, StatusBreakdownChart, TrendBarChart } from "./dashboard-charts";
import type { DashboardMetrics } from "./dashboard-metrics";
import { DashboardInset } from "./dashboard-surface";

export function DashboardOverviewStats({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="grid gap-3 lg:grid-cols-4">
      <StatPanel
        icon={IconChartBar}
        label="Tracked applications"
        value={String(metrics.totalApplications)}
        hint={`${metrics.activeApplications} active now`}
      />
      <StatPanel
        icon={IconProgressCheck}
        label="Interview rate"
        value={`${metrics.interviewRate}%`}
        hint={`${metrics.offerRate}% reached offer`}
      />
      <StatPanel
        icon={IconRosetteDiscountCheck}
        label="Offer rate"
        value={`${metrics.offerRate}%`}
        hint={`${metrics.rejectionRate}% ended in rejection`}
      />
      <StatPanel
        icon={IconClockHour4}
        className="border-dashed border-foreground/18 bg-linear-to-br from-foreground/[0.03] via-card to-card"
        iconClassName="border border-dashed border-foreground/16 bg-muted/35"
        label="Stale applications"
        value={String(metrics.staleApplications)}
        hint="No activity in the last 14 days"
      />
    </div>
  );
}

export function DashboardTrendPanels({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Panel
        eyebrow="Application cadence"
        title="New applications over the last 8 weeks"
        description="This helps you see whether the pipeline is growing steadily or needs fresh input."
      >
        <TrendBarChart data={metrics.weeklyApplications} />
      </Panel>

      <Panel
        eyebrow="Current state"
        title="Where the pipeline sits today"
        description="Share of tracked applications by current status."
      >
        <StatusBreakdownChart data={metrics.statusBreakdown} />
      </Panel>
    </div>
  );
}

export function DashboardActivityPanels({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <Panel
        eyebrow="Activity"
        title="Recent change volume"
        description="Every create, update, status change, and deletion from the last 14 days."
      >
        <SparkBarChart data={metrics.recentActivity} />
      </Panel>

      <Panel
        eyebrow="Source quality"
        title="Which sources are producing the strongest outcomes"
        description="Interviews are used as the first conversion signal, with offer counts alongside."
      >
        <div className="grid gap-2">
          {metrics.sourceBreakdown.map((source) => (
            <DashboardInset
              className="grid gap-3 px-3 py-3 md:grid-cols-[minmax(0,1fr)_7rem_7rem_7rem]"
              key={source.source}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{source.label}</p>
                <p className="text-xs text-muted-foreground">
                  {source.count} applications tracked
                </p>
              </div>
              <MetricCell label="Interviews" value={String(source.interviews)} />
              <MetricCell label="Offers" value={String(source.offers)} />
              <MetricCell label="Conv." value={`${source.conversionRate}%`} />
            </DashboardInset>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function DashboardSummaryPanels({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <SummaryPanel
        icon={IconActivityHeartbeat}
        title="Pipeline health"
        lines={[
          `${metrics.activeApplications} applications are still active in the pipeline.`,
          `${metrics.archivedApplications} applications are archived.`,
        ]}
      />
      <SummaryPanel
        icon={IconChartLine}
        title="Time to progress"
        lines={[
          metrics.averageDaysToInterview === null
            ? "No interview timing yet."
            : `Average time to interview is ${metrics.averageDaysToInterview} days.`,
          metrics.averageDaysToOffer === null
            ? "No offer timing yet."
            : `Average time to offer is ${metrics.averageDaysToOffer} days.`,
        ]}
      />
      <SummaryPanel
        icon={IconClockHour4}
        title="Attention needed"
        lines={[
          metrics.staleApplications === 0
            ? "Nothing looks stale right now."
            : `${metrics.staleApplications} applications may need a follow-up or a decision.`,
          "Stale means no updates in the last 14 days.",
        ]}
      />
    </div>
  );
}
