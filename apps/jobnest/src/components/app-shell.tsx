"use client";

import {
  IconChartBar,
  IconHistory,
  IconLayoutKanban,
  IconPlus,
  IconSettings,
} from "@tabler/icons-react";
import { Button, Tabs, TabsIndicator, TabsList, TabsTab } from "@jobnest/ui";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { HistoryToolbar } from "./history-toolbar";
import { ContentCard } from "./content-card";
import { UpdateNotice } from "./update-notice";
import { WindowDragSurface } from "./window-drag-surface";

type AppShellProps = {
  children: React.ReactNode;
};

type AppRoute = "applications" | "dashboard" | "history";

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isSettingsPage = pathname.startsWith("/settings");
  const isHistoryPage = pathname.startsWith("/history");
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isApplicationsPage =
    !isSettingsPage && !isHistoryPage && !isDashboardPage;
  const activeRoute: AppRoute | null = isSettingsPage
    ? null
    : isDashboardPage
      ? "dashboard"
      : isHistoryPage
        ? "history"
        : "applications";

  const handleNavigationChange = (value: AppRoute) => {
    if (value === activeRoute) {
      return;
    }

    router.push(
      value === "applications"
        ? "/"
        : value === "dashboard"
          ? "/dashboard"
          : "/history",
    );
  };

  return (
    <WindowDragSurface className="h-screen overflow-hidden bg-page">
      <div className="grid h-full grid-cols-[12rem_minmax(0,1fr)] gap-2 p-2 xl:grid-cols-[12.5rem_minmax(0,1fr)]">
        <aside className="flex h-full flex-col gap-2 px-1">
          <div className="-mt-px flex items-center justify-end gap-1">
            <HistoryToolbar />
            <Button
              aria-current={isSettingsPage ? "page" : undefined}
              className={
                isSettingsPage
                  ? "border-border bg-card text-foreground shadow-sm hover:bg-card"
                  : undefined
              }
              onClick={() => router.push("/settings")}
              type="button"
              variant="ghost"
              size="xs"
            >
              <IconSettings aria-hidden="true" className="size-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 px-1">
            <Image
              src="/icon-transparent.png"
              alt=""
              aria-hidden="true"
              width={40}
              height={40}
              className="size-9 shrink-0 object-contain"
              priority
            />
            <div className="min-w-0">
              <h1 className="text-sm font-medium text-foreground">JobNest</h1>
            </div>
          </div>
          <Button
            className="mt-2 h-8 w-full justify-start px-2.5 text-xs"
            onClick={() => router.push("/?new=1")}
            type="button"
            variant="primary"
            size="xs"
          >
            <IconPlus aria-hidden="true" className="size-4" />
            Add application
          </Button>
          <Tabs
            aria-label="Primary"
            className="mt-1"
            onValueChange={(value) => handleNavigationChange(value as AppRoute)}
            orientation="vertical"
            size="sm"
            variant="surface"
            value={activeRoute}
          >
            <TabsList className="w-full p-0">
              <TabsIndicator />
              <TabsTab
                aria-current={isApplicationsPage ? "page" : undefined}
                className="min-w-0 justify-start px-2.5"
                value="applications"
              >
                <IconLayoutKanban aria-hidden="true" className="size-4" />
                Applications
              </TabsTab>
              <TabsTab
                aria-current={isDashboardPage ? "page" : undefined}
                className="min-w-0 justify-start px-2.5"
                value="dashboard"
              >
                <IconChartBar aria-hidden="true" className="size-4" />
                Dashboard
              </TabsTab>
              <TabsTab
                aria-current={isHistoryPage ? "page" : undefined}
                className="min-w-0 justify-start px-2.5"
                value="history"
              >
                <IconHistory aria-hidden="true" className="size-4" />
                History
              </TabsTab>
            </TabsList>
          </Tabs>
          <UpdateNotice />
        </aside>

        <div className="min-h-0 min-w-0">
          <ContentCard>{children}</ContentCard>
        </div>
      </div>
    </WindowDragSurface>
  );
}
