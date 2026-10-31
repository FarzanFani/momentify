"use client";

import Breadcrumb from "@/components/common/breadcrumb/Breadcrumb";
import InputField from "@/components/common/input/InputField";
import {
  PackageBookingServices,
  PackageBookingSummaryCard,
} from "@/components/common/packageBooking/packageBookingParts";
import { CancelBookingCard } from "@/components/customer/booking/preview/bookingPreview";
import { PackageUnavailableView } from "@/components/provider/packages/packageDetail/packageDetail";
import { useSnackbar } from "@/contexts/SnackbarContext";
import {
  useCancelPackageBooking,
  useGetCustomerPackageBooking,
  useSchedulePackageBooking,
} from "@/hooks/packageBooking";
import type { ApiResponse } from "@/types/general";
import { extractApiError } from "@/utils/extractApiError";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import type { AxiosError } from "axios";
import { useState } from "react";

export default function CustomerPackageBookingDetail({
  uuid,
}: {
  uuid: string;
}) {
  const { showSnackbar } = useSnackbar();
  const { data: booking, isLoading } = useGetCustomerPackageBooking(uuid);
  const { mutate: schedule, isPending: isScheduling } =
    useSchedulePackageBooking();
  const { mutate: cancelPackage, isPending: isCancelling } =
    useCancelPackageBooking();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (!booking) return <PackageUnavailableView />;

  const isActive =
    booking.status === "PENDING" || booking.status === "CONFIRMED";
  const canSchedule = !booking.is_schedule_overdue && isActive;

  const handleCloseCancelDialog = () => {
    if (isCancelling) return;
    setCancelDialogOpen(false);
    setCancellationReason("");
  };

  const handleCancelPackage = () => {
    const reason = cancellationReason.trim();
    if (!reason) return;

    cancelPackage(
      { id: booking.id, cancellation_reason: reason },
      {
        onSuccess() {
          showSnackbar("Package booking cancelled", "success");
          setCancelDialogOpen(false);
          setCancellationReason("");
        },
        onError(error) {
          showSnackbar(
            extractApiError(error as AxiosError<ApiResponse<null>>),
            "error",
          );
        },
      },
    );
  };

  return (
    <Box
      sx={{
        px: { xs: 1.5, md: 2 },
        py: 3,
        mx: "auto",
        width: { xs: "100%", md: "90%", lg: "75%", xl: "60%" },
      }}
    >
      <Breadcrumb
        items={[
          { label: "My bookings", href: "/customer/booking" },
          { label: booking.package_name },
        ]}
      />
      <Typography variant="h4" fontWeight={800} color="primary.main" mt={1}>
        {booking.package_name}
      </Typography>
      <Typography color="text.secondary">{booking.company_name}</Typography>

      {booking.status === "PENDING" && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Waiting for {booking.company_name} to approve this package.
        </Alert>
      )}
      {booking.status === "REJECTED" && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {booking.company_name} rejected this package booking.
        </Alert>
      )}
      {booking.status === "CANCELLED" && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {`You cancelled this package booking${
            booking.cancellation_reason
              ? `: "${booking.cancellation_reason}"`
              : "."
          }`}
        </Alert>
      )}

      <Grid container spacing={3} mt={1}>
        <Grid size={{ xs: 12, md: 7 }}>
          <PackageBookingServices
            booking={booking}
            canSchedule={canSchedule}
            isScheduling={isScheduling}
            onSchedule={(entries) =>
              schedule(
                { id: booking.id, schedule: entries },
                {
                  onSuccess() {
                    showSnackbar("Dates saved", "success");
                  },
                  onError(error) {
                    showSnackbar(
                      extractApiError(error as AxiosError<ApiResponse<null>>),
                      "error",
                    );
                  },
                },
              )
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={3}>
            <PackageBookingSummaryCard booking={booking} />
            {isActive && (
              <CancelBookingCard
                isCancelling={isCancelling}
                onOpen={() => setCancelDialogOpen(true)}
              />
            )}
          </Stack>
        </Grid>
      </Grid>

      <Dialog
        open={cancelDialogOpen}
        onClose={handleCloseCancelDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: "error.main" }}>
          Cancel package booking?
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <DialogContentText>
              {`This cancels every service in ${booking.package_name}, including any dates you already picked. This can't be undone.`}
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
            sx={{ borderRadius: 2.5, fontWeight: 800, textTransform: "none" }}
          >
            Keep package
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleCancelPackage}
            disabled={isCancelling || !cancellationReason.trim()}
            sx={{ borderRadius: 2.5, fontWeight: 900, textTransform: "none" }}
          >
            {isCancelling ? "Cancelling..." : "Submit cancellation"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
