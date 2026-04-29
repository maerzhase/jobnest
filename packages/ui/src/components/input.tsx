"use client";

import { Input as BaseInput } from "@base-ui/react/input";
import type { ComponentPropsWithoutRef, JSX } from "react";
import { cn } from "../lib/cn";

type BaseInputProps = ComponentPropsWithoutRef<typeof BaseInput>;
type InputSize = "sm" | "md" | "lg";

export interface InputProps extends Omit<BaseInputProps, "className" | "size"> {
  className?: string;
  invalid?: boolean;
  size?: InputSize;
}

export function Input({
  className,
  invalid,
  size = "md",
  ...props
}: InputProps): JSX.Element {
  return (
    <BaseInput
      {...props}
      className={cn(
        "flex w-full border bg-background text-foreground shadow-sm transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60",
        size === "sm" && "h-8 rounded-md px-2 text-xs",
        size === "md" && "h-9 rounded-md px-3 text-sm",
        size === "lg" && "h-11 rounded-md px-3 text-sm",
        invalid
          ? "border-red-500/50 focus-visible:border-red-600 focus-visible:ring-red-500/25 focus-within:border-red-600 focus-within:ring-red-500/25"
          : "border-input focus-visible:border-foreground focus-visible:ring-ring/25 focus-within:border-foreground focus-within:ring-ring/25",
        "focus-visible:ring-3 focus-within:ring-3",
        // Native date/time input styling
        "scheme-light dark:scheme-dark",
        "[&::-webkit-datetime-edit]:text-foreground",
        "[&::-webkit-datetime-edit-fields-wrapper]:text-foreground",
        "[&::-webkit-datetime-edit-text]:text-muted-foreground",
        "[&::-webkit-datetime-edit-month-field]:text-foreground",
        "[&::-webkit-datetime-edit-day-field]:text-foreground",
        "[&::-webkit-datetime-edit-year-field]:text-foreground",
        "[&::-webkit-datetime-edit-hour-field]:text-foreground",
        "[&::-webkit-datetime-edit-minute-field]:text-foreground",
        "[&::-webkit-datetime-edit-month-field:focus]:bg-foreground [&::-webkit-datetime-edit-month-field:focus]:text-background [&::-webkit-datetime-edit-month-field:focus]:rounded-sm",
        "[&::-webkit-datetime-edit-day-field:focus]:bg-foreground [&::-webkit-datetime-edit-day-field:focus]:text-background [&::-webkit-datetime-edit-day-field:focus]:rounded-sm",
        "[&::-webkit-datetime-edit-year-field:focus]:bg-foreground [&::-webkit-datetime-edit-year-field:focus]:text-background [&::-webkit-datetime-edit-year-field:focus]:rounded-sm",
        "[&::-webkit-datetime-edit-hour-field:focus]:bg-foreground [&::-webkit-datetime-edit-hour-field:focus]:text-background [&::-webkit-datetime-edit-hour-field:focus]:rounded-sm",
        "[&::-webkit-datetime-edit-minute-field:focus]:bg-foreground [&::-webkit-datetime-edit-minute-field:focus]:text-background [&::-webkit-datetime-edit-minute-field:focus]:rounded-sm",
        "[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:transition-opacity hover:[&::-webkit-calendar-picker-indicator]:opacity-100",
        className,
      )}
    />
  );
}
