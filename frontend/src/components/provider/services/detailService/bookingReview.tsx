"use client";

import { useCallback, useMemo, useState } from "react";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import BookingReviewCard from "@/components/common/review/BookingReviewCard";
import { useSnackbar } from "@/contexts/SnackbarContext";
import {
  useGetProviderServiceReview,
  usePostProviderReviewReply,
} from "@/hooks/review";
import type { CustomerReview } from "@/services/customer/review";

const REVIEW_PAGE_SIZE = 10;

export default function BookingReview({ uuid }: { uuid: string }) {
  const [page, setPage] = useState(1);
  const { showSnackbar } = useSnackbar();
  const { mutate: postReply } = usePostProviderReviewReply();

  const {
    data: providerServiceReview,
    isLoading,
    refetch,
  } = useGetProviderServiceReview({
    page_size: page * REVIEW_PAGE_SIZE,
    page: 1,
    service: uuid,
  });

  const reviews = providerServiceReview?.results ?? [];
  const isViewMoreLoading = isLoading && page > 1;
  const showViewMore =
    Boolean(
      providerServiceReview && reviews.length < providerServiceReview.count,
    ) || isViewMoreLoading;

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;

    const ratingTotal = reviews.reduce(
      (total, review) => total + review.rating,
      0,
    );

    return ratingTotal / reviews.length;
  }, [reviews]);

  const handleViewMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const handleReplyPost = useCallback(
    (review: CustomerReview, message: string) => {
      const trimmedMessage = message.trim();

      if (!trimmedMessage) {
        showSnackbar("Reply message cannot be empty.", "error");
        return;
      }

      postReply(
        {
          review: review.id,
          message: trimmedMessage,
        },
        {
          onSuccess: () => {
            showSnackbar("Reply posted successfully.", "success");
            refetch();
          },
          onError: () => {
            showSnackbar("Could not post reply.", "error");
          },
        },
      );
    },
    [postReply, refetch, showSnackbar],
  );

  if (isLoading && reviews.length === 0) {
    return <BookingReviewSkeleton />;
  }

  if (reviews.length === 0) {
    return <EmptyReviewState />;
  }

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={2}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 900, color: "primary.main" }}
          >
            Service reviews
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Customer feedback and provider replies for this service.
          </Typography>
        </Box>

        <ReviewSummary
          count={providerServiceReview?.count ?? reviews.length}
          averageRating={averageRating}
        />
      </Stack>

      <Grid container spacing={2}>
        {reviews.map((review) => (
          <Grid key={review.id} size={{ xs: 12 }}>
            <BookingReviewCard
              review={review}
              showReplyButton
              handleReplyPost={(message) => handleReplyPost(review, message)}
            />
          </Grid>
        ))}
      </Grid>

      {showViewMore && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="outlined"
            endIcon={
              isViewMoreLoading ? (
                <CircularProgress size={18} />
              ) : (
                <ArrowForwardRoundedIcon />
              )
            }
            onClick={handleViewMore}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1,
              fontWeight: 800,
              textTransform: "none",
              color: "primary.main",
              borderColor: "rgba(11, 61, 145, 0.28)",
              backgroundColor: "#fff",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "rgba(11, 61, 145, 0.06)",
              },
            }}
          >
            View more
          </Button>
        </Box>
      )}
    </Stack>
  );
}

function ReviewSummary({
  count,
  averageRating,
}: {
  count: number;
  averageRating: number;
}) {
  return (
    <Stack
      direction="row"
      spacing={1.2}
      alignItems="center"
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 2,
        border: "1px solid rgba(11, 61, 145, 0.12)",
        background:
          "linear-gradient(135deg, rgba(11, 61, 145, 0.05) 0%, rgba(201, 162, 39, 0.12) 100%)",
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#C9A227",
          backgroundColor: "#fff",
          "& svg": { fontSize: 20 },
        }}
      >
        <StarRoundedIcon />
      </Box>

      <Box>
        <Typography
          variant="body2"
          sx={{ color: "#072a63", fontWeight: 900, lineHeight: 1.2 }}
        >
          {averageRating.toFixed(1)} average
        </Typography>

        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          {count} review{count === 1 ? "" : "s"}
        </Typography>
      </Box>
    </Stack>
  );
}

function EmptyReviewState() {
  return (
    <Box
      sx={{
        minHeight: 260,
        borderRadius: 3,
        border: "1px dashed rgba(11, 61, 145, 0.25)",
        background:
          "linear-gradient(135deg, rgba(11, 61, 145, 0.04) 0%, rgba(201, 162, 39, 0.08) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 3,
      }}
    >
      <Stack spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 58,
            height: 58,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "primary.main",
            backgroundColor: "#fff",
            border: "1px solid rgba(11, 61, 145, 0.1)",
            "& svg": { fontSize: 30 },
          }}
        >
          <RateReviewRoundedIcon />
        </Box>

        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              color: "primary.main",
            }}
          >
            No reviews yet
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Customer reviews will appear here after completed bookings.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function BookingReviewSkeleton() {
  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={2}
      >
        <Box sx={{ width: "100%", maxWidth: 360 }}>
          <Skeleton variant="text" width="55%" height={32} />
          <Skeleton variant="text" width="90%" height={22} />
        </Box>

        <Skeleton variant="rounded" width={168} height={56} />
      </Stack>

      <Grid container spacing={2}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid key={index} size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid rgba(11, 61, 145, 0.1)",
                backgroundColor: "rgba(255,255,255,0.72)",
              }}
            >
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" gap={2}>
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="48%" height={26} />
                    <Skeleton variant="text" width="100%" height={22} />
                    <Skeleton variant="text" width="82%" height={22} />
                  </Box>
                  <Skeleton variant="rounded" width={116} height={24} />
                </Stack>
                <Skeleton variant="text" width="42%" height={18} />
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
