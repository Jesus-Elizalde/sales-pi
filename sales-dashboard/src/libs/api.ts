const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";      // "" = same origin during dev

export interface ApiError {
  status: number;
  message: string;
  payload?: unknown;
}

async function handle<T>(r: Response): Promise<T> {
  if (r.ok) return (await r.json()) as T;

  let payload: unknown;
  try {
    payload = await r.json();
  } catch {
    /* ignore */
  }
  const err: ApiError = {
    status: r.status,
    message: typeof payload === 'object' && payload !== null && 'error' in payload
      ? (payload as { error: string }).error
      : r.statusText,
    payload
  };
  throw err;
}

export function api<T = unknown>(path: string, opts?: RequestInit): Promise<T> {
  return fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...opts
  }).then(r => handle<T>(r));
}

/* Utility helpers for files/streams */
export async function apiBlob(path: string, opts?: RequestInit): Promise<Blob> {
  const r = await fetch(`${API_BASE}${path}`, { credentials: "include", ...opts });
  if (!r.ok) throw { status: r.status, message: r.statusText };
  return r.blob();
}