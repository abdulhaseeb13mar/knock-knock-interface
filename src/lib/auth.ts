const TOKEN_KEY = "kk_access_token";
const userRoles = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getUserRole(): string | null {
  const decoded = getTokenPayload();
  return typeof decoded?.role === "string" ? decoded.role : null;
}

export function isAdmin(): boolean {
  return getUserRole() === userRoles.ADMIN;
}

function getTokenPayload(): Record<string, unknown> | null {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function getCurrentUserId(): string | null {
  const payload = getTokenPayload();
  if (!payload) return null;

  if (typeof payload.sub === "string") return payload.sub;
  if (typeof payload.userId === "string") return payload.userId;
  if (typeof payload.id === "string") return payload.id;
  return null;
}
