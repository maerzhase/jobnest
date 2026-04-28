"use client";

import { useEffect, useState } from "react";
import {
  Field,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTriggerButton,
  SelectValueText,
} from "@jobnest/ui";
import { CURRENCY_OPTIONS } from "../../lib/settings";
import { SettingsSection, SettingBlock } from "./settings-section";

type ApplicationsSettingsProps = {
  preferredCurrency: string;
  staleApplicationDays: number;
  onCurrencyChange: (currency: string) => void;
  onStaleApplicationDaysChange: (days: number) => Promise<void>;
  isSaving: boolean;
  isSavingStaleApplicationDays: boolean;
};

export function ApplicationsSettings({
  preferredCurrency,
  staleApplicationDays,
  onCurrencyChange,
  onStaleApplicationDaysChange,
  isSaving,
  isSavingStaleApplicationDays,
}: ApplicationsSettingsProps) {
  const [draftStaleDays, setDraftStaleDays] = useState(String(staleApplicationDays));

  useEffect(() => {
    setDraftStaleDays(String(staleApplicationDays));
  }, [staleApplicationDays]);

  return (
    <SettingsSection
      category="Applications"
      title="New application defaults"
      description="Choose how JobNest should prefill new application details and when it should start treating quiet applications as stale."
    >
      <SettingBlock
        title="Currency"
        description="Used as the fixed currency in salary expectation and offer inputs."
      >
        <Field label="Preferred currency" name="preferredCurrency">
          <Select
            disabled={isSaving}
            name="preferredCurrency"
            onValueChange={(value) => {
              if (value) {
                onCurrencyChange(value);
              }
            }}
            value={preferredCurrency}
          >
            <SelectTriggerButton>
              <SelectValueText placeholder="Choose a currency" />
            </SelectTriggerButton>
            <SelectContent>
              {CURRENCY_OPTIONS.map((currency) => (
                <SelectItem
                  key={currency.value}
                  value={currency.value}
                >
                  {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </SettingBlock>

      <div className="mt-8 border-t border-border pt-8">
        <SettingBlock
          title="Stale applications"
          description="Pick how many days without updates should pass before an application is treated as stale across the dashboard, tracker, and history."
        >
          <Field
            description="Days"
            label="Stale after"
            name="staleApplicationDays"
          >
            <Input
              disabled={isSavingStaleApplicationDays}
              inputMode="numeric"
              max={365}
              min={1}
              onBlur={() => {
                const parsedValue = Number.parseInt(draftStaleDays, 10);
                const normalizedValue = Number.isNaN(parsedValue)
                  ? staleApplicationDays
                  : Math.min(365, Math.max(1, parsedValue));

                setDraftStaleDays(String(normalizedValue));
                void onStaleApplicationDaysChange(normalizedValue);
              }}
              onChange={(event) => {
                setDraftStaleDays(event.target.value);
              }}
              size="md"
              type="number"
              value={draftStaleDays}
            />
          </Field>
        </SettingBlock>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <p className="text-sm font-medium">Current behavior</p>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
          Salary inputs in the create dialog now use{" "}
          <span className="font-medium text-foreground">
            {preferredCurrency}
          </span>{" "}
          as a fixed currency label and mark applications as stale after{" "}
          <span className="font-medium text-foreground">
            {staleApplicationDays} day{staleApplicationDays === 1 ? "" : "s"}
          </span>{" "}
          without updates.
        </p>
      </div>
    </SettingsSection>
  );
}
