import { IconBrandGithubFilled } from "@tabler/icons-react";
import { Button } from "@jobnest/ui";

export function FreeBadge() {
  return (
    <span className="-top-2 -right-2 absolute rotate-6 rounded-full border border-foreground/15 bg-background px-2 py-0.5 font-medium text-[10px] text-foreground tracking-wider uppercase shadow-sm">
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
      <div className="absolute inset-x-0 top-[-10%] h-[55rem] bg-[radial-gradient(ellipse_at_top,_color-mix(in_srgb,_var(--foreground)_10%,_transparent),_transparent_60%)]" />
      <div className="absolute left-[-15%] top-[40%] h-[50rem] w-[60rem] rounded-full bg-[radial-gradient(circle,_color-mix(in_srgb,_var(--foreground)_6%,_transparent),_transparent_65%)] blur-3xl" />
      <div className="absolute right-[-10%] top-[75%] h-[55rem] w-[55rem] rounded-full bg-[radial-gradient(circle,_color-mix(in_srgb,_var(--foreground)_7%,_transparent),_transparent_65%)] blur-3xl" />
      <div className="absolute inset-x-0 bottom-[-10%] h-[40rem] bg-[radial-gradient(ellipse_at_bottom,_color-mix(in_srgb,_var(--foreground)_6%,_transparent),_transparent_65%)]" />
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
