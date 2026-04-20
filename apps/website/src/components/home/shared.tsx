import { Button } from "@jobnest/ui";
import Image from "next/image";

export function FreeBadge() {
  return (
    <span className="-top-2 -right-2 absolute rotate-6 rounded-full border border-foreground/15 bg-background px-2 py-0.5 font-medium text-[10px] text-foreground tracking-wider uppercase shadow-sm">
      Free
    </span>
  );
}

export function GitHubIcon() {
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

export function AmbientBackground() {
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

export function ScreenshotFrame({
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

export function ExternalButton({
  children,
  href,
  variant,
}: {
  children: React.ReactNode;
  href: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  return (
    <Button
      nativeButton={false}
      // biome-ignore lint/a11y/useAnchorContent: base-ui render prop projects the Button's children
      render={<a href={href} rel="noreferrer" target="_blank" />}
      variant={variant}
    >
      {children}
    </Button>
  );
}
