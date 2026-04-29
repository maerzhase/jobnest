"use client";

import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useCallback, useRef, type JSX } from "react";
import { cn } from "../lib/cn";

export interface ComboboxItem<V extends string = string> {
  value: V;
  label: string;
}

type ComboboxSize = "sm" | "md";

export interface ComboboxProps<V extends string = string> {
  items: ComboboxItem<V>[];
  value: V[];
  onValueChange: (value: V[]) => void;
  placeholder?: string;
  size?: ComboboxSize;
  className?: string;
  disabled?: boolean;
}

export function Combobox<V extends string = string>({
  items,
  value,
  onValueChange,
  placeholder = "Select…",
  size = "md",
  className,
  disabled,
}: ComboboxProps<V>): JSX.Element {
  const labelMap = Object.fromEntries(items.map((i) => [i.value, i.label]));
  const inputRef = useRef<HTMLInputElement>(null);

  const filter = useCallback(
    (itemValue: V, query: string) => {
      if (!query) return true;
      const label = (labelMap[itemValue] ?? itemValue).toLowerCase();
      return label.includes(query.toLowerCase());
    },
    [labelMap],
  );

  return (
    <BaseCombobox.Root
      multiple
      items={items.map((i) => i.value)}
      filter={filter}
      value={value}
      onValueChange={(v) => onValueChange((v ?? []) as V[])}
      disabled={disabled}
    >
      <BaseCombobox.InputGroup
        onClick={() => inputRef.current?.focus()}
        className={cn(
          "flex w-full cursor-text flex-wrap items-center gap-1 rounded-md border border-input bg-background transition-[border-color,box-shadow] focus-within:border-foreground focus-within:ring-3 focus-within:ring-ring/25",
          size === "sm" && "min-h-8 px-2 py-1",
          size === "md" && "min-h-9 px-2.5 py-1.5",
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
      >
        <BaseCombobox.Chips className="contents">
          {value.map((v) => (
            <BaseCombobox.Chip
              key={v}
              className="inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground"
            >
              {labelMap[v] ?? v}
              <BaseCombobox.ChipRemove
                aria-label={`Remove ${labelMap[v] ?? v}`}
                className="flex size-3 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <IconX aria-hidden="true" className="size-3" />
              </BaseCombobox.ChipRemove>
            </BaseCombobox.Chip>
          ))}
          <BaseCombobox.Input
            ref={inputRef}
            placeholder={value.length === 0 ? placeholder : ""}
            className={cn(
              "min-w-16 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
              size === "sm" && "text-xs",
              size === "md" && "text-sm",
            )}
          />
        </BaseCombobox.Chips>
      </BaseCombobox.InputGroup>

      <BaseCombobox.Portal>
        <BaseCombobox.Positioner
          align="start"
          className="z-[100] outline-none"
          sideOffset={6}
        >
          <BaseCombobox.Popup className="z-[100] min-w-[var(--anchor-width)] rounded-md border border-border bg-background shadow-xl shadow-black/35 outline-none transition-all duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            <BaseCombobox.Empty className="flex items-center justify-center px-3 py-3 text-xs text-muted-foreground empty:hidden">
              No results
            </BaseCombobox.Empty>
            <BaseCombobox.List className="max-h-80 overflow-y-auto p-1 data-[empty]:hidden">
              {(itemValue: V) => (
                <BaseCombobox.Item
                  key={itemValue}
                  value={itemValue}
                  className="grid min-h-9 w-full cursor-default grid-cols-[1rem_minmax(0,1fr)] items-center gap-3 rounded-sm px-3 py-2 text-sm text-foreground outline-none select-none data-[highlighted]:bg-muted data-[highlighted]:text-foreground data-[selected]:font-medium"
                >
                  <BaseCombobox.ItemIndicator className="flex size-4 items-center justify-center text-foreground">
                    <IconCheck aria-hidden="true" className="size-3.5" />
                  </BaseCombobox.ItemIndicator>
                  {labelMap[itemValue] ?? itemValue}
                </BaseCombobox.Item>
              )}
            </BaseCombobox.List>
          </BaseCombobox.Popup>
        </BaseCombobox.Positioner>
      </BaseCombobox.Portal>
    </BaseCombobox.Root>
  );
}
