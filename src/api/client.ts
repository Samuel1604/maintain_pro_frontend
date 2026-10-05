import axios, { AxiosError, type AxiosRequestConfig } from "axios";

import { ApiClientError, type ApplicationResult } from "./types";
import { useAuthStore } from "@/app/store";
import { mapHttpToAppError } from "@/lib/errors/errorMapper";

const AUTH_REFRESH_PATH = "/auth/refresh";
const AUTH_LOGIN_PATH = "/auth/login";

const CSRF_COOKIE_NAME = "csrfToken";
const CSRF_HEADER_NAME = "X-CSRF-Token";
const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

type RequestWithIdempotency = AxiosRequestConfig & { idempotencyKey?: string };

async function stableRequestKey(config: AxiosRequestConfig): Promise<string> {
  const body = typeof config.data === "string" ? config.data : JSON.stringify(config.data ?? {});
  const input = new TextEncoder().encode(`${config.method}:${config.url}:${body}`);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", input);
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
  return `ui-${hex}`;
}

/**
 * The auth token lives in an httpOnly cookie the browser attaches
 * automatically (withCredentials: true below) — there's nothing for JS
 * to read or attach for that. The csrf cookie is deliberately NOT
 * httpOnly so we can read it here and mirror it into a header, which is
 * what makes the double-submit check on the server meaningful (a
 * cross-site page can trigger the cookie to be sent, but can't read it
 * to reproduce this header).
 */
function readCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  withCredentials: true,
  // Keep local and interactive navigation responsive. Slow requests surface
  // through the app's retry/error states instead of holding a page hostage.
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

let csrfTokenPromise: Promise<string | undefined> | null = null;

async function getCsrfToken(): Promise<string | undefined> {
  const cookieToken = readCookie(CSRF_COOKIE_NAME);
  if (cookieToken) return cookieToken;
  if (!csrfTokenPromise) {
    csrfTokenPromise = client
      .get<{ token?: string | null }>("/csrf")
      .then((result) => result.token ?? undefined)
      .finally(() => {
        csrfTokenPromise = null;
      });
  }
  return csrfTokenPromise;
}

client.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();

  if (method && MUTATING_METHODS.has(method)) {
    const csrfToken = await getCsrfToken();

    if (csrfToken) {
      config.headers.set(CSRF_HEADER_NAME, csrfToken);
    }

    const request = config as RequestWithIdempotency;
    config.headers.set(
      "Idempotency-Key",
      request.idempotencyKey || (await stableRequestKey(config)),
    );
  }

  return config;
});

/**
 * Multiple requests can hit 401 at the same moment (e.g. several queries
 * firing on page load with an expired access token) — without sharing a
 * single in-flight refresh, each would independently call /auth/refresh,
 * racing to rotate the same token. Only one rotation can ever succeed
 * server-side; the rest would then see a *correctly successful* refresh
 * treated as a failure and incorrectly log the user out, even though their
 * session is fine. Every concurrent 401 instead awaits this one shared
 * promise, so exactly one refresh call is made per expiry, not N.
 */
let refreshPromise: Promise<void> | null = null;

function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = client
      .post(AUTH_REFRESH_PATH)
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise!;
}

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApplicationResult>) => {
    const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes(AUTH_REFRESH_PATH) &&
      !originalRequest.url?.includes(AUTH_LOGIN_PATH)
    ) {
      originalRequest._retry = true;

      try {
        await refreshSession();
        return client(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearUser();
        return Promise.reject(mapHttpToAppError(refreshError));
      }
    }

    if (error.response?.status === 401) {
      useAuthStore.getState().clearUser();
    }

    return Promise.reject(mapHttpToAppError(error));
  },
);

function unwrap<T>(result: ApplicationResult<T>): T {
  if (!result.success) {
    throw new ApiClientError(result.message, 0, result.errors);
  }

  return result.data as T;
}

export const apiClient = {
  async download(url: string, filename: string): Promise<void> {
    const response = await client.get(url, { responseType: "blob" });
    const objectUrl = URL.createObjectURL(response.data as Blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(objectUrl);
  },
  async getBlob(url: string): Promise<Blob> {
    const response = await client.get(url, { responseType: "blob" });
    return response.data as Blob;
  },
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await client.get<ApplicationResult<T>>(url, config);
    return unwrap(data);
  },

  async post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await client.post<ApplicationResult<T>>(url, body, config);
    return unwrap(data);
  },

  async put<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await client.put<ApplicationResult<T>>(url, body, config);
    return unwrap(data);
  },

  async patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await client.patch<ApplicationResult<T>>(url, body, config);
    return unwrap(data);
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await client.delete<ApplicationResult<T>>(url, config);
    return unwrap(data);
  },
};
