import axiosInstance from "@/api/axiosInstance";
import { ApiResponse } from "@/types/general";

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  phone_number: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  phone_number: string;
  is_verified: boolean;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
  } | null;
  errors: string[];
}

export const register = async (payload: RegisterPayload): Promise<User> => {
  const { data } = await axiosInstance.post<ApiResponse<User>>(
    "/api/accounts/register/",
    payload,
  );
  if (!data.success) {
    throw data;
  }
  return data.data as User;
};

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  access: string;
  refresh: string;
  user: User;
}

export const login = async (payload: LoginPayload): Promise<LoginResult> => {
  const { data } = await axiosInstance.post<ApiResponse<TokenResponse>>(
    "/api/token/",
    payload,
  );
  if (!data.success) {
    throw data;
  }
  const { access, refresh } = data.data as TokenResponse;

  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);

  const meRes = await axiosInstance.get<ApiResponse<User>>("/api/accounts/me/");
  const user = meRes.data.data as User;

  return { access, refresh, user };
};
