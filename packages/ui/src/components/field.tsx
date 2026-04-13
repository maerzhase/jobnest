"use client";

import { Field as BaseField } from "@base-ui/react/field";
import type { ComponentPropsWithoutRef, JSX, ReactNode } from "react";
import { cn } from "../lib/cn";

type BaseFieldRootProps = ComponentPropsWithoutRef<typeof BaseField.Root>;

export interface FieldProps extends Omit<BaseFieldRootProps, "children"> {
  children: ReactNode;
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  className?: string;
}

export function Field({
  children,
  className,
  description,
  error,
  label,
  ...props
}: FieldProps): JSX.Element {
  return (
    <BaseField.Root
      {...props}
      className={cn("grid gap-2", className)}
      invalid={Boolean(error) || props.invalid}
    >
      <div className="flex items-center justify-between gap-4">
        <BaseField.Label className="text-sm font-medium text-foreground">
          {label}
        </BaseField.Label>
        {description ? (
          <BaseField.Description className="text-xs text-muted-foreground">
            {description}
          </BaseField.Description>
        ) : null}
      </div>

      {children}

      {error ? (
        <BaseField.Error className="text-sm text-red-600 dark:text-red-400">
          {error}
        </BaseField.Error>
      ) : null}
    </BaseField.Root>
  );
}
