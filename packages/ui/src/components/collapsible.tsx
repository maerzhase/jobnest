"use client";

import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import type { ComponentPropsWithoutRef, JSX, ReactNode } from "react";
import { cn } from "../lib/cn";

type CollapsibleRootProps = ComponentPropsWithoutRef<
  typeof BaseCollapsible.Root
>;
type CollapsibleTriggerProps = ComponentPropsWithoutRef<
  typeof BaseCollapsible.Trigger
>;
type BaseCollapsiblePanelProps = ComponentPropsWithoutRef<
  typeof BaseCollapsible.Panel
>;

export function Collapsible(props: CollapsibleRootProps): JSX.Element {
  return <BaseCollapsible.Root {...props} />;
}

export interface CollapsibleTriggerButtonProps
  extends Omit<CollapsibleTriggerProps, "className"> {
  children: ReactNode;
  className?: string;
}

export function CollapsibleTriggerButton({
  children,
  className,
  ...props
}: CollapsibleTriggerButtonProps): JSX.Element {
  return (
    <BaseCollapsible.Trigger
      {...props}
      className={cn(
        "flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-4 py-3 text-left transition-colors data-[panel-open]:[&_svg]:rotate-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:transition-transform [&_svg]:duration-200",
        className,
      )}
    >
      {children}
    </BaseCollapsible.Trigger>
  );
}

export interface CollapsiblePanelProps
  extends Omit<BaseCollapsiblePanelProps, "className"> {
  children: ReactNode;
  className?: string;
}

export function CollapsiblePanel({
  children,
  className,
  ...props
}: CollapsiblePanelProps): JSX.Element {
  return (
    <BaseCollapsible.Panel
      {...props}
      className={cn(
        "overflow-hidden transition-all duration-200 ease-out data-[closed]:animate-none data-[ending-style]:opacity-0 data-[ending-style]:[height:0] data-[starting-style]:opacity-0 data-[starting-style]:[height:0]",
        className,
      )}
    >
      {children}
    </BaseCollapsible.Panel>
  );
}
