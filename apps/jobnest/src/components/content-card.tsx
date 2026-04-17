"use client";

type ContentCardProps = {
  children: React.ReactNode;
};

export function ContentCard({ children }: ContentCardProps) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-[0_1px_1px_rgba(0,0,0,0.02),0_14px_36px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl backdrop-saturate-150 dark:bg-card/50 dark:shadow-[0_1px_1px_rgba(0,0,0,0.18),0_14px_36px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
