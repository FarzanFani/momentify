import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const PUBLIC_PATHS = ["/api/token/", "/api/accounts/register/"];

type RefreshTokenResponse = {
  access?: string;
  refresh?: string;
  data?: {
    access?: string;
    refresh?: string;
  };
};

axiosInstance.interceptors.request.use((config) => {
  const isPublic = PUBLIC_PATHS.some((path) => config.url?.includes(path));
  if (!isPublic && typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: AxiosError) => void;
}[] = [];

function processQueue(error: AxiosError | null, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token!);
  });
  failedQueue = [];
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const url = originalRequest?.url || "";
    const isPublic = PUBLIC_PATHS.some((path) => url.includes(path));

    if (error.response?.status !== 401 || isPublic || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      });
    }

    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const { data } = await axios.post<RefreshTokenResponse>(
        `${BASE_URL}/api/token/refresh/`,
        {
          refresh: refreshToken,
        },
      );
      const newAccess = data.data?.access ?? data.access;
      const newRefresh = data.data?.refresh ?? data.refresh;

      if (!newAccess) {
        throw error;
      }

      localStorage.setItem("access_token", newAccess);
      if (newRefresh) {
        localStorage.setItem("refresh_token", newRefresh);
      }
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      processQueue(null, newAccess);
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as AxiosError, null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;
