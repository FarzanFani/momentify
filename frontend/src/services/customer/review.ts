import axiosInstance from "@/api/axiosInstance";
import { ApiResponse } from "@/types/general";

export type CustomerReviewPayload = {
  comments: string;
  rating: number;
  booking: string;
  is_ananymous: boolean;
};

export interface CustomerReview extends CustomerReviewPayload {
  id: string;
  customer_name: string;
  service: string;
  is_anonymous: boolean;
  created_at: string;
  reply: ProviderReply | null;
}

export type ProviderReplyPayload = {
  message: string;
  review: string;
};

export interface ProviderReply extends ProviderReplyPayload {
  user: string;
  created_at: string;
  user_name: string;
}

export const PostCustomerReview = async (
  payload: CustomerReviewPayload,
): Promise<CustomerReview> => {
  const { data } = await axiosInstance.post<ApiResponse<CustomerReview>>(
    `api/bookings/${payload.booking}/review/`,
    payload,
  );

  if (!data) {
    throw data;
  }

  return data.data as CustomerReview;
};
