const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const ADMIN_TOKEN_KEY = "feepilot_admin_token";

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function adminFetch<T>(payload: Record<string, unknown>): Promise<T> {
  const token = getAdminToken();
  const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-dashboard`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      apikey: SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify(payload),
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // Some errors may return non-JSON; ignore and fall back to status text.
  }
  if (!response.ok) {
    throw new Error(data?.error || `Admin request failed (${response.status})`);
  }

  return data as T;
}

export async function adminLogin(username: string, password: string) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ username, password }),
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // ignore
  }
  if (!response.ok) {
    throw new Error(data?.error || `Login failed (${response.status})`);
  }

  return data as { token: string };
}

export async function adminLogin(username: string, password: string) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "Login failed");
  }

  return data as { token: string };
}
