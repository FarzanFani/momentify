import axiosInstance from "@/api/axiosInstance";
import {
  CustomerReview,
  ProviderReply,
  ProviderReplyPayload,
} from "../customer/review";
import { ApiResponse } from "@/types/general";
import { GeneralListType } from "./services";

export type ProviderServiceReviewPayload = {
  page_size?: number;
  page?: number;
  service: string;
};

export const postProviderReply = async (
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

export const getProviderServiceReply = async (
  payload: ProviderServiceReviewPayload,
): Promise<GeneralListType<CustomerReview>> => {
  const { service, ...params } = payload;
  const { data } = await axiosInstance.get<
    ApiResponse<GeneralListType<CustomerReview>>
  >(`/api/services/${service}/reviews/`, { params });

  if (!data) {
    throw data;
  }

  return data.data as GeneralListType<CustomerReview>;
};
