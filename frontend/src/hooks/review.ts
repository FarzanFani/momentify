import { PostCustomerReview } from "@/services/customer/review";
import {
  getProviderServiceReply,
  postProviderReply,
  ProviderServiceReviewPayload,
} from "@/services/provider/review";
import { useMutation, useQuery } from "@tanstack/react-query";

export const usePostCustomerReview = () => {
  return useMutation({
    mutationKey: ["post-review"],
    mutationFn: PostCustomerReview,
  });
};

export const usePostProviderReviewReply = () => {
  return useMutation({
    mutationKey: ["post-reply"],
    mutationFn: postProviderReply,
  });
};

export const useGetProviderServiceReview = (
  params: ProviderServiceReviewPayload,
) => {
  return useQuery({
    queryKey: ["service-review", params],
    queryFn: () => getProviderServiceReply(params),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};
