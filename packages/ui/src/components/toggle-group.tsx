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
          "inline-flex items-center gap-1 rounded-xl border border-border/80 bg-black/[0.03] dark:bg-white/[0.04]",
          size === "sm" && "p-0.5",
          size === "md" && "p-1",
          size === "lg" && "p-1.5",
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
        "inline-flex cursor-pointer items-center justify-center border border-transparent text-muted-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 data-[pressed]:border-foreground data-[pressed]:bg-foreground data-[pressed]:text-background",
        size === "sm" && "h-7 min-w-7 rounded-md px-2 text-xs",
        size === "md" && "h-9 min-w-9 rounded-md px-3 text-sm",
        size === "lg" && "h-11 min-w-11 rounded-lg px-4 text-sm",
        className,
      )}
    >
      {children}
    </BaseToggle>
  );
}
