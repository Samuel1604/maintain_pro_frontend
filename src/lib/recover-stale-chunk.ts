const STALE_CHUNK_RELOAD_KEY = "maintainpro:stale-chunk-reload";
const RELOAD_GUARD_MS = 30_000;

export function isStaleChunkError(value: unknown): boolean {
  const message = value instanceof Error ? value.message : String(value ?? "");
  return /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk|ChunkLoadError/i.test(
    message,
  );
}

export function reloadOnceForStaleChunk(): boolean {
  const now = Date.now();
  const previous = Number(sessionStorage.getItem(STALE_CHUNK_RELOAD_KEY) ?? 0);

  if (now - previous < RELOAD_GUARD_MS) return false;

  sessionStorage.setItem(STALE_CHUNK_RELOAD_KEY, String(now));
  window.location.reload();
  return true;
}
