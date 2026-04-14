"use client";

import {
  cn,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTriggerButton,
  SelectValueText,
} from "@jobnest/ui";
import { CURRENCY_OPTIONS } from "../../lib/settings";

type SalaryInputProps = {
  value: string;
  onChange: (value: string) => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
  error?: string;
  invalid?: boolean;
  placeholder?: string;
};

export function SalaryInput({
  value,
  onChange,
  currency,
  onCurrencyChange,
  error,
  invalid = false,
  placeholder = "60000",
}: SalaryInputProps) {
  const hasError = invalid || Boolean(error);

  return (
    <div
      className={cn(
        "grid grid-cols-[124px_minmax(0,1fr)] rounded-md border bg-background shadow-sm transition-[border-color,box-shadow] focus-within:ring-3",
        hasError
          ? "border-red-500/50 focus-within:border-red-600 focus-within:ring-red-500/25"
          : "border-input focus-within:border-foreground focus-within:ring-ring/25"
      )}
    >
      <Select value={currency} onValueChange={onCurrencyChange}>
        <SelectTriggerButton className="h-11 rounded-none rounded-l-md border-0 border-r border-input shadow-none focus-visible:ring-0">
          <SelectValueText placeholder="Currency" />
        </SelectTriggerButton>
        <SelectContent>
          {CURRENCY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        className="border-0 shadow-none focus-visible:ring-0"
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
