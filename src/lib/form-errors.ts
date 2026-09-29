import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { ApiClientError, type ValidationErrors, type ValidationIssue } from "@/api/types";
import { AppError } from "@/lib/errors/AppError";

export type ApiFieldErrorMap<TFormValues extends FieldValues> = Partial<Record<Path<TFormValues>, string>>;

function firstMessage(value: string | string[]): string {
  return Array.isArray(value) ? value[0] ?? "Invalid value" : value;
}

function isValidationIssue(value: unknown): value is ValidationIssue {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof (value as ValidationIssue).message === "string"
  );
}

function isValidationIssueArray(errors: ValidationErrors): errors is ValidationIssue[] {
  return Array.isArray(errors) && errors.every(isValidationIssue);
}

function issueMatchesField(issueField: string, fieldName: string): boolean {
  return issueField === fieldName || issueField.endsWith(`.${fieldName}`);
}

export function labelApiField(field: string): string {
  if (!field) return "Form";

  return field
    .split(".")
    .filter(Boolean)
    .map((part) =>
      part
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[-_]/g, " ")
        .replace(/^\w/, (char) => char.toUpperCase()),
    )
    .join(" ");
}

export function getValidationErrors(error: unknown): ValidationErrors | undefined {
  if (error instanceof ApiClientError) return error.errors;
  if (error instanceof AppError) return error.errors;
  return undefined;
}

export function getApiFieldError(error: unknown, field: string): string | undefined {
  const errors = getValidationErrors(error);

  if (!errors) {
    return undefined;
  }

  if (isValidationIssueArray(errors)) {
    return errors.find((issue) => issueMatchesField(issue.field, field))?.message;
  }

  if (Array.isArray(errors)) {
    return undefined;
  }

  const message = errors[field];
  return message ? firstMessage(message) : undefined;
}

export function getApiFormError(error: unknown): string | undefined {
  const errors = getValidationErrors(error);

  if (!errors || isValidationIssueArray(errors) || !Array.isArray(errors)) {
    return undefined;
  }

  return errors[0];
}

export function getApiValidationMessages(error: unknown): string[] {
  const errors = getValidationErrors(error);

  if (!errors) {
    return [];
  }

  if (isValidationIssueArray(errors)) {
    return errors.map((issue) =>
      issue.field ? `${labelApiField(issue.field)}: ${issue.message}` : issue.message,
    );
  }

  if (Array.isArray(errors)) {
    return errors;
  }

  return Object.entries(errors).flatMap(([field, message]) => {
    const messages = Array.isArray(message) ? message : [message];
    return messages.map((item) => `${labelApiField(field)}: ${item}`);
  });
}

export function mapApiValidationErrors<TFormValues extends FieldValues>(
  error: unknown,
  fieldNames: readonly Path<TFormValues>[]
): ApiFieldErrorMap<TFormValues> {
  const errors = getValidationErrors(error);

  if (!errors) {
    return {};
  }

  if (isValidationIssueArray(errors)) {
    return fieldNames.reduce<ApiFieldErrorMap<TFormValues>>((mappedErrors, fieldName) => {
      const issue = errors.find((item) => issueMatchesField(item.field, fieldName));
      if (issue) {
        mappedErrors[fieldName] = issue.message;
      }

      return mappedErrors;
    }, {});
  }

  if (Array.isArray(errors)) {
    return {};
  }

  return fieldNames.reduce<ApiFieldErrorMap<TFormValues>>((mappedErrors, fieldName) => {
    const message = errors[fieldName];
    if (message) {
      mappedErrors[fieldName] = firstMessage(message);
    }

    return mappedErrors;
  }, {});
}

export function applyBackendValidationErrors<TFormValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFormValues>,
  fieldNames: readonly Path<TFormValues>[]
): boolean {
  const mappedErrors = mapApiValidationErrors(error, fieldNames);

  let applied = false;

  Object.entries(mappedErrors).forEach(([fieldName, message]) => {
    if (!message) return;

    setError(fieldName as Path<TFormValues>, {
      type: "server",
      message: message as string,
    });
    applied = true;
  });

  return applied;
}
