import { IconBrandGithubFilled } from "@tabler/icons-react";
import { Button } from "@jobnest/ui";
import { cn } from "@jobnest/ui";

export function FreeBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "absolute rounded-full border border-foreground/15 bg-background px-2 py-0.5 font-medium text-[10px] text-foreground tracking-wider uppercase shadow-sm",
        "right-3 top-0 -translate-y-1/2 rotate-6 sm:-right-2 sm:-top-2 sm:translate-y-0",
        className,
      )}
    >
      Free
    </span>
  );
}

export function GitHubIcon() {
  return <IconBrandGithubFilled aria-hidden="true" size={16} />;
}

export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-x-0 top-[-4rem] h-[26rem] bg-[radial-gradient(ellipse_at_top,_color-mix(in_srgb,_var(--foreground)_8%,_transparent),_transparent_68%)] opacity-75 dark:opacity-40 sm:top-[-10%] sm:h-[55rem] sm:bg-[radial-gradient(ellipse_at_top,_color-mix(in_srgb,_var(--foreground)_10%,_transparent),_transparent_60%)] sm:opacity-100" />
      <div className="absolute left-[-35%] top-[18rem] h-[22rem] w-[26rem] rounded-full bg-[radial-gradient(circle,_color-mix(in_srgb,_var(--foreground)_4%,_transparent),_transparent_68%)] blur-2xl opacity-80 dark:opacity-35 sm:left-[-15%] sm:top-[40%] sm:h-[50rem] sm:w-[60rem] sm:bg-[radial-gradient(circle,_color-mix(in_srgb,_var(--foreground)_6%,_transparent),_transparent_65%)] sm:blur-3xl sm:opacity-100" />
      <div className="absolute right-[-45%] top-[34rem] h-[20rem] w-[24rem] rounded-full bg-[radial-gradient(circle,_color-mix(in_srgb,_var(--foreground)_4%,_transparent),_transparent_70%)] blur-2xl opacity-70 dark:opacity-30 sm:right-[-10%] sm:top-[75%] sm:h-[55rem] sm:w-[55rem] sm:bg-[radial-gradient(circle,_color-mix(in_srgb,_var(--foreground)_7%,_transparent),_transparent_65%)] sm:blur-3xl sm:opacity-100" />
      <div className="absolute inset-x-0 bottom-[-2rem] h-[18rem] bg-[radial-gradient(ellipse_at_bottom,_color-mix(in_srgb,_var(--foreground)_4%,_transparent),_transparent_72%)] opacity-60 dark:opacity-30 sm:bottom-[-10%] sm:h-[40rem] sm:bg-[radial-gradient(ellipse_at_bottom,_color-mix(in_srgb,_var(--foreground)_6%,_transparent),_transparent_65%)] sm:opacity-100" />
    </div>
  );
}

export function ExternalButton({
  children,
  className,
  href,
  variant,
}: {
  children: React.ReactNode;
  className?: string;
  href: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  return (
    <Button
      className={className}
      nativeButton={false}
      // biome-ignore lint/a11y/useAnchorContent: base-ui render prop projects the Button's children
      render={<a href={href} rel="noreferrer" target="_blank" />}
      variant={variant}
    >
      {children}
    </Button>
  );
}
