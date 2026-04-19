import { cn } from "@jobnest/ui";

type DashboardSurfaceProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section";
};

type DashboardInsetProps = {
  children: React.ReactNode;
  className?: string;
};

const panelSurfaceClass =
  "rounded-xl border border-border/70 bg-black/[0.02] dark:bg-white/[0.03]";

export function DashboardSurface({
  children,
  className,
  as: Element = "div",
}: DashboardSurfaceProps) {
  return <Element className={cn(panelSurfaceClass, className)}>{children}</Element>;
}

export function DashboardInset({ children, className }: DashboardInsetProps) {
  return (
    <div className={cn("rounded-lg border border-border/60 bg-background/60", className)}>
      {children}
    </div>
  );
}
