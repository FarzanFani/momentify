"use client";

import { useState } from "react";
import {
  AccessTimeRounded,
  ArrowBackRounded,
  BusinessRounded,
  CalendarMonthRounded,
  CancelRounded,
  CategoryRounded,
  CheckCircleRounded,
  EmailRounded,
  EventRounded,
  GroupsRounded,
  LocationOnRounded,
  NotesRounded,
  PaymentsRounded,
  PersonRounded,
  PhoneRounded,
  RateReviewRounded,
  ReceiptLongRounded,
  ReplayRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";

import Breadcrumb from "@/components/common/breadcrumb/Breadcrumb";
import { getStatusChip } from "@/components/common/statusChip/statusChip";
import ConfirmBookingDialog from "@/components/provider/bookings/preview/confirmBookingDialog";
import ProviderBookingPreviewSkeleton from "@/components/provider/bookings/preview/bookingPreviewSkeleton";
import RejectBookingDialog from "@/components/provider/bookings/preview/rejectBookingDialog";
import { useSnackbar } from "@/contexts/SnackbarContext";
import {
  useGetSingleProviderBooking,
  useUpdateProviderBookingStatus,
} from "@/hooks/booking";
import type { Booking } from "@/services/customer/booking";
import {
  formatDate,
  formatDateTime,
  formatPaymentOption,
  formatPrice,
  formatTime,
} from "@/utils/helperFunctions";
import { extractApiError } from "@/utils/extractApiError";
import type { ApiResponse } from "@/types/general";
import BookingReviewCard from "@/components/common/review/BookingReviewCard";
import { usePostProviderReviewReply } from "@/hooks/review";
import { ProviderReplyPayload } from "@/services/customer/review";

function getBookingCustomerName(booking: Booking) {
  return (
    booking.contact_detail_full_name?.trim() ||
    booking.customer_name?.trim() ||
    "Customer"
  );
}

export default function ProviderBookingPreviewPage({ uuid }: { uuid: string }) {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const {
    data: booking,
    isLoading,
    refetch,
  } = useGetSingleProviderBooking(uuid);
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateProviderBookingStatus();

  const { mutate: postReply, isPending: isPostReplyPending } =
    usePostProviderReviewReply();

  const isPending = booking?.status === "PENDING";
  const isCancelled = booking?.status === "CANCELLED";
  const isCompleted = booking?.status === "COMPLETED";

  const handleCloseConfirmDialog = () => {
    if (isUpdating) return;
    setConfirmDialogOpen(false);
  };

  const handleCloseRejectDialog = () => {
    if (isUpdating) return;
    setRejectDialogOpen(false);
  };

  const handleConfirmBooking = () => {
    updateStatus(
      { bookingId: uuid, status: "CONFIRMED" },
      {
        onSuccess: () => {
          setConfirmDialogOpen(false);
          refetch();
          showSnackbar("Booking confirmed successfully.", "success");
        },
        onError: (error) => {
          showSnackbar(
            extractApiError(
              error as AxiosError<ApiResponse<null>>,
              "Could not update booking status",
            ),
            "error",
          );
        },
      },
    );
  };

  const handleRejectBooking = () => {
    updateStatus(
      { bookingId: uuid, status: "REJECTED" },
      {
        onSuccess: () => {
          setRejectDialogOpen(false);
          refetch();
          showSnackbar("Booking rejected successfully.", "success");
        },
        onError: (error) => {
          showSnackbar(
            extractApiError(
              error as AxiosError<ApiResponse<null>>,
              "Could not update booking status",
            ),
            "error",
          );
        },
      },
    );
  };

  const handleSubmitReply = (message: string) => {
    const replyPayload: ProviderReplyPayload = {
      review: booking?.review?.id ?? "",
      message: message,
    };

    postReply(replyPayload, {
      onSuccess: () => {
        showSnackbar("Repy Post successfully", "success");
        refetch();
      },
      onError: (error: any) => {
        showSnackbar(extractApiError(error), "error");
      },
    });
  };

  if (isLoading) {
    return <ProviderBookingPreviewSkeleton />;
  }

  if (!booking) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary" fontWeight={800}>
          Booking not found
        </Typography>
      </Box>
    );
  }

  const customerName = getBookingCustomerName(booking);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        px: { xs: 1, sm: 2, md: 3, lg: 4 },
        py: 3,
        background: "linear-gradient(180deg, #F7FAFF 0%, #ffffff 100%)",
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={900} color="primary.main">
            Booking Preview
          </Typography>

          <Breadcrumb
            items={[
              { label: "Bookings", href: "/provider/bookings" },
              {
                label: `${booking.service_name} (${customerName})`,
              },
            ]}
          />
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="flex-end"
          gap={1.5}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackRounded />}
            onClick={() => router.push("/provider/bookings")}
            sx={{ textTransform: "none", fontWeight: 800 }}
          >
            Back
          </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelRounded />}
            disabled={!isPending || isUpdating}
            onClick={() => setRejectDialogOpen(true)}
            sx={{ textTransform: "none", fontWeight: 900 }}
          >
            Reject
          </Button>

          <Button
            variant="contained"
            startIcon={<CheckCircleRounded />}
            disabled={!isPending || isUpdating}
            onClick={() => setConfirmDialogOpen(true)}
            sx={{ textTransform: "none", fontWeight: 900 }}
          >
            Confirm
          </Button>
        </Stack>
        {!isPending && (
          <Card
            sx={{
              borderRadius: 2,
              border: "1px solid rgba(11, 61, 145, 0.12)",
              boxShadow: "0 12px 32px rgba(7, 42, 99, 0.1)",
              py: 2,
              px: { xs: 1, sm: 2 },
            }}
          >
            <Stack
              direction="row"
              gap={1.5}
              alignItems="center"
              justifyContent={"center"}
            >
              {getStatusChip(booking.status)}
              <Typography color="text.secondary" fontWeight={700}>
                Confirm and reject actions are only available while a booking is
                pending.
              </Typography>
            </Stack>
          </Card>
        )}

        <Grid container spacing={3} alignItems="flex-start">
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={3}>
              <PreviewSectionCard
                icon={<EventRounded />}
                title="Event Details"
                subtitle="Date, time, location and guest information."
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <PreviewItem
                      icon={<CategoryRounded />}
                      label="Event type"
                      value={booking.event_type || booking.category_name}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <PreviewItem
                      icon={<CalendarMonthRounded />}
                      label="Event date"
                      value={formatDate(booking.starts_at)}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <PreviewItem
                      icon={<AccessTimeRounded />}
                      label="Event time"
                      value={`${formatTime(booking.starts_at)} - ${formatTime(
                        booking.ends_at,
                      )}`}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <PreviewItem
                      icon={<GroupsRounded />}
                      label="Guests"
                      value={`${booking.guest_numbers} guest${
                        booking.guest_numbers === 1 ? "" : "s"
                      }`}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <PreviewItem
                      icon={<LocationOnRounded />}
                      label="Location"
                      value={booking.location || "No location provided"}
                    />
                  </Grid>
                </Grid>
              </PreviewSectionCard>

              <PreviewSectionCard
                icon={<PersonRounded />}
                title="Customer Contact"
                subtitle="Contact information sent with this request."
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <PreviewItem
                      icon={<PersonRounded />}
                      label="Full name"
                      value={booking.contact_detail_full_name}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <PreviewItem
                      icon={<PhoneRounded />}
                      label="Phone number"
                      value={booking.contact_detail_phone_number}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <PreviewItem
                      icon={<EmailRounded />}
                      label="Email"
                      value={booking.contact_detail_email}
                    />
                  </Grid>
                </Grid>
              </PreviewSectionCard>

              <PreviewSectionCard
                icon={<NotesRounded />}
                title="Special Requests"
                subtitle="Additional notes submitted by the customer."
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: booking.special_request
                      ? "text.primary"
                      : "text.secondary",
                    lineHeight: 1.8,
                    whiteSpace: "pre-line",
                  }}
                >
                  {booking.special_request || "No special requests provided."}
                </Typography>
              </PreviewSectionCard>

              {isCancelled && (
                <PreviewSectionCard
                  icon={<ReplayRounded />}
                  title="Cancellation Details"
                  subtitle="Cancellation and refund information for this booking."
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <PreviewItem
                        label="Cancelled at"
                        value={
                          booking.cancelled_at
                            ? formatDateTime(booking.cancelled_at)
                            : "Not available"
                        }
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <PreviewItem
                        label="Refund amount"
                        value={
                          typeof booking.refund_amount === "number"
                            ? formatPrice(booking.refund_amount)
                            : "Not available"
                        }
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <PreviewItem
                        label="Cancellation reason"
                        value={
                          booking.cancellation_reason ||
                          "No cancellation reason provided"
                        }
                      />
                    </Grid>
                  </Grid>
                </PreviewSectionCard>
              )}

              {isCompleted && (
                <PreviewSectionCard
                  icon={<RateReviewRounded />}
                  title="Review & Reply"
                  subtitle="Customer feedback and provider reply for this completed booking."
                >
                  {booking.review ? (
                    <BookingReviewCard
                      review={booking.review}
                      showReplyButton
                      handleReplyPost={handleSubmitReply}
                    />
                  ) : (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: "1px dashed rgba(11, 61, 145, 0.22)",
                        backgroundColor: "rgba(255,255,255,0.72)",
                        textAlign: "center",
                      }}
                    >
                      <Typography color="text.secondary" fontWeight={800}>
                        No customer review has been submitted for this booking
                        yet.
                      </Typography>
                    </Box>
                  )}
                </PreviewSectionCard>
              )}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={2.5} sx={{ position: { lg: "sticky" }, top: 24 }}>
              <BookingSummaryCard booking={booking} />
              <PaymentSummaryCard booking={booking} />
              <BookingMetaCard booking={booking} />
            </Stack>
          </Grid>
        </Grid>
      </Stack>

      <ConfirmBookingDialog
        customerName={customerName}
        open={confirmDialogOpen}
        isUpdating={isUpdating}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmBooking}
      />

      <RejectBookingDialog
        customerName={customerName}
        open={rejectDialogOpen}
        isUpdating={isUpdating}
        onClose={handleCloseRejectDialog}
        onConfirm={handleRejectBooking}
      />
    </Box>
  );
}

function PreviewSectionCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        border: "1px solid rgba(11, 61, 145, 0.12)",
        boxShadow: "0 12px 32px rgba(7, 42, 99, 0.1)",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1.5} alignItems="flex-end">
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "primary.main",
                backgroundColor: "rgba(11, 61, 145, 0.08)",
                "& svg": {
                  fontSize: 24,
                },
              }}
            >
              {icon}
            </Box>

            <Box>
              <Typography variant="h6" color="primary.main" fontWeight={900}>
                {title}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            </Box>
          </Stack>

          <Divider />

          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

function BookingSummaryCard({ booking }: { booking: Booking }) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid rgba(11, 61, 145, 0.12)",
        boxShadow: "0 14px 36px rgba(7, 42, 99, 0.12)",
      }}
    >
      <Box
        sx={{
          minHeight: 130,
          p: 2.5,
          color: "#fff",
          display: "flex",
          alignItems: "flex-end",
          background:
            "linear-gradient(135deg, #072a63 0%, #0B3D91 45%, #2F5FB3 72%, #C9A227 100%)",
        }}
      >
        <Stack spacing={1.2}>
          {getStatusChip(booking.status)}

          <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.25 }}>
            {booking.service_name}
          </Typography>
        </Stack>
      </Box>

      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <SummaryRow
            icon={<BusinessRounded />}
            label="Provider"
            value={booking.company_name}
          />

          <SummaryRow
            icon={<CategoryRounded />}
            label="Category"
            value={booking.category_name}
          />

          <SummaryRow
            icon={<PersonRounded />}
            label="Customer"
            value={booking.customer_name}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

function PaymentSummaryCard({ booking }: { booking: Booking }) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        border: "1px solid rgba(11, 61, 145, 0.12)",
        boxShadow: "0 12px 32px rgba(7, 42, 99, 0.1)",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "primary.main",
                backgroundColor: "rgba(11, 61, 145, 0.08)",
              }}
            >
              <ReceiptLongRounded />
            </Box>

            <Box>
              <Typography variant="h6" color="primary.main" fontWeight={900}>
                Payment Summary
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Booking payment information
              </Typography>
            </Box>
          </Stack>

          <Divider />

          <SummaryLine label="Payment option">
            {formatPaymentOption(booking.payment_option)}
          </SummaryLine>

          <SummaryLine label="Status">
            {getStatusChip(booking.status)}
          </SummaryLine>

          <Divider />

          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Typography
              sx={{
                color: "secondary.dark",
                fontWeight: 900,
                textTransform: "uppercase",
              }}
            >
              Total
            </Typography>

            <Typography variant="h5" color="primary.main" fontWeight={900}>
              {formatPrice(booking.total_price)}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function BookingMetaCard({ booking }: { booking: Booking }) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        border: "1px solid rgba(11, 61, 145, 0.12)",
        boxShadow: "0 12px 32px rgba(7, 42, 99, 0.1)",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Typography variant="h6" color="primary.main" fontWeight={900}>
            Booking Timeline
          </Typography>

          <Divider />

          <SummaryRow
            icon={<CalendarMonthRounded />}
            label="Created at"
            value={formatDateTime(booking.created_at)}
          />

          <SummaryRow
            icon={<CalendarMonthRounded />}
            label="Last updated"
            value={formatDateTime(booking.updated_at)}
          />

          <SummaryRow
            icon={<PaymentsRounded />}
            label="Raw total"
            value={`${booking.total_price}`}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

function PreviewItem({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Box
      sx={{
        p: 2,
        height: "100%",
        borderRadius: 2,
        border: "1px solid rgba(11, 61, 145, 0.1)",
        backgroundColor: "rgba(255,255,255,0.72)",
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="flex-end">
        {icon && (
          <Box
            sx={{
              width: 40,
              height: 44,
              borderRadius: 2,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.main",
              backgroundColor: "rgba(11, 61, 145, 0.08)",
              "& svg": {
                fontSize: 20,
              },
            }}
          >
            {icon}
          </Box>
        )}

        <Box minWidth={0}>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 800,
            }}
          >
            {label}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#1f2937",
              fontWeight: 900,
              lineHeight: 1.5,
              overflowWrap: "anywhere",
            }}
          >
            {value || "Not provided"}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function SummaryLine({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography color="text.secondary">{label}</Typography>
      <Box textAlign="right" fontWeight={900}>
        {children}
      </Box>
    </Stack>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Stack direction="row" spacing={1.2} alignItems="flex-end">
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "primary.main",
          backgroundColor: "rgba(11, 61, 145, 0.08)",
          "& svg": {
            fontSize: 20,
          },
        }}
      >
        {icon}
      </Box>

      <Box minWidth={0}>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: 700,
          }}
        >
          {label}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "#1f2937",
            fontWeight: 900,
            lineHeight: 1.4,
            overflowWrap: "anywhere",
          }}
        >
          {value || "Not provided"}
        </Typography>
      </Box>
    </Stack>
  );
}
