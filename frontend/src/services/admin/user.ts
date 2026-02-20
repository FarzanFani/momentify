import axiosInstance from "@/api/axiosInstance";
import { ApiResponse } from "@/types/general";
import { User } from "../auth.service";

export interface UserList {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  phone_number: string;
  is_verified: boolean;
  is_active: boolean;
}

export interface GetUserResult {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserList[];
}

export interface UpdateUserPayload {
  id: string;
  is_verified?: boolean;
  is_active?: boolean;
}

export interface UsersParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  is_verified?: string;
  role?: string;
  role__in?: string;
  ordering?: string;
  [key: string]: string | number | boolean | undefined;
}

export const getUsers = async (params: UsersParams): Promise<GetUserResult> => {
  const response = await axiosInstance.get<ApiResponse<GetUserResult>>(
    "/api/accounts/users/",
    { params },
  );
  if (!response.data.success) {
    throw response.data;
  }
  return response.data.data as GetUserResult;
};

export const updateUser = async ({
  id,
  ...payload
}: UpdateUserPayload): Promise<UserList> => {
  const { data } = await axiosInstance.patch<ApiResponse<UserList>>(
    `/api/accounts/users/${id}/`,
    payload,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as UserList;
};

export interface AddUserPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: "CUSTOMER" | "PROVIDER";
}

export const addUser = async (payload: AddUserPayload): Promise<User> => {
  const { data } = await axiosInstance.post<ApiResponse<User>>(
    "/api/accounts/add/",
    payload,
  );
  if (!data.success) {
    throw data;
  }
  return data.data as User;
};
