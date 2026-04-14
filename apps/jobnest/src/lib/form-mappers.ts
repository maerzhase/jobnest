/**
 * Form data mappers - convert between application models and form values
 */
import type { ApplicationListItem } from "./api/bindings";
import { parseSalaryValue } from "./salary";
import { normalizeStatus, type ApplicationStatus } from "./status";

export type { ApplicationListItem } from "./api/bindings";

export type CreateApplicationValues = {
  jobPostUrl: string;
  companyName: string;
  roleTitle: string;
  salaryExpectation: string;
  salaryExpectationCurrency: string;
  salaryOffer: string;
  salaryOfferCurrency: string;
  status: ApplicationStatus;
  notes: string;
};

export const formDefaults: CreateApplicationValues = {
  jobPostUrl: "",
  companyName: "",
  roleTitle: "",
  salaryExpectation: "",
  salaryExpectationCurrency: "EUR",
  salaryOffer: "",
  salaryOfferCurrency: "EUR",
  status: "saved",
  notes: "",
};

export function getFormDefaults(
  preferredCurrency: string
): CreateApplicationValues {
  return {
    ...formDefaults,
    salaryExpectationCurrency: preferredCurrency,
    salaryOfferCurrency: preferredCurrency,
  };
}

export function mapApplicationToFormValues(
  application: ApplicationListItem,
  preferredCurrency: string
): CreateApplicationValues {
  const salaryExpectation = parseSalaryValue(
    application.salaryExpectation,
    preferredCurrency
  );
  const salaryOffer = parseSalaryValue(
    application.salaryOffer,
    preferredCurrency
  );

  return {
    jobPostUrl: application.jobPostUrl ?? "",
    companyName: application.companyName,
    roleTitle: application.roleTitle,
    salaryExpectation: salaryExpectation.amount,
    salaryExpectationCurrency: salaryExpectation.currency,
    salaryOffer: salaryOffer.amount,
    salaryOfferCurrency: salaryOffer.currency,
    status: normalizeStatus(application.status),
    notes: application.notes ?? "",
  };
}
