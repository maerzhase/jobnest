"use client";

import { Select as BaseSelect } from "@base-ui/react/select";
import type {
  SelectPopup,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectItem as BaseSelectItem,
} from "@base-ui/react/select";
import type { JSX, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface SelectProps extends SelectRoot.Props<string> {}

export function Select(props: SelectProps): JSX.Element {
  return <BaseSelect.Root {...props} />;
}

export interface SelectTriggerButtonProps
  extends Omit<SelectTrigger.Props, "className"> {
  className?: string;
  placeholder?: ReactNode;
  invalid?: boolean;
}

export function SelectTriggerButton({
  children,
  className,
  placeholder,
  invalid,
  ...props
}: SelectTriggerButtonProps): JSX.Element {
  return (
    <BaseSelect.Trigger
      {...props}
      className={cn(
        "flex h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-md border bg-background px-3 text-sm text-foreground shadow-sm transition-[border-color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-60",
        invalid
          ? "border-red-500/50 focus-visible:border-red-600 focus-visible:ring-red-500/25"
          : "border-input focus-visible:border-foreground focus-visible:ring-ring/25",
        "focus-visible:ring-3 data-[popup-open]:border-foreground",
        className,
      )}
    >
      {children ?? (
        <BaseSelect.Value placeholder={placeholder ?? "Select an option"} />
      )}
      <BaseSelect.Icon className="text-muted-foreground">
        <ChevronDownIcon />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  );
}

export interface SelectValueTextProps
  extends Omit<SelectValue.Props, "className"> {
  className?: string;
}

export function SelectValueText({
  className,
  ...props
}: SelectValueTextProps): JSX.Element {
  return (
    <BaseSelect.Value
      {...props}
      className={cn("truncate text-left", className)}
    />
  );
}

export interface SelectContentProps
  extends Omit<SelectPopup.Props, "className"> {
  children: ReactNode;
  className?: string;
}

export function SelectContent({
  children,
  className,
  ...props
}: SelectContentProps): JSX.Element {
  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner
        align="start"
        alignItemWithTrigger={false}
        className="z-[100] outline-none"
        sideOffset={8}
      >
        <BaseSelect.Popup
          {...props}
          className={cn(
            "border-border bg-background text-card-foreground z-[100] max-h-80 min-w-[var(--anchor-width)] overflow-hidden rounded-md border shadow-xl shadow-black/35 outline-none transition-all duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            className,
          )}
        >
          <BaseSelect.List className="max-h-80 overflow-y-auto bg-background p-1">
            {children}
          </BaseSelect.List>
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

export interface SelectItemProps
  extends Omit<BaseSelectItem.Props, "className"> {
  children: ReactNode;
  className?: string;
}

export function SelectItem({
  children,
  className,
  ...props
}: SelectItemProps): JSX.Element {
  return (
    <BaseSelect.Item
      {...props}
      className={cn(
        "grid min-h-10 w-full cursor-default grid-cols-[1rem_minmax(0,1fr)] items-center gap-3 rounded-sm px-3 py-2 text-sm text-foreground outline-none select-none data-[highlighted]:bg-muted data-[highlighted]:text-foreground data-[selected]:bg-muted/70 data-[selected]:font-medium data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
    >
      <BaseSelect.ItemIndicator className="flex size-4 items-center justify-center text-foreground">
        <CheckIcon />
      </BaseSelect.ItemIndicator>
      <BaseSelect.ItemText className="min-w-0 whitespace-nowrap text-left">
        {children}
      </BaseSelect.ItemText>
    </BaseSelect.Item>
  );
}

function ChevronDownIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
      <path
        d="M4 6.25L8 10.25L12 6.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function CheckIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
      <path
        d="M3.75 8.25L6.75 11.25L12.25 5.75"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
