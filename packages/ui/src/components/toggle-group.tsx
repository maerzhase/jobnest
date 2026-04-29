"use client";

import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import {
  createContext,
  useContext,
  type ComponentPropsWithoutRef,
  type JSX,
  type ReactNode,
} from "react";
import { cn } from "../lib/cn";

type BaseToggleGroupProps<Value extends string> = ComponentPropsWithoutRef<
  typeof BaseToggleGroup<Value>
>;

type ToggleGroupSize = "sm" | "md" | "lg";

const ToggleGroupSizeContext = createContext<ToggleGroupSize>("md");

const toggleGroupShellStyles: Record<ToggleGroupSize, string> = {
  sm: "rounded-md p-px",
  md: "rounded-md p-px",
  lg: "rounded-md p-px",
};

const toggleGroupItemStyles: Record<ToggleGroupSize, string> = {
  sm: "h-7 min-w-7 px-2 text-xs",
  md: "h-8 min-w-8 px-3 text-sm",
  lg: "h-10 min-w-10 px-4 text-sm",
};

const toggleGroupItemRadiusStyles =
  "rounded-none first:rounded-l-[calc(theme(borderRadius.md)-2px)] last:rounded-r-[calc(theme(borderRadius.md)-2px)]";

export interface ToggleGroupProps<Value extends string>
  extends Omit<
    BaseToggleGroupProps<Value>,
    "children" | "defaultValue" | "multiple" | "onValueChange" | "value"
  > {
  children: ReactNode;
  className?: string;
  defaultValue?: Value;
  size?: ToggleGroupSize;
  onValueChange?: (
    value: Value | null,
    eventDetails: BaseToggleGroup.ChangeEventDetails,
  ) => void;
  value?: Value;
}

export function ToggleGroup<Value extends string>({
  children,
  className,
  defaultValue,
  onValueChange,
  size = "md",
  value,
  ...props
}: ToggleGroupProps<Value>): JSX.Element {
  return (
    <ToggleGroupSizeContext.Provider value={size}>
      <BaseToggleGroup
        {...props}
        className={cn(
          "inline-flex items-center gap-0 border border-border/80 bg-black/[0.03] dark:bg-white/[0.04]",
          toggleGroupShellStyles[size],
          className,
        )}
        defaultValue={defaultValue ? [defaultValue] : undefined}
        multiple={false}
        onValueChange={(groupValue, eventDetails) => {
          onValueChange?.(
            (groupValue[0] as Value | undefined) ?? null,
            eventDetails,
          );
        }}
        value={value ? [value] : undefined}
      >
        {children}
      </BaseToggleGroup>
    </ToggleGroupSizeContext.Provider>
  );
}

type BaseToggleProps<Value extends string> = ComponentPropsWithoutRef<
  typeof BaseToggle<Value>
>;

export interface ToggleGroupItemProps<Value extends string>
  extends Omit<BaseToggleProps<Value>, "children" | "className"> {
  children: ReactNode;
  className?: string;
}

export function ToggleGroupItem<Value extends string>({
  children,
  className,
  ...props
}: ToggleGroupItemProps<Value>): JSX.Element {
  const size = useContext(ToggleGroupSizeContext);

  return (
    <BaseToggle
      {...props}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center border border-transparent text-muted-foreground transition-[background-color,border-color,color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 data-[pressed]:border-foreground data-[pressed]:bg-foreground data-[pressed]:text-background",
        toggleGroupItemStyles[size],
        toggleGroupItemRadiusStyles,
        className,
      )}
    >
      {children}
    </BaseToggle>
  );
}
