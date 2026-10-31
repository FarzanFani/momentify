"use client";

import Breadcrumb from "@/components/common/breadcrumb/Breadcrumb";
import {
  PackageBookingServices,
  PackageBookingSummaryCard,
} from "@/components/common/packageBooking/packageBookingParts";
import { PackageUnavailableView } from "@/components/provider/packages/packageDetail/packageDetail";
import { useSnackbar } from "@/contexts/SnackbarContext";
import {
  useGetCustomerPackageBooking,
  useSchedulePackageBooking,
} from "@/hooks/packageBooking";
import type { ApiResponse } from "@/types/general";
import { extractApiError } from "@/utils/extractApiError";
import { Alert, Box, CircularProgress, Grid, Typography } from "@mui/material";
import type { AxiosError } from "axios";

export default function CustomerPackageBookingDetail({
  uuid,
}: {
  uuid: string;
}) {
  const { showSnackbar } = useSnackbar();
  const { data: booking, isLoading } = useGetCustomerPackageBooking(uuid);
  const { mutate: schedule, isPending: isScheduling } =
    useSchedulePackageBooking();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (!booking) return <PackageUnavailableView />;

  const canSchedule =
    !booking.is_schedule_overdue &&
    (booking.status === "PENDING" || booking.status === "CONFIRMED");

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
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
          <PackageBookingSummaryCard booking={booking} />
        </Grid>
      </Grid>
    </Box>
  );
}
