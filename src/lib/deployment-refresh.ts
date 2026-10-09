const DEPLOYMENT_CHECK_INTERVAL_MS = 60_000;

function currentEntryAsset(): string | null {
  return document.querySelector<HTMLScriptElement>('script[type="module"][src]')?.src ?? null;
}

async function hasNewDeployment(entryAsset: string): Promise<boolean> {
  const response = await fetch(`/?deployment-check=${Date.now()}`, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
  });
  if (!response.ok) return false;

  const html = await response.text();
  const match = html.match(/<script[^>]+type=["']module["'][^>]+src=["']([^"']+)["']/i);
  if (!match?.[1]) return false;

  return new URL(match[1], window.location.origin).href !== entryAsset;
}

export function startDeploymentRefresh(): () => void {
  const entryAsset = currentEntryAsset();
  if (!entryAsset) return () => undefined;

  let checking = false;
  const check = async () => {
    if (checking || document.visibilityState === "hidden") return;
    checking = true;
    try {
      if (await hasNewDeployment(entryAsset)) window.location.reload();
    } catch {
      // A temporary network failure should not interrupt the running app.
    } finally {
      checking = false;
    }
  };

  const interval = window.setInterval(check, DEPLOYMENT_CHECK_INTERVAL_MS);
  return () => window.clearInterval(interval);
}
