"use client";

import { ReplyRounded } from "@mui/icons-material";
import {
  Box,
  Button,
  Collapse,
  Divider,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";

import InputField from "@/components/common/input/InputField";
import type { CustomerReview } from "@/services/customer/review";
import { formatDateTime } from "@/utils/helperFunctions";

type BookingReviewCardProps = {
  review: CustomerReview;
  showYouLabel?: boolean;
  showReplyButton?: boolean;
  onReplyClick?: () => void;
  handleReplyPost?: (message: string) => void;
};

export default function BookingReviewCard({
  review,
  showYouLabel = false,
  showReplyButton = false,
  onReplyClick,
  handleReplyPost,
}: BookingReviewCardProps) {
  const [isReplyFieldOpen, setIsReplyFieldOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const reviewerName = review.customer_name || "Anonymous";

  const handleReplyClick = () => {
    setIsReplyFieldOpen(true);
    onReplyClick?.();
  };

  const handleSubmit = () => {
    if (!handleReplyPost) return;

    handleReplyPost(replyMessage);
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid rgba(11, 61, 145, 0.1)",
        backgroundColor: "rgba(255,255,255,0.72)",
      }}
    >
      <Stack spacing={2}>
        <ReviewContent
          name={showYouLabel ? `${reviewerName} (You)` : reviewerName}
          rating={review.rating}
          message={review.comments}
          createdAt={review.created_at}
          action={
            !review.reply && showReplyButton && !isReplyFieldOpen ? (
              <Button
                variant="text"
                endIcon={<ReplyRounded />}
                onClick={handleReplyClick}
                sx={{
                  px: 0,
                  minWidth: "auto",
                  fontWeight: 900,
                  textTransform: "none",
                }}
              >
                Reply
              </Button>
            ) : undefined
          }
        />

        {review.reply ? (
          <>
            <Divider />

            <Box sx={{ pl: { xs: 0, sm: 3 } }}>
              <ReviewContent
                name={review.reply.user_name}
                message={review.reply.message}
                createdAt={review.reply.created_at}
              />
            </Box>
          </>
        ) : null}

        {!review.reply && showReplyButton && (
          <>
            <Collapse in={isReplyFieldOpen} timeout={260} unmountOnExit>
              <InputField
                value={replyMessage}
                label="Reply message"
                placeholder="Write your reply..."
                multiline
                rows={4}
                onChange={(value) => setReplyMessage(`${value ?? ""}`)}
              />
              <Box
                width={"100%"}
                display={"flex"}
                justifyContent={"flex-end"}
                mt={1}
              >
                <Button onClick={handleSubmit}>Post Reply</Button>
              </Box>
            </Collapse>
          </>
        )}
      </Stack>
    </Box>
  );
}

function ReviewContent({
  name,
  rating,
  message,
  createdAt,
  action,
}: {
  name: string;
  rating?: number;
  message: string;
  createdAt: string;
  action?: React.ReactNode;
}) {
  return (
    <Stack spacing={1.5}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
      >
        <Typography
          variant="body1"
          sx={{
            color: "#1f2937",
            fontWeight: 900,
            overflowWrap: "anywhere",
          }}
        >
          {name}
        </Typography>

        {typeof rating === "number" && (
          <Rating
            value={rating}
            readOnly
            size="medium"
            sx={{
              flexShrink: 0,
              color: "#C9A227",
              "& .MuiRating-iconEmpty": {
                color: "rgba(11, 61, 145, 0.18)",
              },
            }}
          />
        )}
      </Stack>

      <Typography
        variant="body2"
        sx={{
          color: "#1f2937",
          lineHeight: 1.8,
          whiteSpace: "pre-line",
        }}
      >
        {message}
      </Typography>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1.5}
      >
        <Box>{action}</Box>

        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            display: "block",
            fontWeight: 700,
            textAlign: "right",
          }}
        >
          {formatDateTime(createdAt)}
        </Typography>
      </Stack>
    </Stack>
  );
}
