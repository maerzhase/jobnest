export const SETTINGS_SECTIONS = [
  {
    value: "appearance",
    label: "Appearance",
    description: "Theme and display preferences.",
  },
  {
    value: "applications",
    label: "Applications",
    description: "Defaults for new application entries.",
  },
  {
    value: "data",
    label: "Data",
    description: "Manage or clear local app data.",
  },
] as const;

export const CURRENCY_OPTIONS = [
  { value: "EUR", label: "Euro (EUR)" },
  { value: "USD", label: "US Dollar (USD)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "CHF", label: "Swiss Franc (CHF)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
  { value: "AUD", label: "Australian Dollar (AUD)" },
] as const;

export type SettingsSection = (typeof SETTINGS_SECTIONS)[number]["value"];

export type AppSettings = {
  preferredCurrency: string;
  updatedAt: string;
};

export const THEME_OPTIONS = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;
