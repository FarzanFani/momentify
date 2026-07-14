import { getStatusChip } from "@/components/common/statusChip/statusChip";
import {
  useGetProviderBookingList,
  useUpdateProviderBookingStatus,
} from "@/hooks/booking";
import { ProviderBookingListParams } from "@/services/provider/booking";
import { formatDate, formatPrice, formatTime } from "@/utils/helperFunctions";
import {
  Card,
  Box,
  Grid,
  Typography,
  CardContent,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  QuickManageViewSkeleton,
  QuickManageViewEmpty,
} from "./quckManageHelperView";
import { extractApiError } from "@/utils/extractApiError";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useRouter } from "next/navigation";

export default function QuickManageView({
  search,
}: {
  search: string | undefined;
}) {
  const router = useRouter();
  const [params, setParams] = useState<ProviderBookingListParams>({
    page: 1,
    page_size: 10,
    search: search?.trim() || undefined,
    status: "PENDING",
  });
  const {
    data: bookingList,
    isLoading: isBookingListLoading,
    refetch,
  } = useGetProviderBookingList(params);

  const { mutate: updateBookingStatus, isPending: isUpdateBookingStatus } =
    useUpdateProviderBookingStatus();

  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      search: search?.trim() || undefined,
    }));
  }, [search]);

  const { showSnackbar } = useSnackbar();

  if (isBookingListLoading) {
    return <QuickManageViewSkeleton />;
  }

  const handleUpdateBookingStatus = (
    bookingId: string,
    status: "CONFIRMED" | "REJECTED",
  ) => {
    updateBookingStatus(
      { bookingId, status },
      {
        onSuccess: () => {
          showSnackbar("Status updated successfully", "success");
          refetch();
        },
        onError: (error: any) => {
          showSnackbar(extractApiError(error), "error");
        },
      },
    );
  };

  if (!bookingList) {
    return (
      <QuickManageViewEmpty
        title="Unable to load bookings"
        description="Booking data is not available right now."
      />
    );
  }

  if (!bookingList.results || bookingList.results.length === 0) {
    return (
      <QuickManageViewEmpty
        title="No bookings found"
        description={
          search?.trim()
            ? "No bookings match your current search."
            : "There are no pending bookings to manage right now."
        }
      />
    );
  }

  return (
    <Grid container spacing={2}>
      {bookingList?.results.map((booking) => (
        <Grid key={booking.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <Card
            sx={{
              bgcolor: "#FFFFFF",
              border: "1px solid",
              borderColor: "grey.200",
              borderRadius: 3,
              height: "100%",
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              transition: "0.2s ease",
              "&:hover": {
                boxShadow: "0 12px 32px rgba(0,0,0,0.1)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 1.5,
                  mb: 1.5,
                }}
              >
                <Typography
                  color="primary.dark"
                  fontWeight={700}
                  fontSize={16}
                  sx={{
                    lineHeight: 1.3,
                  }}
                >
                  {booking.service_name}
                </Typography>

                <Box sx={{ flexShrink: 0 }}>
                  {getStatusChip(booking.status)}
                </Box>
              </Box>

              <Typography
                color="text.primary"
                fontWeight={500}
                sx={{ mb: 0.75 }}
              >
                {booking.customer_name} · {booking.guest_numbers} guests
              </Typography>

              <Typography
                color="text.secondary"
                fontSize={14}
                sx={{ mb: 0.75, lineHeight: 1.5 }}
              >
                {formatDate(booking.starts_at)} ·{" "}
                {formatTime(booking.starts_at)} - {formatTime(booking.ends_at)}.{" "}
                {booking.location}
              </Typography>

              <Typography
                color="primary.dark"
                fontWeight={700}
                fontSize={18}
                sx={{ mb: 2 }}
              >
                {formatPrice(booking.total_price)}
              </Typography>

              <Grid container spacing={1}>
                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6, xl: 4 }}>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    sx={{
                      bgcolor: "primary.dark",
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      "&:hover": {
                        bgcolor: "primary.main",
                      },
                    }}
                    onClick={() =>
                      handleUpdateBookingStatus(booking.id, "CONFIRMED")
                    }
                  >
                    Approve
                  </Button>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6, xl: 4 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{
                      bgcolor: "white",
                      color: "error.main",
                      borderColor: "error.light",
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      "&:hover": {
                        bgcolor: "#FFF5F5",
                        borderColor: "error.main",
                      },
                    }}
                    onClick={() =>
                      handleUpdateBookingStatus(booking.id, "REJECTED")
                    }
                  >
                    Reject
                  </Button>
                </Grid>

                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 4 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{
                      bgcolor: "white",
                      color: "primary.dark",
                      borderColor: "grey.300",
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      "&:hover": {
                        bgcolor: "#F8FAFC",
                        borderColor: "primary.main",
                      },
                    }}
                    onClick={() =>
                      router.push(`/provider/bookings/${booking.id}/preview`)
                    }
                  >
                    Preview
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
