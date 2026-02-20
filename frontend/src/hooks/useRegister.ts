import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { register, RegisterPayload, User } from "@/services/auth.service";
import { ApiResponse } from "@/types/general";

export const useRegister = () => {
  return useMutation<User, AxiosError<ApiResponse<null>>, RegisterPayload>({
    mutationFn: register,
    onError: (error) => {
      const errors = error.response?.data?.errors;
      if (errors) {
        const message = Object.values(errors).flat().join("\n");
        return message;
      }
      return "Registration failed";
    },
  });
};
