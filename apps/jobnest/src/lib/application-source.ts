export const APPLICATION_SOURCE_OPTIONS = [
  { label: "Direct application", value: "direct_application" },
  { label: "External recruiter", value: "external_recruiter" },
  { label: "Internal recruiter", value: "internal_recruiter" },
  { label: "Referral", value: "referral" },
  { label: "Other", value: "other" },
] as const;

export type ApplicationSource =
  (typeof APPLICATION_SOURCE_OPTIONS)[number]["value"];

export const DEFAULT_APPLICATION_SOURCE: ApplicationSource =
  "direct_application";

export function normalizeApplicationSource(value: string): ApplicationSource {
  return APPLICATION_SOURCE_OPTIONS.some((option) => option.value === value)
    ? (value as ApplicationSource)
    : DEFAULT_APPLICATION_SOURCE;
}
