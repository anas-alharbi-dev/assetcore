const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export function saveTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export async function refreshAccessToken() {
  const refresh = getRefreshToken();

  if (!refresh) {
    throw new Error("No refresh token found");
  }

  const response = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    clearTokens();
    throw new Error("Failed to refresh token");
  }

  const data: { access: string } = await response.json();

  localStorage.setItem(ACCESS_KEY, data.access);

  return data.access;
}

export async function authFetch(url: string, options: RequestInit = {}) {
  let token = getAccessToken();

  const makeRequest = async (accessToken: string | null) => {
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(accessToken
          ? { Authorization:`Bearer ${accessToken}` }
          : {}),
      },
    });
  };

  let response = await makeRequest(token);

  if (response.status === 401) {
    try {
      const newAccess = await refreshAccessToken();
      response = await makeRequest(newAccess);
    } catch (err) {
      clearTokens();
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }
  }

  return response;
}