"use client";

import { IconDownload } from "@tabler/icons-react";
import { Button } from "@jobnest/ui";
import {
  startTransition,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { executeLocalApiCall } from "../lib/api/client";
import { commands, type AvailableUpdate } from "../lib/api/bindings";
import { showErrorToast, showSuccessToast } from "../lib/toast";

const INITIAL_CHECK_DELAY_MS = 15_000;
const RECHECK_INTERVAL_MS = 60 * 60 * 1_000;
const FOCUS_RECHECK_INTERVAL_MS = 5 * 60 * 1_000;
const SHOULD_MOCK_UPDATE_NOTICE =
  process.env.NEXT_PUBLIC_JOBNEST_MOCK_UPDATE_NOTICE === "true";
const DEV_MOCK_UPDATE: AvailableUpdate | null = SHOULD_MOCK_UPDATE_NOTICE
  ? {
      version: "0.0.2",
      current_version: "0.0.1",
      body: "Refined the native updater flow and added a persistent sidebar notice.",
    }
  : null;

function isProbablyOnline(): boolean {
  return typeof navigator === "undefined" || navigator.onLine;
}

export function UpdateNotice() {
  const [availableUpdate, setAvailableUpdate] = useState<AvailableUpdate | null>(
    DEV_MOCK_UPDATE,
  );
  const [dismissedVersion, setDismissedVersion] = useState<string | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const isCheckingRef = useRef(false);
  const lastCheckedAtRef = useRef(0);

  const runSilentCheck = useEffectEvent(async (force: boolean) => {
    if (DEV_MOCK_UPDATE) {
      return;
    }

    const now = Date.now();

    if (isCheckingRef.current || !isProbablyOnline()) {
      return;
    }

    if (!force && now - lastCheckedAtRef.current < FOCUS_RECHECK_INTERVAL_MS) {
      return;
    }

    isCheckingRef.current = true;
    lastCheckedAtRef.current = now;

    try {
      const update = await executeLocalApiCall(() =>
        commands.checkForAvailableUpdate(),
      );

      startTransition(() => {
        setAvailableUpdate(update);
      });
    } catch {
      // Silent background checks should never interrupt the user.
    } finally {
      isCheckingRef.current = false;
    }
  });

  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
      void runSilentCheck(true);
    }, INITIAL_CHECK_DELAY_MS);

    const intervalId = window.setInterval(() => {
      void runSilentCheck(true);
    }, RECHECK_INTERVAL_MS);

    const handleWindowFocus = () => {
      void runSilentCheck(false);
    };

    const handleOnline = () => {
      void runSilentCheck(true);
    };

    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("online", handleOnline);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("online", handleOnline);
    };
  }, [runSilentCheck]);

  const visibleUpdate =
    availableUpdate && availableUpdate.version !== dismissedVersion
      ? availableUpdate
      : null;

  if (!visibleUpdate) {
    return <div className="mt-auto" />;
  }

  return (
    <section className="mt-auto rounded-md border border-emerald-500/25 bg-emerald-500/10 p-3 shadow-sm shadow-emerald-950/5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">
          Update available
        </p>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">
          Version {visibleUpdate.version} is ready to install.
        </p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button
          disabled={isInstalling}
          onClick={async () => {
            if (DEV_MOCK_UPDATE) {
              showSuccessToast({
                title: "Mock update preview",
                description:
                  "This is only a development preview of the sidebar notice.",
              });
              return;
            }

            setIsInstalling(true);

            try {
              await executeLocalApiCall(() => commands.runInteractiveUpdateCheck());
            } catch (error) {
              showErrorToast({
                title: "Unable to start update",
                description:
                  error instanceof Error ? error.message : "Please try again.",
              });
            } finally {
              setIsInstalling(false);
            }
          }}
          size="xs"
          type="button"
          variant="secondary"
        >
          <IconDownload aria-hidden="true" className="size-4" />
          {isInstalling ? "Checking…" : "Install"}
        </Button>
        <Button
          onClick={() => setDismissedVersion(visibleUpdate.version)}
          size="xs"
          type="button"
          variant="ghost"
        >
          Later
        </Button>
      </div>
    </section>
  );
}
