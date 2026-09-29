import { apiClient } from "@/api/client";

type QueryParam = string | number | boolean;
const API_PREFIX = "/api/v1";

interface RequestOptions {
  params?: Record<string, QueryParam>;
  idempotencyKey?: string;
}

function toConfig(options?: RequestOptions) {
  if (!options) return undefined;
  return {
    ...(options.params ? { params: options.params } : {}),
    ...(options.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : {}),
  };
}

function toApiClientPath(url: string): string {
  return url.startsWith(API_PREFIX) ? url.slice(API_PREFIX.length) || "/" : url;
}

export const httpClient = {
  download: (url: string, filename: string) => apiClient.download(toApiClientPath(url), filename),
  get: <T>(url: string, options?: RequestOptions) =>
    apiClient.get<T>(toApiClientPath(url), toConfig(options)),
  post: <T>(url: string, body: unknown, options?: RequestOptions) =>
    apiClient.post<T>(toApiClientPath(url), body, toConfig(options)),
  put: <T>(url: string, body: unknown, options?: RequestOptions) =>
    apiClient.put<T>(toApiClientPath(url), body, toConfig(options)),
  patch: <T>(url: string, body: unknown, options?: RequestOptions) =>
    apiClient.patch<T>(toApiClientPath(url), body, toConfig(options)),
  delete: <T>(url: string, options?: RequestOptions) =>
    apiClient.delete<T>(toApiClientPath(url), toConfig(options)),
};
