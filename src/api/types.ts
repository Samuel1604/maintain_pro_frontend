export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export type ValidationErrors =
  | Record<string, string[] | string>
  | string[]
  | ValidationIssue[];

export interface ApplicationResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationErrors;
  meta?: PaginationMeta | Record<string, unknown>;
  timestamp?: string;
  /** Stable machine-readable error identifier, e.g. "EMAIL_NOT_VERIFIED". Only present on error responses. */
  code?: string;
}

export interface PaginatedApplicationResult<T = unknown>
  extends ApplicationResult<T[]> {
  data: T[];
  meta: PaginationMeta;
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly errors?: ValidationErrors;

  constructor(message: string, status: number, errors?: ValidationErrors) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors;
  }
}

export type ApiResponse<T = unknown> = ApplicationResult<T>;
export type PaginatedResponse<T = unknown> = PaginatedApplicationResult<T>;
