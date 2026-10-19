"use client";

import Breadcrumb from "@/components/common/breadcrumb/Breadcrumb";
import {
  PackageBookingServices,
  PackageBookingSummaryCard,
} from "@/components/common/packageBooking/packageBookingParts";
import ConfirmBookingDialog from "@/components/provider/bookings/preview/confirmBookingDialog";
import RejectBookingDialog from "@/components/provider/bookings/preview/rejectBookingDialog";
import { PackageUnavailableView } from "@/components/provider/packages/packageDetail/packageDetail";
import { useSnackbar } from "@/contexts/SnackbarContext";
import {
  useGetProviderPackageBooking,
  useUpdatePackageBookingStatus,
} from "@/hooks/packageBooking";
import type { ApiResponse } from "@/types/general";
import { extractApiError } from "@/utils/extractApiError";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import type { AxiosError } from "axios";
import { useState } from "react";

export default function ProviderPackageBookingDetail({ uuid }: { uuid: string }) {
  const { showSnackbar } = useSnackbar();
  const { data: booking, isLoading } = useGetProviderPackageBooking(uuid);
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdatePackageBookingStatus();
  const [dialog, setDialog] = useState<"CONFIRMED" | "REJECTED" | null>(null);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (!booking) return <PackageUnavailableView />;

  const customerName = booking.customer_name || booking.contact_detail_full_name;
  const isPending = booking.status === "PENDING";

  const handleStatus = () => {
    if (!dialog) return;
    updateStatus(
      { id: booking.id, status: dialog },
      {
        onSuccess() {
          showSnackbar(
            dialog === "CONFIRMED"
              ? "Package booking confirmed"
              : "Package booking rejected",
            "success",
          );
          setDialog(null);
        },
        onError(error) {
          showSnackbar(
            extractApiError(error as AxiosError<ApiResponse<null>>),
            "error",
          );
          setDialog(null);
        },
      },
    );
  };

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      <Breadcrumb
        items={[
          { label: "Package bookings", href: "/provider/package-bookings" },
          { label: booking.package_name },
        ]}
      />

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        flexWrap="wrap"
        gap={2}
        mt={1}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary.main">
            {booking.package_name}
          </Typography>
          <Typography color="text.secondary">
            {`${customerName} · ${booking.guest_numbers} guests`}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            color="error"
            disabled={!isPending || isUpdating}
            onClick={() => setDialog("REJECTED")}
            sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2 }}
          >
            Reject package
          </Button>
          <Button
            variant="contained"
            disabled={!isPending || isUpdating}
            onClick={() => setDialog("CONFIRMED")}
            sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2 }}
          >
            Confirm package
          </Button>
        </Stack>
      </Box>

      {isPending && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Confirming or rejecting applies to every service in this package,
          including services the customer schedules later.
        </Alert>
      )}

      <Grid container spacing={3} mt={1}>
        <Grid size={{ xs: 12, md: 7 }}>
          <PackageBookingServices booking={booking} />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <PackageBookingSummaryCard booking={booking} />
        </Grid>
      </Grid>

      <ConfirmBookingDialog
        customerName={customerName}
        open={dialog === "CONFIRMED"}
        isUpdating={isUpdating}
        onClose={() => setDialog(null)}
        onConfirm={handleStatus}
      />
      <RejectBookingDialog
        customerName={customerName}
        open={dialog === "REJECTED"}
        isUpdating={isUpdating}
        onClose={() => setDialog(null)}
        onConfirm={handleStatus}
      />
    </Box>
  );
}
