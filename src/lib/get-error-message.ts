import { mapHttpToAppError } from "./errors/errorMapper";
import { getApiValidationMessages } from "@/lib/form-errors";

function uniqueMessages(messages: string[]): string[] {
  return [...new Set(messages.map((message) => message.trim()).filter(Boolean))];
}

export function getErrorMessages(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string[] {
  if (!error) return [fallback];

  const appError = mapHttpToAppError(error);
  const validationMsgs = appError.errors ? getApiValidationMessages(appError) : [];

  return uniqueMessages([appError.message, ...validationMsgs]);
}

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  return getErrorMessages(error, fallback)[0] ?? fallback;
}
