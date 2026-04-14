/**
 * Form data mappers - convert between application models and form values
 */
import { parseSalaryValue } from "./salary";
import { normalizeStatus, type ApplicationStatus } from "./status";

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

export type ApplicationListItem = {
  id: string;
  companyName: string;
  roleTitle: string;
  jobPostUrl: string | null;
  salaryExpectation: string | null;
  salaryOffer: string | null;
  status: string;
  appliedAt: string | null;
  firstResponseAt: string | null;
  notes: string | null;
  updatedAt: string;
  archivedAt: string | null;
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
