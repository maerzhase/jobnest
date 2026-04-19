"use client";

import { useCallback, useEffect, useState } from "react";
import { applicationsApi } from "../../lib/api/applications";
import { getErrorMessage } from "../../lib/error-handler";
import { showErrorToast } from "../../lib/toast";
import {
  DashboardEmptyState,
  DashboardHeader,
  DashboardLoadingState,
} from "./dashboard-header";
import {
  buildDashboardMetrics,
  type DashboardMetrics,
} from "./dashboard-metrics";
import {
  DashboardActivityPanels,
  DashboardOverviewStats,
  DashboardSummaryPanels,
  DashboardTrendPanels,
} from "./dashboard-sections";

export function DashboardScreen() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);

    try {
      const [groups, history] = await Promise.all([
        applicationsApi.list(),
        applicationsApi.listHistory(),
      ]);

      setMetrics(buildDashboardMetrics(groups, history));
    } catch (error) {
      showErrorToast({
        title: "Could not load dashboard",
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (isLoading && !metrics) {
    return <DashboardLoadingState />;
  }

  if (!metrics) {
    return null;
  }

  return (
    <section className="flex h-full min-h-0 w-full flex-col">
      <DashboardHeader latestEventAt={metrics.latestEventAt} />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        {metrics.totalApplications === 0 ? (
          <DashboardEmptyState />
        ) : (
          <div className="grid gap-4 pb-4">
            <DashboardOverviewStats metrics={metrics} />
            <DashboardTrendPanels metrics={metrics} />
            <DashboardActivityPanels metrics={metrics} />
            <DashboardSummaryPanels metrics={metrics} />
          </div>
        )}
      </div>
    </section>
  );
}
