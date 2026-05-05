"use client";

import {
  IconArrowLeft,
  IconBrandGithubFilled,
  IconDownload,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { AmbientBackground, ButtonLink } from "../../../components/home/shared";

const AUTO_START_DELAY_MS = 5000;
const DOWNLOAD_URL = "/api/download/mac";
const RELEASES_URL = "https://github.com/maerzhase/jobnest/releases/latest";

export default function DownloadMacPage() {
  const [secondsLeft, setSecondsLeft] = useState(AUTO_START_DELAY_MS / 1000);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setHasStarted(true);
      window.location.assign(DOWNLOAD_URL);
    }, AUTO_START_DELAY_MS);

    const intervalId = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-x-clip px-4 py-8 sm:px-6">
      <AmbientBackground />

      <div className="w-full max-w-xl space-y-4">
        <a
          className="inline-flex items-center gap-2 font-light text-muted-foreground text-sm transition-colors hover:text-foreground"
          href="/"
        >
          <IconArrowLeft aria-hidden="true" size={16} />
          Back to homepage
        </a>

        <section className="rounded-xl border border-border/60 bg-card/40 p-7 backdrop-blur-sm sm:p-9">
          <div className="space-y-6 sm:space-y-7">
            <div className="space-y-3">
              <h1 className="text-balance font-medium text-3xl text-foreground tracking-tight sm:text-4xl">
                {hasStarted
                  ? "Your download has started."
                  : `Your download starts in ${secondsLeft}s`}
              </h1>
              <p className="font-light text-base text-muted-foreground leading-relaxed">
                Check your browser&apos;s downloads. <br /> If nothing happens,
                you can re-trigger it manually below.
              </p>
            </div>

            <div className="gap-3 flex">
              <ButtonLink className="w-full justify-center" href={DOWNLOAD_URL}>
                <IconDownload aria-hidden="true" size={16} />
                {hasStarted ? "Download again" : "Manually download"}
              </ButtonLink>
              <ButtonLink
                className="w-full justify-center"
                href={RELEASES_URL}
                variant="secondary"
                external
              >
                <IconBrandGithubFilled /> View release on GitHub
              </ButtonLink>
            </div>

            <aside className="flex gap-2.5">
              <IconInfoCircle
                aria-hidden
                className="mt-0.5 shrink-0 text-muted-foreground/60"
                size={14}
              />
              <div>
                <p className="font-light text-muted-foreground text-xs leading-relaxed">
                  On first launch go to{" "}
                  <span className="font-medium text-foreground">
                    System Settings → Privacy &amp; Security
                  </span>{" "}
                  and choose{" "}
                  <span className="font-medium text-foreground">
                    Open Anyway
                  </span>
                  . A signed build coming soon.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
