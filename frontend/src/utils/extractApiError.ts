import { AxiosError } from "axios";
import { ApiResponse } from "@/types/general";

export function extractApiError(
  error: AxiosError<ApiResponse<null>>,
  fallback = "Something went wrong",
): string {
  const data = error.response?.data;

  if (data?.message) return data.message;

  if (data?.errors) {
    const fieldMessages = Object.values(data.errors).flat().join("\n");
    if (fieldMessages) return fieldMessages;
  }

  return fallback;
}
