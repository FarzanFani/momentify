import { PostCustomerReview } from "@/services/customer/review";
import { PostProviderReply } from "@/services/provider/review";
import { useMutation } from "@tanstack/react-query";

export const usePostCustomerReview = () => {
  return useMutation({
    mutationKey: ["post-review"],
    mutationFn: PostCustomerReview,
  });
};

export const usePostProviderReviewReply = () => {
  return useMutation({
    mutationKey: ["post-reply"],
    mutationFn: PostProviderReply,
  });
};
