"use client";

import { useState } from "react";
import {
  AccessTimeRounded,
  ArrowBackRounded,
  BusinessRounded,
  CalendarMonthRounded,
  CancelRounded,
  CategoryRounded,
  EmailRounded,
  EventRounded,
  GroupsRounded,
  LocationOnRounded,
  NotesRounded,
  PersonRounded,
  PhoneRounded,
  ReceiptLongRounded,
  ReplayRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

import {
  formatDate,
  formatDateTime,
  formatPaymentOption,
  formatPrice,
  formatStatus,
  formatTime,
  getStatusColor,
} from "@/utils/helperFunctions";
import { Booking } from "@/services/customer/booking";
import {
  useCancelCustomerBooking,
  useGetSingleCustomerBooking,
} from "@/hooks/booking";
import Breadcrumb from "@/components/common/breadcrumb/Breadcrumb";
import InputField from "@/components/common/input/InputField";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { extractApiError } from "@/utils/extractApiError";

export default function CustomerBookingPreviewPage({ uuid }: { uuid: string }) {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  const { data: booking, refetch: refetchBooking } =
    useGetSingleCustomerBooking(uuid);

  const { mutate: cancelBooking, isPending: isCancelling } =
    useCancelCustomerBooking();

  if (!booking) return <></>;

  const isCancelled = booking.status.toLowerCase() === "cancelled";

  const handleCloseCancelDialog = () => {
    if (isCancelling) return;

    setCancelDialogOpen(false);
    setCancellationReason("");
  };

  const handleCancelBooking = () => {
    const reason = cancellationReason.trim();

    if (!reason) return;

    cancelBooking(
      {
        bookingId: uuid,
        cancellation_data: {
          cancellation_reason: reason,
        },
      },
      {
        onSuccess: () => {
          setCancelDialogOpen(false);
          setCancellationReason("");
          refetchBooking();
        },
        onError: (error: any) => {
          showSnackbar(extractApiError(error), "error");
        },
      },
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        px: { xs: 2, sm: 3, md: 6, lg: 9, xl: 12 },
        py: 3,
        background: "linear-gradient(180deg, #F7FAFF 0%, #ffffff 100%)",
      }}
    >
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
        >
          <Box>
            <Typography variant="h4" fontWeight={900} color="primary.main">
              Booking Preview
            </Typography>

            <Breadcrumb
              items={[
                { label: "Bookings", href: "/customer/booking" },
                { label: "preview" },
              ]}
            />
          </Box>

          <Button
            variant="outlined"
            startIcon={<ArrowBackRounded />}
            onClick={() => router.push("/customer/booking")}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.1,
              fontWeight: 800,
              textTransform: "none",
              color: "#0B3D91",
              borderColor: "rgba(11, 61, 145, 0.28)",
              backgroundColor: "rgba(11, 61, 145, 0.04)",
              "&:hover": {
                borderColor: "#0B3D91",
                backgroundColor: "rgba(11, 61, 145, 0.08)",
              },
            }}
          >
            Back
          </Button>
        </Stack>

        <Grid container spacing={3} alignItems="flex-start">
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={3}>
              <PreviewSectionCard
                icon={<EventRounded />}
                title="Event details"
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
                      value={formatDate(booking.event_date)}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <PreviewItem
                      icon={<AccessTimeRounded />}
                      label="Event time"
                      value={`${formatTime(booking.event_time)} - ${formatTime(
                        booking.event_end_time,
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
                title="Contact details"
                subtitle="Main contact information for this booking."
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
                title="Special requests"
                subtitle="Additional notes from the customer."
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
                  title="Cancellation details"
                  subtitle="Information about the cancelled booking."
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
                            : "-"
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
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={2.5} sx={{ position: { lg: "sticky" }, top: 24 }}>
              <BookingSummaryCard booking={booking} />

              <PaymentSummaryCard booking={booking} />

              {!isCancelled && (
                <CancelBookingCard
                  isCancelling={isCancelling}
                  onOpen={() => setCancelDialogOpen(true)}
                />
              )}

              <BookingMetaCard booking={booking} />
            </Stack>
          </Grid>
        </Grid>
      </Stack>

      <Dialog
        open={cancelDialogOpen}
        onClose={handleCloseCancelDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 900,
            color: "error.main",
          }}
        >
          Cancel booking?
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <DialogContentText>
              Please tell us why you want to cancel this booking. Your reason
              will be saved with the cancellation details.
            </DialogContentText>

            <InputField
              value={cancellationReason}
              label="Cancellation reason"
              placeholder="Write your cancellation reason..."
              multiline
              onChange={(value) =>
                setCancellationReason(value ? `${value}` : "")
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseCancelDialog}
            disabled={isCancelling}
            sx={{
              borderRadius: 2.5,
              fontWeight: 800,
              textTransform: "none",
            }}
          >
            Keep booking
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleCancelBooking}
            disabled={isCancelling || !cancellationReason.trim()}
            sx={{
              borderRadius: 2.5,
              fontWeight: 900,
              textTransform: "none",
            }}
          >
            {isCancelling ? "Cancelling..." : "Submit cancellation"}
          </Button>
        </DialogActions>
      </Dialog>
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
        borderRadius: 4,
        border: "1px solid rgba(11, 61, 145, 0.12)",
        boxShadow: "0 12px 32px rgba(7, 42, 99, 0.08)",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1.5} alignItems="flex-end">
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.5,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "primary.main",
                background:
                  "linear-gradient(135deg, rgba(11, 61, 145, 0.08) 0%, rgba(201, 162, 39, 0.16) 100%)",
                "& svg": {
                  fontSize: 24,
                },
              }}
            >
              {icon}
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: "primary.main",
                  fontWeight: 900,
                }}
              >
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
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid rgba(11, 61, 145, 0.12)",
        boxShadow: "0 14px 36px rgba(7, 42, 99, 0.1)",
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
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              lineHeight: 1.25,
            }}
          >
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
        borderRadius: 4,
        border: "1px solid rgba(11, 61, 145, 0.12)",
        boxShadow: "0 12px 32px rgba(7, 42, 99, 0.08)",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "primary.main",
                background:
                  "linear-gradient(135deg, rgba(11, 61, 145, 0.08) 0%, rgba(201, 162, 39, 0.16) 100%)",
              }}
            >
              <ReceiptLongRounded />
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: "primary.main",
                  fontWeight: 900,
                }}
              >
                Payment Summary
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Booking payment information
              </Typography>
            </Box>
          </Stack>

          <Divider />

          <Stack spacing={1.2}>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">Payment option</Typography>
              <Typography fontWeight={900} textAlign="right">
                {formatPaymentOption(booking.payment_option)}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">Status</Typography>
              <Chip
                label={formatStatus(booking.status)}
                size="small"
                sx={{
                  fontWeight: 900,
                  textTransform: "capitalize",
                  backgroundColor: getStatusColor(booking.status),
                  color: "#fff",
                }}
              />
            </Stack>
          </Stack>

          <Divider />

          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Typography
              sx={{
                color: "secondary.dark",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 0.7,
              }}
            >
              Total
            </Typography>

            <Typography
              variant="h5"
              sx={{
                color: "primary.main",
                fontWeight: 900,
              }}
            >
              {formatPrice(booking.total_price)}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function CancelBookingCard({
  isCancelling,
  onOpen,
}: {
  isCancelling: boolean;
  onOpen: () => void;
}) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        border: "1px solid rgba(211, 47, 47, 0.18)",
        boxShadow: "0 12px 32px rgba(211, 47, 47, 0.08)",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "error.main",
                backgroundColor: "rgba(211, 47, 47, 0.08)",
              }}
            >
              <CancelRounded />
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: "error.main",
                  fontWeight: 900,
                }}
              >
                Cancel Booking
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Cancel this booking and provide a reason.
              </Typography>
            </Box>
          </Stack>

          <Divider />

          <Button
            fullWidth
            variant="contained"
            color="error"
            startIcon={<CancelRounded />}
            onClick={onOpen}
            disabled={isCancelling}
            sx={{
              borderRadius: 3,
              py: 1.15,
              fontWeight: 900,
              textTransform: "none",
              boxShadow: "0 10px 24px rgba(211, 47, 47, 0.22)",
            }}
          >
            {isCancelling ? "Cancelling..." : "Cancel booking"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function BookingMetaCard({ booking }: { booking: Booking }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        border: "1px solid rgba(11, 61, 145, 0.12)",
        boxShadow: "0 12px 32px rgba(7, 42, 99, 0.08)",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Typography
            variant="h6"
            sx={{
              color: "primary.main",
              fontWeight: 900,
            }}
          >
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
        borderRadius: 3,
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
              borderRadius: 2.2,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.main",
              background:
                "linear-gradient(135deg, rgba(11, 61, 145, 0.08) 0%, rgba(201, 162, 39, 0.16) 100%)",
              "& svg": {
                fontSize: 20,
              },
            }}
          >
            {icon}
          </Box>
        )}

        <Box>
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
              wordBreak: "break-word",
            }}
          >
            {value}
          </Typography>
        </Box>
      </Stack>
    </Box>
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
          borderRadius: 2.2,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "primary.main",
          background:
            "linear-gradient(135deg, rgba(11, 61, 145, 0.08) 0%, rgba(201, 162, 39, 0.16) 100%)",
          "& svg": {
            fontSize: 20,
          },
        }}
      >
        {icon}
      </Box>

      <Box>
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
          }}
        >
          {value || "Not provided"}
        </Typography>
      </Box>
    </Stack>
  );
}
