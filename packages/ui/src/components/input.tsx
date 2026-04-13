"use client";

import { Input as BaseInput } from "@base-ui/react/input";
import type { ComponentPropsWithoutRef, JSX } from "react";
import { cn } from "../lib/cn";

type BaseInputProps = ComponentPropsWithoutRef<typeof BaseInput>;

export interface InputProps extends Omit<BaseInputProps, "className"> {
  className?: string;
  invalid?: boolean;
}

export function Input({ className, invalid, ...props }: InputProps): JSX.Element {
  return (
    <BaseInput
      {...props}
      className={cn(
        "flex h-11 w-full rounded-md border bg-background px-3 text-sm text-foreground shadow-sm transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60",
        invalid
          ? "border-red-500/50 focus-visible:border-red-600 focus-visible:ring-red-500/25"
          : "border-input focus-visible:border-foreground focus-visible:ring-ring/25",
        "focus-visible:ring-3",
        className,
      )}
    />
  );
}
