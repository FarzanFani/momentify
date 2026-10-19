"use client";

import ApiErrorResponse from "@/components/common/apiError/apiError";
import {
  cardSx,
  getScheduleLabel,
} from "@/components/common/packageBooking/packageBookingParts";
import { getStatusChip } from "@/components/common/statusChip/statusChip";
import { useGetCustomerPackageBookings } from "@/hooks/packageBooking";
import { formatPrice } from "@/utils/helperFunctions";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

export default function CustomerPackageBookingList() {
  const router = useRouter();
  const { data, isLoading } = useGetCustomerPackageBookings();

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
        <Typography variant="h4" fontWeight={800} color="primary.main">
          Package bookings
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            sx={{ textTransform: "none" }}
            onClick={() => router.push("/customer/booking")}
          >
            Single bookings
          </Button>
          <Button
            variant="contained"
            sx={{ textTransform: "none" }}
            onClick={() => router.push("/packages")}
          >
            Browse packages
          </Button>
        </Stack>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      ) : !data ? (
        <ApiErrorResponse />
      ) : data.count === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={8}>
          You haven&apos;t booked any packages yet.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {data.results.map((booking) => (
            <Grid key={booking.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card sx={cardSx}>
                <CardActionArea
                  onClick={() =>
                    router.push(`/customer/package-bookings/${booking.id}`)
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
                      <Typography variant="body2" color="text.secondary">
                        {booking.company_name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color={
                          booking.is_schedule_overdue
                            ? "error.main"
                            : booking.unscheduled_count > 0
                              ? "warning.dark"
                              : "success.main"
                        }
                        fontWeight={700}
                      >
                        {getScheduleLabel(booking)}
                      </Typography>
                      <Typography variant="h6" fontWeight={900} color="primary.main">
                        {formatPrice(Number(booking.total_price))}
                      </Typography>
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
