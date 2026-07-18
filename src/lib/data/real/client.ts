// Shared fetch helper for the typed adapters over the existing /api/* endpoints.
export async function getJSON<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
  const url = new URL(path, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, value);
    }
  }
  const res = await fetch(url.pathname + url.search);
  if (!res.ok) throw new Error(`${path} failed: HTTP ${res.status}`);
  return res.json() as Promise<T>;
}
