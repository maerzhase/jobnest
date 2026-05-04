"use client";

import { getVersion } from "@tauri-apps/api/app";
import { openUrl } from "@tauri-apps/plugin-opener";

const SUPPORT_EMAIL = "jobnest_support@m3000.io";

type ReportIssueOptions = {
  errorMessage?: string;
};

function getOsLabel(): string {
  const nav = navigator as Navigator & {
    userAgentData?: {
      platform?: string;
    };
  };
  const platform = nav.userAgentData?.platform ?? navigator.platform;

  if (platform?.startsWith("Mac")) {
    return "macOS";
  }

  if (platform?.startsWith("Win")) {
    return "Windows";
  }

  if (platform?.startsWith("Linux")) {
    return "Linux";
  }

  return platform ?? "Unknown OS";
}

function buildReportIssueUrl({
  appVersion,
  errorMessage,
  os,
  userAgent,
}: ReportIssueOptions & {
  appVersion: string;
  os: string;
  userAgent: string;
}): string {
  const subject = `JobNest issue (v${appVersion}, ${os})`;
  const bodyLines = [
    "Describe what happened:",
    "",
    "",
    "Details:",
    `JobNest version: ${appVersion}`,
    `OS: ${os}`,
    `User agent: ${userAgent}`,
  ];

  if (errorMessage) {
    bodyLines.push("", "Error message:", errorMessage);
  }

  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
}

export async function reportIssue({
  errorMessage,
}: ReportIssueOptions = {}): Promise<void> {
  const appVersion = await getVersion();
  const os = getOsLabel();
  const userAgent = navigator.userAgent;

  await openUrl(
    buildReportIssueUrl({
      appVersion,
      errorMessage,
      os,
      userAgent,
    }),
  );
}
