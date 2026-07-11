import {
  GetUserResult,
  getUsers,
  updateUser,
  UpdateUserPayload,
  UserList,
  UsersParams,
  AddUserPayload,
  addUser,
} from "@/services/admin/user";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ApiResponse } from "@/types/general";
import { User } from "@/services/auth.service";

export const useUsers = (params: UsersParams, refreshKey = 0) => {
  return useQuery<GetUserResult, AxiosError<ApiResponse<null>>, GetUserResult>({
    queryKey: ["users", params, refreshKey],
    queryFn: () => getUsers(params),
  });
};

export const useUpdateUser = () => {
  return useMutation<
    UserList,
    AxiosError<ApiResponse<null>>,
    UpdateUserPayload
  >({
    mutationFn: updateUser,
  });
};

export const useAddUser = () => {
  return useMutation<User, AxiosError<ApiResponse<null>>, AddUserPayload>({
    mutationFn: addUser,
    onError: (error) => {
      const errors = error.response?.data?.errors;
      if (errors) {
        const message = Object.values(errors).flat().join("\n");
        return message;
      }
      return "User addition failed";
    },
  });
};
