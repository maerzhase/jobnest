"use client";

import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import type { ComponentPropsWithoutRef, JSX } from "react";
import { cn } from "../lib/cn";

type BaseCheckboxRootProps = ComponentPropsWithoutRef<typeof BaseCheckbox.Root>;

export interface CheckboxProps
  extends Omit<BaseCheckboxRootProps, "className" | "render"> {
  className?: string;
  indeterminate?: boolean;
}

export function Checkbox({
  className,
  indeterminate,
  ...props
}: CheckboxProps): JSX.Element {
  return (
    <BaseCheckbox.Root
      {...props}
      indeterminate={indeterminate}
      className={cn(
        "size-4 shrink-0 cursor-pointer rounded-sm border border-input bg-background",
        "flex items-center justify-center",
        "transition-[background-color,border-color,box-shadow] outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "data-[checked]:border-foreground data-[checked]:bg-foreground",
        "data-[indeterminate]:border-foreground data-[indeterminate]:bg-foreground",
        className,
      )}
    >
      <BaseCheckbox.Indicator className="flex items-center justify-center text-background">
        {indeterminate ? (
          <svg
            aria-hidden="true"
            fill="currentColor"
            height={2}
            viewBox="0 0 10 2"
            width={10}
          >
            <rect height={2} rx={1} width={10} />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            fill="none"
            height={8}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            viewBox="0 0 10 8"
            width={10}
          >
            <path d="M1 4l3 3 5-6" />
          </svg>
        )}
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
}
