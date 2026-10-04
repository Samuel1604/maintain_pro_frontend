import type { ValidationErrors } from "@/api/types";

export type ErrorCategory =
  | "VALIDATION"
  | "AUTHENTICATION"
  | "AUTHORIZATION"
  | "NOT_FOUND"
  | "BUSINESS"
  | "NETWORK"
  | "EMAIL_VERIFICATION_REQUIRED"
  | "UNEXPECTED";

export abstract class AppError extends Error {
  abstract readonly category: ErrorCategory;
  readonly status: number;
  readonly errors?: ValidationErrors;

  constructor(message: string, status: number = 0, errors?: ValidationErrors) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.errors = errors;
  }
}

export class ValidationError extends AppError {
  readonly category = "VALIDATION";
  constructor(message = "Please check the entered information and try again.", status = 422, errors?: ValidationErrors) {
    super(message, status, errors);
  }
}

export class AuthenticationError extends AppError {
  readonly category = "AUTHENTICATION";
  constructor(message = "Invalid email or password. Please try again.", status = 401, errors?: ValidationErrors) {
    super(message, status, errors);
  }
}

export class AuthorizationError extends AppError {
  readonly category = "AUTHORIZATION";
  constructor(message = "You do not have permission to perform this action.", status = 403, errors?: ValidationErrors) {
    super(message, status, errors);
  }
}

/**
 * Email verification is an authorization concern layered on top of an
 * authenticated session — a valid, logged-in user can still be blocked from
 * specific restricted operations until they verify their email. Kept as its
 * own category (rather than folded into AUTHORIZATION) so the centralized
 * error handler can react to it distinctly, e.g. by opening the reusable
 * verification modal instead of showing a generic "forbidden" message.
 */
export class EmailVerificationRequiredError extends AppError {
  readonly category = "EMAIL_VERIFICATION_REQUIRED";
  constructor(message = "Please verify your email address to continue.", status = 403, errors?: ValidationErrors) {
    super(message, status, errors);
  }
}

export class NotFoundError extends AppError {
  readonly category = "NOT_FOUND";
  constructor(message = "The requested resource could not be found.", status = 404, errors?: ValidationErrors) {
    super(message, status, errors);
  }
}

export class BusinessError extends AppError {
  readonly category = "BUSINESS";
  constructor(message = "Unable to process request due to a business rule violation.", status = 409, errors?: ValidationErrors) {
    super(message, status, errors);
  }
}

export class NetworkError extends AppError {
  readonly category = "NETWORK";
  constructor(message = "Unable to reach the server. Please check your network connection.", status = 0, errors?: ValidationErrors) {
    super(message, status, errors);
  }
}

export class UnexpectedError extends AppError {
  readonly category = "UNEXPECTED";
  constructor(message = "Something went wrong on our end. Please try again later.", status = 500, errors?: ValidationErrors) {
    super(message, status, errors);
  }
}
