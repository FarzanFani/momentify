import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  login,
  LoginPayload,
  LoginResult,
  ApiResponse,
} from "@/services/auth.service";

export const useLogin = () => {
  return useMutation<LoginResult, AxiosError<ApiResponse<null>>, LoginPayload>({
    mutationFn: login,
  });
};
