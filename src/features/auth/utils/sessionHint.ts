/**
 * The real auth token lives in an httpOnly cookie, so JS can never check
 * "am I logged in" directly. Without some hint, AuthInitializer has to
 * unconditionally call GET /auth/me on every app load — including for
 * guests who were never logged in — and a failed /me trips the 401
 * interceptor into also attempting POST /auth/refresh, which fails too.
 * That's two doomed requests on every logged-out page load.
 *
 * This flag is just a cheap, non-httpOnly hint: "the last thing we knew,
 * there was a session." It is set/cleared in lockstep with the auth store
 * (see setUser/clearUser in app/store.ts), so it's never a source of
 * truth by itself — the server's 401 is still what actually decides
 * whether a session is valid. It only decides whether it's worth asking.
 */
const SESSION_HINT_KEY = "hasSession";

export function setSessionHint(): void {
  try {
    localStorage.setItem(SESSION_HINT_KEY, "1");
  } catch {
    // Storage unavailable (private mode, disabled, etc). Fail open —
    // hasSessionHint() will also fail open below, restoring today's
    // behavior of always attempting /me for this browser.
  }
}

export function clearSessionHint(): void {
  try {
    localStorage.removeItem(SESSION_HINT_KEY);
  } catch {
    // ignore
  }
}

export function hasSessionHint(): boolean {
  try {
    return localStorage.getItem(SESSION_HINT_KEY) === "1";
  } catch {
    return true;
  }
}
