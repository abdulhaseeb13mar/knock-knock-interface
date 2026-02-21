import { getToken, removeToken } from "./auth";

const BASE_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    removeToken();
    window.location.href = "/login";
    throw new ApiError(401, "Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

function headers(extra?: HeadersInit): HeadersInit {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (token) h["Authorization"] = `Bearer ${token}`;
  if (extra) Object.assign(h, extra);
  return h;
}

export const api = {
  get<T>(path: string): Promise<T> {
    return fetch(`${BASE_URL}${path}`, { headers: headers() }).then((r) => handleResponse<T>(r));
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: headers(),
      body: body != null ? JSON.stringify(body) : undefined,
    }).then((r) => handleResponse<T>(r));
  },
  delete<T>(path: string): Promise<T> {
    return fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: headers(),
    }).then((r) => handleResponse<T>(r));
  },

  /** For multipart/form-data uploads — caller passes FormData directly */
  upload<T>(path: string, formData: FormData): Promise<T> {
    const token = getToken();
    const h: Record<string, string> = {};
    if (token) h["Authorization"] = `Bearer ${token}`;
    // Let the browser set Content-Type with boundary
    return fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: h,
      body: formData,
    }).then((r) => handleResponse<T>(r));
  },
};

/** Returns the full URL for SSE endpoints (used with fetch-event-source) */
export function sseUrl(path: string): string {
  return `${BASE_URL}${path}`;
}
