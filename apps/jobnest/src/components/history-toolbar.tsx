"use client";

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { Button } from "@jobnest/ui";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function HistoryToolbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [historyState, setHistoryState] = useState({
    entries: [pathname],
    index: 0,
  });

  useEffect(() => {
    setHistoryState((currentHistoryState) => {
      const currentEntry = currentHistoryState.entries[currentHistoryState.index];

      if (pathname === currentEntry) {
        return currentHistoryState;
      }

      if (
        pathname === currentHistoryState.entries[currentHistoryState.index - 1]
      ) {
        return {
          ...currentHistoryState,
          index: currentHistoryState.index - 1,
        };
      }

      if (
        pathname === currentHistoryState.entries[currentHistoryState.index + 1]
      ) {
        return {
          ...currentHistoryState,
          index: currentHistoryState.index + 1,
        };
      }

      const nextEntries = currentHistoryState.entries.slice(
        0,
        currentHistoryState.index + 1,
      );
      nextEntries.push(pathname);

      return {
        entries: nextEntries,
        index: nextEntries.length - 1,
      };
    });
  }, [pathname]);

  const canGoBack = historyState.index > 0;
  const canGoForward = historyState.index < historyState.entries.length - 1;

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        aria-label="Go back"
        disabled={!canGoBack}
        onClick={() => router.back()}
        type="button"
        variant="ghost"
        size="xs"
      >
        <IconArrowLeft aria-hidden="true" className="size-4" />
      </Button>
      <Button
        aria-label="Go forward"
        disabled={!canGoForward}
        onClick={() => router.forward()}
        type="button"
        variant="ghost"
        size="xs"
      >
        <IconArrowRight aria-hidden="true" className="size-4" />
      </Button>
    </div>
  );
}
