"use client";

import {
  IconChartBar,
  IconHistory,
  IconLayoutKanban,
  IconPlus,
  IconSettings,
} from "@tabler/icons-react";
import { Button } from "@jobnest/ui";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { HistoryToolbar } from "./history-toolbar";
import { ContentCard } from "./content-card";
import { UpdateNotice } from "./update-notice";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isSettingsPage = pathname.startsWith("/settings");
  const isHistoryPage = pathname.startsWith("/history");
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isApplicationsPage = !isSettingsPage && !isHistoryPage && !isDashboardPage;

  return (
    <div className="grid h-screen grid-cols-[16rem_minmax(0,1fr)] gap-2 bg-page p-2">
      <aside className="flex h-full flex-col gap-2 px-1">
        <div className="mt-1 flex items-center justify-end gap-1">
          <HistoryToolbar />
          <Button
            aria-current={isSettingsPage ? "page" : undefined}
            onClick={() => router.push("/settings")}
            type="button"
            variant="ghost"
            size="xs"
          >
            <IconSettings aria-hidden="true" className="size-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2" >
          <Image
            src="/icon-transparent.png"
            alt=""
            aria-hidden="true"
            width={40}
            height={40}
            className="size-10 shrink-0 object-contain"
            priority
          />
          <div className="min-w-0">
            <h1 className="text-sm text-foreground">
              JobNest
            </h1>
          </div>
        </div>
        <Button
          className="mt-3 w-full justify-start"
          onClick={() => router.push("/?new=1")}
          type="button"
          variant="secondary"
        >
          <IconPlus aria-hidden="true" className="size-4" />
          Add application
        </Button>
        <div className="mt-2 grid gap-1">
          <Button
            aria-current={isApplicationsPage ? "page" : undefined}
            className="justify-start"
            onClick={() => router.push("/")}
            type="button"
            variant={isApplicationsPage ? "secondary" : "ghost"}
          >
            <IconLayoutKanban aria-hidden="true" className="size-4" />
            Applications
          </Button>
          <Button
            aria-current={isDashboardPage ? "page" : undefined}
            className="justify-start"
            onClick={() => router.push("/dashboard")}
            type="button"
            variant={isDashboardPage ? "secondary" : "ghost"}
          >
            <IconChartBar aria-hidden="true" className="size-4" />
            Dashboard
          </Button>
          <Button
            aria-current={isHistoryPage ? "page" : undefined}
            className="justify-start"
            onClick={() => router.push("/history")}
            type="button"
            variant={isHistoryPage ? "secondary" : "ghost"}
          >
            <IconHistory aria-hidden="true" className="size-4" />
            History
          </Button>
        </div>
        <UpdateNotice />
      </aside>

      <div className="min-h-0 min-w-0">
        <ContentCard>{children}</ContentCard>
      </div>
    </div>
  );
}
