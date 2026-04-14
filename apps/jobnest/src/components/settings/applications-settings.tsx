"use client";

import {
  Field,
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
  onCurrencyChange: (currency: string) => void;
  isSaving: boolean;
};

export function ApplicationsSettings({
  preferredCurrency,
  onCurrencyChange,
  isSaving,
}: ApplicationsSettingsProps) {
  return (
    <SettingsSection
      category="Applications"
      title="New application defaults"
      description="Choose a fixed currency for salary fields so the create dialog can keep amounts consistent without free-typing the currency each time."
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

      <div className="mt-8 border-t border-border pt-6">
        <p className="text-sm font-medium">Current behavior</p>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
          Salary inputs in the create dialog now use{" "}
          <span className="font-medium text-foreground">
            {preferredCurrency}
          </span>{" "}
          as a fixed currency label and store the amount with that
          code.
        </p>
      </div>
    </SettingsSection>
  );
}
