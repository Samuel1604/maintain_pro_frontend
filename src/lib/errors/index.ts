export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  BusinessError,
  NetworkError,
  UnexpectedError,
  type ErrorCategory,
} from "./AppError";

export { mapHttpToAppError } from "./errorMapper";
