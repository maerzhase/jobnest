"use client";

import { Input as BaseInput } from "@base-ui/react/input";
import type { ComponentPropsWithoutRef, JSX } from "react";
import { cn } from "../lib/cn";

type BaseInputProps = ComponentPropsWithoutRef<typeof BaseInput>;

export interface InputProps extends Omit<BaseInputProps, "className"> {
  className?: string;
}

export function Input({ className, ...props }: InputProps): JSX.Element {
  return (
    <BaseInput
      {...props}
      className={cn(
        "flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:ring-3 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    />
  );
}
