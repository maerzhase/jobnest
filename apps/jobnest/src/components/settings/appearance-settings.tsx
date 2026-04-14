"use client";

import {
  Field,
  Select,
  SelectContent,
  SelectItem,
  SelectTriggerButton,
  SelectValueText,
} from "@acme/ui";
import { THEME_OPTIONS } from "../../lib/settings";
import { SettingsSection, SettingBlock } from "./settings-section";

type AppearanceSettingsProps = {
  theme: string | undefined;
  onThemeChange: (theme: string) => void;
  resolvedTheme: string | undefined;
  isThemeReady: boolean;
};

export function AppearanceSettings({
  theme,
  onThemeChange,
  resolvedTheme,
  isThemeReady,
}: AppearanceSettingsProps) {
  return (
    <SettingsSection
      category="Appearance"
      title="Theme"
      description="Choose how JobNest should appear across the app windows."
    >
      <SettingBlock
        title="Color theme"
        description="Use the system preference or force a light or dark interface."
      >
        <Field label="Theme" name="theme">
          <Select
            disabled={!isThemeReady}
            name="theme"
            onValueChange={(value) => {
              if (value) {
                onThemeChange(value);
              }
            }}
            value={isThemeReady ? theme || "system" : "system"}
          >
            <SelectTriggerButton>
              <SelectValueText placeholder="Choose a theme" />
            </SelectTriggerButton>
            <SelectContent>
              {THEME_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <p className="text-muted-foreground text-sm leading-6">
          Active appearance:{" "}
          <span className="font-medium text-foreground">
            {resolvedTheme
              ? resolvedTheme.charAt(0).toUpperCase() +
                resolvedTheme.slice(1)
              : "System"}
          </span>
        </p>
      </SettingBlock>
    </SettingsSection>
  );
}
