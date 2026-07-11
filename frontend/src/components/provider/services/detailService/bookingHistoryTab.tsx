"use client";

import { useCallback, useState } from "react";
import {
  AccessTimeRounded,
  CalendarMonthRounded,
  GroupsRounded,
  MailOutlineRounded,
  ReceiptLongRounded,
} from "@mui/icons-material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import type { ReactNode } from "react";
import { getStatusChip } from "@/components/common/statusChip/statusChip";
import { useGetProviderBookingList } from "@/hooks/booking";
import type { Booking } from "@/services/customer/booking";
import { formatDate, formatPrice, formatTime } from "@/utils/helperFunctions";

export default function BookingHistoryTab({ uuid }: { uuid: string }) {
  const [page, setPage] = useState(1);

  const { data: providerBookingList, isLoading } = useGetProviderBookingList({
    service_id: uuid,
    page: 1,
    page_size: page * 5,
  });

  const bookings = providerBookingList?.results ?? [];
  const isViewMoreLoading = isLoading && page > 1;
  const showViewMore =
    Boolean(providerBookingList && bookings.length < providerBookingList.count) ||
    isViewMoreLoading;

  const handleViewMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  if (isLoading && bookings.length === 0) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Grid key={index} size={{ xs: 12, md: 6, xl: 4 }}>
            <BookingHistoryCardSkeleton />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (bookings.length > 0) {
    return (
      <Stack spacing={2.5}>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              color: "primary.main",
            }}
          >
            Recent bookings
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Latest customer bookings for this service.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {bookings.map((booking) => (
            <Grid key={booking.id} size={{ xs: 12, md: 6, xl: 4 }}>
              <BookingHistoryCard booking={booking} />
            </Grid>
          ))}
        </Grid>

        {showViewMore && (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="outlined"
              endIcon={
                !isViewMoreLoading ? (
                  <ArrowForwardRoundedIcon />
                ) : (
                  <CircularProgress size={18} />
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
      <Stack spacing={1}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 900,
            color: "primary.main",
          }}
        >
          No booking history yet
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Booking history will appear here once customers start booking this
          service.
        </Typography>
      </Stack>
    </Box>
  );
}

function BookingHistoryCard({ booking }: { booking: Booking }) {
  const customerName =
    booking.contact_detail_full_name?.trim() ||
    booking.customer_name?.trim() ||
    "Customer";

  return (
    <Box
      sx={{
        height: "100%",
        borderRadius: 3,
        backgroundColor: "#fff",
        border: "1px solid rgba(11, 61, 145, 0.12)",
        boxShadow: "0 10px 28px rgba(7, 42, 99, 0.07)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          height: 6,
          background:
            "linear-gradient(135deg, #072a63 0%, #0B3D91 55%, #C9A227 100%)",
        }}
      />

      <Stack spacing={2} sx={{ p: { xs: 2, sm: 2.5 }, flex: 1 }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          gap={1.5}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: "#072a63",
                fontWeight: 900,
                lineHeight: 1.35,
                overflowWrap: "anywhere",
              }}
            >
              {customerName}
            </Typography>

            <Stack
              direction="row"
              spacing={0.8}
              alignItems="center"
              sx={{ mt: 0.5, color: "text.secondary" }}
            >
              <MailOutlineRounded sx={{ fontSize: 17, flexShrink: 0 }} />
              <Typography
                variant="body2"
                sx={{ overflowWrap: "anywhere", lineHeight: 1.4 }}
              >
                {booking.contact_detail_email || "No email provided"}
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ flexShrink: 0 }}>{getStatusChip(booking.status)}</Box>
        </Stack>

        <Divider />

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BookingHistoryInfo
              icon={<CalendarMonthRounded />}
              label="Date"
              value={formatDate(booking.event_date)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <BookingHistoryInfo
              icon={<AccessTimeRounded />}
              label="Time"
              value={`${formatTime(booking.event_time)} - ${formatTime(
                booking.event_end_time,
              )}`}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <BookingHistoryInfo
              icon={<GroupsRounded />}
              label="Guests"
              value={`${booking.guest_numbers} guest${
                booking.guest_numbers === 1 ? "" : "s"
              }`}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <BookingHistoryInfo
              icon={<ReceiptLongRounded />}
              label="Total"
              value={formatPrice(booking.total_price)}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "auto" }}>
          <Box
            component={Link}
            href={`/provider/bookings/${booking.id}/preview`}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              borderRadius: 2,
              px: 1,
              py: 0.5,
              color: "#0B3D91",
              fontWeight: 800,
              textDecoration: "none",
              "&:hover": {
                backgroundColor: "rgba(11, 61, 145, 0.06)",
              },
              "& svg": {
                fontSize: 18,
              },
            }}
          >
            <Typography component="span" variant="body2" fontWeight={800}>
              View details
            </Typography>
            <ArrowForwardRoundedIcon />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}

function BookingHistoryInfo({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: 2,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "primary.main",
          background:
            "linear-gradient(135deg, rgba(11, 61, 145, 0.08) 0%, rgba(201, 162, 39, 0.16) 100%)",
          "& svg": { fontSize: 19 },
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          {label}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "#1f2937",
            fontWeight: 900,
            lineHeight: 1.35,
            overflowWrap: "anywhere",
          }}
        >
          {value || "Not provided"}
        </Typography>
      </Box>
    </Stack>
  );
}

function BookingHistoryCardSkeleton() {
  return (
    <Box
      sx={{
        height: "100%",
        borderRadius: 3,
        backgroundColor: "#fff",
        border: "1px solid rgba(11, 61, 145, 0.12)",
        boxShadow: "0 10px 28px rgba(7, 42, 99, 0.07)",
        overflow: "hidden",
      }}
    >
      <Skeleton variant="rectangular" height={6} />

      <Stack spacing={2} sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" justifyContent="space-between" gap={1.5}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="55%" height={28} />
            <Skeleton variant="text" width="78%" height={22} />
          </Box>

          <Skeleton variant="rounded" width={82} height={26} />
        </Stack>

        <Divider />

        <Grid container spacing={1.5}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Skeleton variant="rounded" width={34} height={34} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="38%" height={18} />
                  <Skeleton variant="text" width="68%" height={22} />
                </Box>
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Skeleton variant="rounded" height={68} sx={{ borderRadius: 2 }} />
      </Stack>
    </Box>
  );
}
