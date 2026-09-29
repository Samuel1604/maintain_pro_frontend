import { AxiosError } from "axios";
import type { ApplicationResult } from "@/api/types";
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  BusinessError,
  EmailVerificationRequiredError,
  NetworkError,
  NotFoundError,
  UnexpectedError,
  ValidationError,
} from "./AppError";

/** Backend error codes that map to a specific AppError regardless of HTTP status. */
const EMAIL_NOT_VERIFIED_CODE = "EMAIL_NOT_VERIFIED";

function sanitizeMessage(rawMessage?: string, defaultMessage?: string): string {
  if (!rawMessage) return defaultMessage || "An error occurred";
  
  // Guard against exposing raw database, stack trace, or internal exception names
  const sensitivePatterns = [
    /mongo/i,
    /sql/i,
    /exception/i,
    /nullpointer/i,
    /stack trace/i,
    /connect ECONNREFUSED/i,
  ];

  for (const pattern of sensitivePatterns) {
    if (pattern.test(rawMessage)) {
      return defaultMessage || "An error occurred while processing your request.";
    }
  }

  return rawMessage;
}

export function mapHttpToAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (!error) {
    return new UnexpectedError();
  }

  const axiosError = error as AxiosError<ApplicationResult>;
  const status = axiosError.response?.status ?? 0;
  const body = axiosError.response?.data;
  const rawMessage = body?.message;

  if (status === 0 || axiosError.code === "ERR_NETWORK") {
    return new NetworkError();
  }

  // Code-based classification takes priority over status-based classification:
  // the backend's `code` is a stable contract, while status codes are reused
  // across several distinct situations (e.g. 403 covers both "wrong role" and
  // "email not verified").
  if (body?.code === EMAIL_NOT_VERIFIED_CODE) {
    return new EmailVerificationRequiredError(
      sanitizeMessage(rawMessage, "Please verify your email address to continue."),
      status,
      body?.errors
    );
  }

  switch (status) {
    case 400:
    case 422:
      return new ValidationError(
        sanitizeMessage(rawMessage, "Invalid input data provided."),
        status,
        body?.errors
      );
    case 401:
      return new AuthenticationError(
        sanitizeMessage(rawMessage, "Authentication failed. Please sign in again."),
        status,
        body?.errors
      );
    case 403:
      return new AuthorizationError(
        sanitizeMessage(rawMessage, "You do not have permission to perform this action."),
        status,
        body?.errors
      );
    case 404:
      return new NotFoundError(
        sanitizeMessage(rawMessage, "The requested resource was not found."),
        status,
        body?.errors
      );
    case 409:
      return new BusinessError(
        sanitizeMessage(rawMessage, "This action conflicts with existing data."),
        status,
        body?.errors
      );
    case 500:
    case 502:
    case 503:
    case 504:
      return new UnexpectedError(
        "Something went wrong on our end. Please try again later.",
        status,
        body?.errors
      );
    default:
      return new UnexpectedError(
        sanitizeMessage(rawMessage, "An unexpected error occurred."),
        status,
        body?.errors
      );
  }
}
