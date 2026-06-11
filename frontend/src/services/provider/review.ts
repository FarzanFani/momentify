import axiosInstance from "@/api/axiosInstance";
import { ProviderReply, ProviderReplyPayload } from "../customer/review";
import { ApiResponse } from "@/types/general";

export const PostProviderReply = async (
  payload: ProviderReplyPayload,
): Promise<ProviderReply> => {
  const { data } = await axiosInstance.post<ApiResponse<ProviderReply>>(
    `/api/review/${payload.review}/reply/`,
    payload,
  );

  if (!data) {
    throw data;
  }

  return data.data as ProviderReply;
};
