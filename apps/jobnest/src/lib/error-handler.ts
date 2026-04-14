/**
 * Centralized error message handling
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while talking to the local database.";
}
