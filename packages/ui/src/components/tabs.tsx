"use client";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import {
  createContext,
  useContext,
  type ComponentPropsWithoutRef,
  type JSX,
  type ReactNode,
} from "react";
import { cn } from "../lib/cn";

type TabsSize = "sm" | "md" | "lg";
type TabsOrientation = "horizontal" | "vertical";
type TabsVariant = "surface" | "indicator";

type TabsContextValue = {
  orientation: TabsOrientation;
  size: TabsSize;
  variant: TabsVariant;
};

const TabsContext = createContext<TabsContextValue>({
  orientation: "horizontal",
  size: "md",
  variant: "surface",
});

type BaseTabsRootProps = ComponentPropsWithoutRef<typeof BaseTabs.Root>;

export interface TabsProps
  extends Omit<
    BaseTabsRootProps,
    "children" | "defaultValue" | "onValueChange" | "value"
  > {
  children: ReactNode;
  className?: string;
  defaultValue?: string | null;
  onValueChange?: (
    value: string,
    eventDetails: BaseTabs.Root.ChangeEventDetails,
  ) => void;
  orientation?: TabsOrientation;
  size?: TabsSize;
  variant?: TabsVariant;
  value?: string | null;
}

export function Tabs({
  children,
  className,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  size = "md",
  variant = "surface",
  value,
  ...props
}: TabsProps): JSX.Element {
  return (
    <TabsContext.Provider value={{ orientation, size, variant }}>
      <BaseTabs.Root
        {...props}
        className={cn(
          "group/tabs data-[orientation=horizontal]:grid data-[orientation=vertical]:grid",
          className,
        )}
        defaultValue={defaultValue}
        onValueChange={(nextValue, eventDetails) => {
          onValueChange?.(nextValue as string, eventDetails);
        }}
        orientation={orientation}
        value={value}
      >
        {children}
      </BaseTabs.Root>
    </TabsContext.Provider>
  );
}

type BaseTabsListProps = ComponentPropsWithoutRef<typeof BaseTabs.List>;

export interface TabsListProps
  extends Omit<BaseTabsListProps, "children" | "className"> {
  children: ReactNode;
  className?: string;
}

export function TabsList({
  children,
  className,
  ...props
}: TabsListProps): JSX.Element {
  const { orientation, size } = useContext(TabsContext);

  return (
    <BaseTabs.List
      {...props}
      className={cn(
        "relative isolate inline-flex",
        orientation === "horizontal" ? "flex-row items-center" : "flex-col",
        size === "sm" && "gap-1 p-0.5",
        size === "md" && "gap-1 p-1",
        size === "lg" && "gap-1.5 p-1.5",
        className,
      )}
    >
      {children}
    </BaseTabs.List>
  );
}

type BaseTabsIndicatorProps = ComponentPropsWithoutRef<
  typeof BaseTabs.Indicator
>;

export interface TabsIndicatorProps
  extends Omit<BaseTabsIndicatorProps, "className"> {
  className?: string;
}

export function TabsIndicator({
  className,
  ...props
}: TabsIndicatorProps): JSX.Element {
  const { variant } = useContext(TabsContext);

  return (
    <BaseTabs.Indicator
      {...props}
      className={cn(
        "pointer-events-none absolute left-[var(--active-tab-left)] top-[var(--active-tab-top)] z-0 transition-[top,left,width,height] duration-300 ease-out",
        variant === "surface" &&
          "h-[var(--active-tab-height)] w-[var(--active-tab-width)] rounded-md border border-border/80 bg-card shadow-sm",
        variant === "indicator" &&
          "rounded-full border-0 bg-foreground shadow-none data-[orientation=horizontal]:h-0.5 data-[orientation=horizontal]:w-[var(--active-tab-width)] data-[orientation=horizontal]:translate-y-[calc(var(--active-tab-height)-0.125rem)] data-[orientation=vertical]:h-[var(--active-tab-height)] data-[orientation=vertical]:w-1 data-[orientation=vertical]:translate-x-1",
        className,
      )}
    />
  );
}

type BaseTabsTabProps = ComponentPropsWithoutRef<typeof BaseTabs.Tab>;

export interface TabsTabProps
  extends Omit<BaseTabsTabProps, "children" | "className" | "value"> {
  children: ReactNode;
  className?: string;
  value: string;
}

export function TabsTab({
  children,
  className,
  ...props
}: TabsTabProps): JSX.Element {
  const { orientation, size, variant } = useContext(TabsContext);

  return (
    <BaseTabs.Tab
      {...props}
      className={cn(
        "relative z-10 inline-flex cursor-pointer items-center gap-2 rounded-md border border-transparent bg-transparent font-medium text-muted-foreground outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "aria-selected:text-foreground disabled:cursor-not-allowed disabled:opacity-60",
        variant === "surface" && "hover:text-foreground",
        variant === "indicator" &&
          "hover:text-foreground data-[orientation=vertical]:rounded-none",
        orientation === "horizontal" ? "justify-center" : "justify-start",
        size === "sm" &&
          (orientation === "horizontal"
            ? "min-h-8 min-w-8 px-3 py-1.5 text-xs"
            : "min-h-8 min-w-36 px-3 py-1.5 text-xs"),
        size === "md" &&
          (orientation === "horizontal"
            ? "min-h-10 min-w-10 px-4 py-2 text-sm"
            : "min-h-10 min-w-40 px-4 py-2 text-sm"),
        size === "lg" &&
          (orientation === "horizontal"
            ? "min-h-11 min-w-11 px-5 py-2.5 text-sm"
            : "min-h-11 min-w-44 px-4 py-2.5 text-sm"),
        className,
      )}
    >
      {children}
    </BaseTabs.Tab>
  );
}

type BaseTabsPanelProps = ComponentPropsWithoutRef<typeof BaseTabs.Panel>;

export interface TabsPanelProps
  extends Omit<BaseTabsPanelProps, "children" | "className"> {
  children?: ReactNode;
  className?: string;
}

export function TabsPanel({
  children,
  className,
  ...props
}: TabsPanelProps): JSX.Element {
  return (
    <BaseTabs.Panel {...props} className={cn("outline-none", className)}>
      {children}
    </BaseTabs.Panel>
  );
}
