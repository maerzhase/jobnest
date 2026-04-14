"use client";

import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import type { ComponentPropsWithoutRef, JSX, ReactNode } from "react";
import { cn } from "../lib/cn";

type BaseToggleGroupProps<Value extends string> = ComponentPropsWithoutRef<
  typeof BaseToggleGroup<Value>
>;

export interface ToggleGroupProps<Value extends string>
  extends Omit<
    BaseToggleGroupProps<Value>,
    "children" | "defaultValue" | "multiple" | "onValueChange" | "value"
  > {
  children: ReactNode;
  className?: string;
  defaultValue?: Value;
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
  value,
  ...props
}: ToggleGroupProps<Value>): JSX.Element {
  return (
    <BaseToggleGroup
      {...props}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1",
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
  return (
    <BaseToggle
      {...props}
      className={cn(
        "inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-md border border-transparent px-3 text-sm text-muted-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 data-[pressed]:border-foreground data-[pressed]:bg-foreground data-[pressed]:text-background",
        className,
      )}
    >
      {children}
    </BaseToggle>
  );
}
