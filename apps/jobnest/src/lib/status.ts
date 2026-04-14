/**
 * Application status formatting and styling utilities
 */

export const STATUS_OPTIONS = [
  { label: "Saved", value: "saved" },
  { label: "Applied", value: "applied" },
  { label: "Interview", value: "interview" },
  { label: "Offer", value: "offer" },
  { label: "Rejected", value: "rejected" },
] as const;

export type ApplicationStatus = (typeof STATUS_OPTIONS)[number]["value"];

export function formatStatusLabel(value: string): string {
  return (
    STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value
  );
}

export function normalizeStatus(value: string): ApplicationStatus {
  return STATUS_OPTIONS.some((option) => option.value === value)
    ? (value as ApplicationStatus)
    : "saved";
}
