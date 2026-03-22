import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const ACCESS_KEY = "lms_access_token";

let memoryToken: string | null = null;

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  if (memoryToken) return memoryToken;
  memoryToken = localStorage.getItem(ACCESS_KEY);
  return memoryToken;
}

export function setAccessToken(token: string | null): void {
  memoryToken = token;
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(ACCESS_KEY, token);
  else localStorage.removeItem(ACCESS_KEY);
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const t = getAccessToken();
  if (t) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const base = apiClient.defaults.baseURL ?? "";
  const { data } = await axios.post<{ accessToken: string }>(
    `${base}/api/auth/refresh`,
    {},
    { withCredentials: true }
  );
  setAccessToken(data.accessToken);
  return data.accessToken;
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig | undefined;
    const status = error.response?.status;

    if (!original || original._retry || status !== 401) {
      return Promise.reject(error);
    }

    const url = original.url ?? "";
    if (url.includes("/api/auth/refresh") || url.includes("/api/auth/login") || url.includes("/api/auth/register")) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;
      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    } catch {
      setAccessToken(null);
      return Promise.reject(error);
    }
  }
);
