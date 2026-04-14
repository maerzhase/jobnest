"use client";

import type { ReactNode } from "react";

type SettingsSectionProps = {
  category: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function SettingsSection({
  category,
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section className="max-w-3xl">
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.2em]">
          {category}
        </p>
        <h3 className="text-2xl font-semibold tracking-tight">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-6">
          {description}
        </p>
      </div>

      <div className="mt-10 border-t border-border pt-8">
        {children}
      </div>
    </section>
  );
}

type SettingBlockProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function SettingBlock({
  title,
  description,
  children,
}: SettingBlockProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:items-start">
      <div>
        <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </h4>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          {description}
        </p>
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
