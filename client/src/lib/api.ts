import axios, { type AxiosError } from "axios";

export const API_URL = import.meta.env.VITE_API_URL ?? "/api";

export const TOKEN_KEY = "spr_token";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
    unread?: number;
    [key: string]: unknown;
  };
}

export class ApiClientError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.details = details;
  }
}

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = (error as AxiosError<{ message?: string }>).response?.data;
    if (data?.message) return data.message;
    if (error.code === "ECONNABORTED") return "The request timed out. Please try again.";
    if (!error.response) return "Unable to reach the server. Check your connection.";
  }
  return error instanceof Error ? error.message : "Something went wrong";
};

export const extractData = async <T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> => {
  try {
    const { data } = await promise;
    return data.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status ?? 0;
      const message =
        (err.response?.data as { message?: string } | undefined)?.message ?? err.message;
      if (status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        window.dispatchEvent(new CustomEvent("spr:unauthorized"));
      }
      throw new ApiClientError(message, status, (err.response?.data as { details?: unknown })?.details);
    }
    throw err;
  }
};
