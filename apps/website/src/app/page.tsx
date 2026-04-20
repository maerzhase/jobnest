import { Button } from "@jobnest/ui";
import Image from "next/image";
import jobnestPkg from "../../../jobnest/package.json";
import { ThemeToggle } from "../components/theme-toggle";

const REPO_URL = "https://github.com/maerzhase/jobnest";
const DOWNLOAD_URL = `${REPO_URL}/releases/latest`;

const storySections = [
  {
    title: "Real KPIs for your job search.",
    body: "Application rate, response rate, interview conversion, time-in-stage — see how your search is actually going, on a dashboard that only you can see.",
    detail:
      "Meaningful analytics without an account, without a tracker, without anyone else looking over your shoulder. Your data stays on your device, the insight stays with you.",
    image: "mock-02",
  },
  {
    title: "Own your search history.",
    body: "Search, filter, and revisit every conversation and note. Everything lives in a format you can export, back up, and walk away with whenever you want.",
    detail:
      "No lock-in. No cloud dashboards to lose access to. Your record of the search is a file you control.",
    image: "mock-03",
  },
];

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-x-clip">
      <AmbientBackground />

      <header className="fixed inset-x-0 top-0 z-30 border-border/60 border-b bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3 sm:px-8">
          <div className="flex items-center gap-2.5">
            <Image
              alt="JobNest app icon"
              className="size-7"
              height={28}
              priority
              src="/icon-transparent.png"
              width={28}
            />
            <p className="font-medium text-foreground text-sm tracking-tight">
              JobNest{" "}
              <span className="font-light text-muted-foreground text-xs">
                v{jobnestPkg.version}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              aria-label="Open the JobNest GitHub repository"
              nativeButton={false}
              // biome-ignore lint/a11y/useAnchorContent: base-ui render prop projects the Button's children
              render={<a href={REPO_URL} rel="noreferrer" target="_blank" />}
              size="sm"
              variant="ghost"
            >
              <GitHubIcon />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div aria-hidden className="h-14" />

      <section className="mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-6xl flex-col justify-center gap-10 px-6 pb-12 pt-24 sm:px-8 sm:pt-32">
        <div className="space-y-5">
          <h1 className="text-balance font-medium text-5xl text-foreground tracking-tight sm:text-6xl lg:text-7xl">
            Track your job search without handing it over.
          </h1>
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
            <p className="max-w-2xl text-balance font-light text-lg text-muted-foreground leading-relaxed sm:text-xl">
              JobNest keeps every application, note, and next step on your
              device — no account, no cloud, no tracking.
            </p>
            <div className="relative shrink-0">
              <Button
                nativeButton={false}
                // biome-ignore lint/a11y/useAnchorContent: base-ui render prop projects the Button's children
                render={<a href={DOWNLOAD_URL} rel="noreferrer" target="_blank" />}
              >
                Download for macOS
              </Button>
              <FreeBadge />
            </div>
          </div>
        </div>

        <ScreenshotFrame name="mock-01" alt="JobNest application board" priority />
      </section>

      {storySections.map((section) => (
        <StorySection key={section.title} {...section} />
      ))}

      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-20">
        <div className="rounded-[2rem] border border-border/70 bg-card/60 px-8 py-10 backdrop-blur-xl sm:px-12 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-balance font-medium text-3xl text-foreground tracking-tight sm:text-4xl">
                A job search tracker that stays on your side.
              </h2>
              <p className="text-balance font-light text-lg text-muted-foreground leading-relaxed">
                Free and private, open source and local-first. Install it
                once and own every note you take from here on out.
              </p>
              <p className="text-balance font-light text-muted-foreground text-sm leading-relaxed">
                The core JobNest experience is free, forever. Optional paid
                extras may arrive later, but tracking your job search will
                always stay free.
              </p>
            </div>
            <div className="flex flex-col items-center gap-6">
              <Image
                alt=""
                aria-hidden
                className="size-24 sm:size-28"
                height={112}
                src="/icon-transparent.png"
                width={112}
              />
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <Button
                    nativeButton={false}
                    // biome-ignore lint/a11y/useAnchorContent: base-ui render prop projects the Button's children
                    render={<a href={DOWNLOAD_URL} rel="noreferrer" target="_blank" />}
                  >
                    Download for macOS
                  </Button>
                  <FreeBadge />
                </div>
                <Button
                  nativeButton={false}
                  // biome-ignore lint/a11y/useAnchorContent: base-ui render prop projects the Button's children
                  render={<a href={REPO_URL} rel="noreferrer" target="_blank" />}
                  variant="secondary"
                >
                  View on GitHub
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 sm:px-8">
        <aside className="rounded-2xl border border-border/60 bg-card/40 px-6 py-5 backdrop-blur-sm sm:px-7 sm:py-6">
          <p className="font-medium text-foreground text-sm">
            A small note before you download
          </p>
          <p className="pt-2 font-light text-muted-foreground text-sm leading-relaxed">
            JobNest is in active early development and currently ships without
            an Apple developer signature. The first time you open it, macOS
            will ask you to confirm — head to{" "}
            <span className="font-medium text-foreground">
              System Settings → Privacy &amp; Security
            </span>{" "}
            and choose{" "}
            <span className="font-medium text-foreground"> Open Anyway </span> to
            let it through. We&apos;ll move to a fully signed build as soon as
            we can.
          </p>
        </aside>
      </section>

      <footer className="mx-auto max-w-6xl px-6 pb-10 sm:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-muted-foreground text-sm">
          <span className="font-light">
            built with{" "}
            <span aria-label="love" role="img">
              ♥
            </span>{" "}
            by{" "}
            <a
              className="font-medium text-foreground hover:underline"
              href="https://m3000.io"
              rel="noreferrer"
              target="_blank"
            >
              m3000.io
            </a>
          </span>
          <span aria-hidden>·</span>
          <a
            className="inline-flex items-center gap-1.5 font-medium text-foreground hover:underline"
            href={REPO_URL}
            rel="noreferrer"
            target="_blank"
          >
            <GitHubIcon />
            GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}

function FreeBadge() {
  return (
    <span className="-top-2 -right-2 absolute rotate-6 rounded-full border border-foreground/15 bg-background px-2 py-0.5 font-medium text-[10px] text-foreground tracking-wider uppercase shadow-sm">
      Free
    </span>
  );
}

function GitHubIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.94 10.94 0 0 1 5.74 0c2.18-1.49 3.14-1.18 3.14-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.67.8.56C20.22 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-x-0 top-[-10%] h-[55rem] bg-[radial-gradient(ellipse_at_top,_color-mix(in_srgb,_var(--foreground)_10%,_transparent),_transparent_60%)]" />
      <div className="absolute left-[-15%] top-[40%] h-[50rem] w-[60rem] rounded-full bg-[radial-gradient(circle,_color-mix(in_srgb,_var(--foreground)_6%,_transparent),_transparent_65%)] blur-3xl" />
      <div className="absolute right-[-10%] top-[75%] h-[55rem] w-[55rem] rounded-full bg-[radial-gradient(circle,_color-mix(in_srgb,_var(--foreground)_7%,_transparent),_transparent_65%)] blur-3xl" />
      <div className="absolute inset-x-0 bottom-[-10%] h-[40rem] bg-[radial-gradient(ellipse_at_bottom,_color-mix(in_srgb,_var(--foreground)_6%,_transparent),_transparent_65%)]" />
    </div>
  );
}

function StorySection({
  body,
  detail,
  image,
  title,
}: {
  body: string;
  detail: string;
  image: string;
  title: string;
}) {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-28 sm:px-8 sm:py-36">
      <article className="max-w-3xl space-y-5">
        <h3 className="text-balance font-medium text-3xl text-foreground tracking-tight sm:text-4xl lg:text-5xl">
          {title}
        </h3>
        <p className="font-light text-lg text-foreground/85 leading-relaxed">
          {body}
        </p>
        <p className="max-w-2xl font-light text-base text-muted-foreground leading-relaxed">
          {detail}
        </p>
      </article>

      <ScreenshotFrame name={image} alt={title} />
    </section>
  );
}

function ScreenshotFrame({
  alt,
  name,
  priority,
}: {
  alt: string;
  name: string;
  priority?: boolean;
}) {
  return (
    <div className="relative [filter:drop-shadow(0_0_0.5px_rgb(0_0_0/0.18))_drop-shadow(0_18px_40px_rgb(0_0_0/0.12))_drop-shadow(0_4px_12px_rgb(0_0_0/0.08))] dark:[filter:drop-shadow(0_0_0.5px_rgb(255_255_255/0.25))_drop-shadow(0_18px_40px_rgb(0_0_0/0.45))_drop-shadow(0_4px_12px_rgb(0_0_0/0.35))]">
      <Image
        alt={alt}
        className="h-auto w-full dark:hidden"
        height={2112}
        priority={priority}
        sizes="(min-width: 1024px) 60vw, 100vw"
        src={`/${name}-light.png`}
        width={3248}
      />
      <Image
        alt={alt}
        aria-hidden
        className="hidden h-auto w-full dark:block"
        height={2112}
        priority={priority}
        sizes="(min-width: 1024px) 60vw, 100vw"
        src={`/${name}.png`}
        width={3248}
      />
    </div>
  );
}
