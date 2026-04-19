"use client";

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { Button } from "@jobnest/ui";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const HISTORY_INDEX_KEY = "__jobnestHistoryIndex";
const HISTORY_MAX_INDEX_KEY = "__jobnestHistoryMaxIndex";
const HISTORY_SESSION_MAX_INDEX_KEY = "__jobnestSessionHistoryMaxIndex";

type HistorySnapshot = {
  currentIndex: number;
  maxIndex: number;
};

function readHistorySnapshot(): HistorySnapshot | null {
  const state = window.history.state as Record<string, unknown> | null;

  if (
    typeof state?.[HISTORY_INDEX_KEY] !== "number" ||
    typeof state?.[HISTORY_MAX_INDEX_KEY] !== "number"
  ) {
    return null;
  }

  return {
    currentIndex: state[HISTORY_INDEX_KEY] as number,
    maxIndex: state[HISTORY_MAX_INDEX_KEY] as number,
  };
}

function readSessionMaxIndex() {
  const sessionMaxIndex = window.sessionStorage.getItem(
    HISTORY_SESSION_MAX_INDEX_KEY,
  );
  const parsedSessionMaxIndex = Number.parseInt(sessionMaxIndex ?? "", 10);

  return Number.isNaN(parsedSessionMaxIndex) ? null : parsedSessionMaxIndex;
}

function writeSessionMaxIndex(maxIndex: number) {
  window.sessionStorage.setItem(HISTORY_SESSION_MAX_INDEX_KEY, String(maxIndex));
}

function writeHistorySnapshot(snapshot: HistorySnapshot) {
  window.history.replaceState(
    {
      ...(window.history.state as Record<string, unknown> | null),
      [HISTORY_INDEX_KEY]: snapshot.currentIndex,
      [HISTORY_MAX_INDEX_KEY]: snapshot.maxIndex,
    },
    "",
    window.location.href,
  );
}

export function HistoryToolbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [historySnapshot, setHistorySnapshot] = useState<HistorySnapshot>({
    currentIndex: 0,
    maxIndex: 0,
  });
  const historySnapshotRef = useRef<HistorySnapshot>({
    currentIndex: 0,
    maxIndex: 0,
  });
  const previousPathnameRef = useRef<string | null>(null);
  const pendingPopSnapshotRef = useRef<HistorySnapshot | null>(null);

  useEffect(() => {
    const initialStateSnapshot = readHistorySnapshot() ?? {
      currentIndex: 0,
      maxIndex: 0,
    };
    const initialSnapshot = {
      currentIndex: initialStateSnapshot.currentIndex,
      maxIndex: Math.max(
        initialStateSnapshot.maxIndex,
        readSessionMaxIndex() ?? 0,
      ),
    };

    historySnapshotRef.current = initialSnapshot;
    setHistorySnapshot(initialSnapshot);
    writeHistorySnapshot(initialSnapshot);
    writeSessionMaxIndex(initialSnapshot.maxIndex);
    previousPathnameRef.current = window.location.pathname;

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as Record<string, unknown> | null;
      const sessionMaxIndex = readSessionMaxIndex() ?? 0;

      pendingPopSnapshotRef.current =
        typeof state?.[HISTORY_INDEX_KEY] === "number" &&
        typeof state?.[HISTORY_MAX_INDEX_KEY] === "number"
          ? {
              currentIndex: state[HISTORY_INDEX_KEY] as number,
              maxIndex: Math.max(
                state[HISTORY_MAX_INDEX_KEY] as number,
                sessionMaxIndex,
              ),
            }
          : null;
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    const previousPathname = previousPathnameRef.current;

    if (previousPathname === pathname) {
      return;
    }

    if (pendingPopSnapshotRef.current) {
      historySnapshotRef.current = pendingPopSnapshotRef.current;
      setHistorySnapshot(pendingPopSnapshotRef.current);
      writeSessionMaxIndex(pendingPopSnapshotRef.current.maxIndex);
      pendingPopSnapshotRef.current = null;
      previousPathnameRef.current = pathname;
      return;
    }

    const nextSnapshot = {
      currentIndex: historySnapshotRef.current.currentIndex + 1,
      maxIndex: historySnapshotRef.current.currentIndex + 1,
    };

    historySnapshotRef.current = nextSnapshot;
    setHistorySnapshot(nextSnapshot);
    writeHistorySnapshot(nextSnapshot);
    writeSessionMaxIndex(nextSnapshot.maxIndex);
    previousPathnameRef.current = pathname;
  }, [pathname]);

  const canGoBack = historySnapshot.currentIndex > 0;
  const canGoForward = historySnapshot.currentIndex < historySnapshot.maxIndex;

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        aria-label="Go back"
        disabled={!canGoBack}
        onClick={() => router.back()}
        size="xs"
        type="button"
        variant="ghost"
      >
        <IconArrowLeft aria-hidden="true" className="size-4" />
      </Button>
      <Button
        aria-label="Go forward"
        disabled={!canGoForward}
        onClick={() => router.forward()}
        size="xs"
        type="button"
        variant="ghost"
      >
        <IconArrowRight aria-hidden="true" className="size-4" />
      </Button>
    </div>
  );
}
