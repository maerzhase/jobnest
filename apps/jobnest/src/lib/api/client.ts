import { getErrorMessage } from "../error-handler";

export class LocalApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LocalApiError";
  }
}

export async function executeLocalApiCall<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw new LocalApiError(getErrorMessage(error));
  }
}
