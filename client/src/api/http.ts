import axios, { AxiosError } from 'axios';

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  error: { code: string; message: string; details?: ApiErrorDetail[] };
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  withCredentials: true,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ApiErrorDetail[];

  constructor(status: number, message: string, code: string, details: ApiErrorDetail[] = []) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const UNAUTHORIZED_EVENT = 'etd:unauthorized';

export const onUnauthorized = (handler: () => void) => {
  window.addEventListener(UNAUTHORIZED_EVENT, handler);
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
};

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status ?? 0;
    const body = error.response?.data;

    if (status === 401 && !error.config?.url?.includes('/auth/')) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    const message =
      body?.error?.message ??
      (status === 0 ? 'Cannot reach the server. Check your connection.' : 'Request failed');

    return Promise.reject(
      new ApiError(status, message, body?.error?.code ?? 'NETWORK_ERROR', body?.error?.details),
    );
  },
);

export const fieldErrorMessage = (error: unknown, field: string) =>
  error instanceof ApiError
    ? error.details.find((detail) => detail.field === field)?.message
    : undefined;
