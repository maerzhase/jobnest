/**
 * Salary formatting and parsing utilities
 */

export function formatSalaryValue(
  value: string | undefined,
  currency: string
): string | undefined {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  return `${currency} ${trimmed}`;
}

export function parseSalaryValue(
  value: string | null,
  fallbackCurrency: string
): { amount: string; currency: string } {
  const trimmed = value?.trim();

  if (!trimmed) {
    return { amount: "", currency: fallbackCurrency };
  }

  const [currency, ...rest] = trimmed.split(/\s+/);
  if (!currency || rest.length === 0) {
    return { amount: trimmed, currency: fallbackCurrency };
  }

  return {
    amount: rest.join(" "),
    currency,
  };
}
