"use client";

type ContentCardProps = {
  children: React.ReactNode;
};

export function ContentCard({ children }: ContentCardProps) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_1px_1px_rgba(0,0,0,0.02),0_12px_32px_rgba(0,0,0,0.07)]">
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
