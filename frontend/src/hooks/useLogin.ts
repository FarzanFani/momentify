import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { login, LoginPayload, LoginResult } from "@/services/auth.service";
import { ApiResponse } from "@/types/general";

export const useLogin = () => {
  return useMutation<LoginResult, AxiosError<ApiResponse<null>>, LoginPayload>({
    mutationFn: login,
  });
};
