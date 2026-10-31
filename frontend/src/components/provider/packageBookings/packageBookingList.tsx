"use client";

import ApiErrorResponse from "@/components/common/apiError/apiError";
import SelectDropdown from "@/components/common/dropdown/Dropdown";
import {
  cardSx,
  getPackagePaymentLabel,
  getScheduleLabel,
} from "@/components/common/packageBooking/packageBookingParts";
import { getStatusChip } from "@/components/common/statusChip/statusChip";
import { useGetProviderPackageBookings } from "@/hooks/packageBooking";
import { formatDateTime, formatPrice } from "@/utils/helperFunctions";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function ProviderPackageBookingList() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const { data, isLoading } = useGetProviderPackageBookings(status);

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        flexWrap="wrap"
        gap={2}
        mb={3}
      >
        <Typography variant="h4" fontWeight={700} color="primary.main">
          Package bookings
        </Typography>
        <Box sx={{ minWidth: 220 }}>
          <SelectDropdown
            label="Status"
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            placeholder="All statuses"
          />
        </Box>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      ) : !data ? (
        <ApiErrorResponse />
      ) : data.count === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={8}>
          No package bookings yet.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {data.results.map((booking) => (
            <Grid key={booking.id} size={{ xs: 12, sm: 6, xl: 4 }}>
              <Card sx={cardSx}>
                <CardActionArea
                  onClick={() =>
                    router.push(`/provider/package-bookings/${booking.id}`)
                  }
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={1}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        gap={1}
                      >
                        <Typography fontWeight={900}>
                          {booking.package_name}
                        </Typography>
                        {getStatusChip(booking.status)}
                      </Box>
                      <Typography variant="body2">
                        {`${booking.customer_name || booking.contact_detail_full_name} · ${booking.guest_numbers} guests`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {`Booked ${formatDateTime(booking.created_at)}`}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={
                          booking.is_schedule_overdue
                            ? "error.main"
                            : booking.unscheduled_count > 0
                              ? "warning.dark"
                              : "success.main"
                        }
                      >
                        {getScheduleLabel(booking)}
                      </Typography>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="baseline"
                      >
                        <Typography variant="caption" color="text.secondary">
                          {getPackagePaymentLabel(booking)}
                        </Typography>
                        <Typography variant="h6" fontWeight={900} color="primary.main">
                          {formatPrice(Number(booking.total_price))}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
