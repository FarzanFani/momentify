"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import {
  AccessTimeRounded,
  CalendarMonthRounded,
  BusinessRounded,
  LocationOnRounded,
  ReceiptLongRounded,
  SearchOffRounded,
  VisibilityRounded,
  ExploreRounded,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/utils/helperFunctions";

type BookingStatus =
  | "pending"
  | "confirmed"
  | "declined"
  | "cancelled"
  | "completed";

type CustomerBooking = {
  id: string;
  service_id: string;
  service_name: string;
  company_name: string;
  event_date: string;
  start_time?: string;
  location?: string;
  status: BookingStatus;
  total_price: number;
  created_at: string;
};

const mockBookings: CustomerBooking[] = [
  {
    id: "booking-1",
    service_id: "service-1",
    service_name: "Wedding Photography Package",
    company_name: "Elegant Moments Studio",
    event_date: "2026-07-24",
    start_time: "14:00",
    location: "London, UK",
    status: "confirmed",
    total_price: 850,
    created_at: "2026-05-20",
  },
  {
    id: "booking-2",
    service_id: "service-2",
    service_name: "Funeral Flower Arrangement",
    company_name: "Peaceful Flowers",
    event_date: "2026-06-12",
    start_time: "10:30",
    location: "Manchester, UK",
    status: "pending",
    total_price: 320,
    created_at: "2026-05-28",
  },
];

export default function CustomerBookingsPage() {
  // Replace this later with your real hook:
  // const { data: bookings, isLoading } = useGetCustomerBookings();

  const bookings = mockBookings;
  const isLoading = false;

  return isLoading ? (
    <BookingsPageSkeleton />
  ) : bookings.length > 0 ? (
    <BookingsMainView bookings={bookings} />
  ) : (
    <EmptyBookingsView />
  );
}

function BookingsMainView({ bookings }: { bookings: CustomerBooking[] }) {
  const router = useRouter();

  const upcomingBookings = bookings.filter(
    (booking) => booking.status === "pending" || booking.status === "confirmed",
  );

  const completedBookings = bookings.filter(
    (booking) =>
      booking.status === "completed" ||
      booking.status === "cancelled" ||
      booking.status === "declined",
  );

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        px: { xs: 2, sm: 3 },
        py: 3,
        background: "linear-gradient(180deg, #F7FAFF 0%, #ffffff 100%)",
      }}
    >
      <Stack spacing={3}>
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={900} color="primary.main">
              My Bookings
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Track your service requests, confirmations, and upcoming events.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<ExploreRounded />}
            onClick={() => router.push("/services")}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.2,
              fontWeight: 800,
              textTransform: "none",
              color: "#fff",
              background:
                "linear-gradient(135deg, #0B3D91 0%, #2F5FB3 65%, #C9A227 100%)",
              boxShadow: "0 10px 22px rgba(11, 61, 145, 0.28)",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #072a63 0%, #0B3D91 60%, #8C6A12 100%)",
                boxShadow: "0 12px 26px rgba(11, 61, 145, 0.34)",
              },
            }}
          >
            Browse Services
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <BookingSummaryCard
              label="Total Bookings"
              value={bookings.length}
              helper="All booking requests"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <BookingSummaryCard
              label="Upcoming"
              value={upcomingBookings.length}
              helper="Pending or confirmed"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <BookingSummaryCard
              label="Completed"
              value={completedBookings.length}
              helper="Past or closed bookings"
            />
          </Grid>
        </Grid>

        <Stack spacing={2.5}>
          <SectionTitle
            title="Upcoming bookings"
            subtitle="Pending and confirmed service bookings."
          />

          {upcomingBookings.length > 0 ? (
            <Grid container spacing={2}>
              {upcomingBookings.map((booking) => (
                <Grid key={booking.id} size={{ xs: 12, md: 6 }}>
                  <BookingCard booking={booking} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <SmallEmptyState message="You do not have any upcoming bookings." />
          )}
        </Stack>

        <Stack spacing={2.5}>
          <SectionTitle
            title="Booking history"
            subtitle="Completed, cancelled, or declined bookings."
          />

          {completedBookings.length > 0 ? (
            <Grid container spacing={2}>
              {completedBookings.map((booking) => (
                <Grid key={booking.id} size={{ xs: 12, md: 6 }}>
                  <BookingCard booking={booking} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <SmallEmptyState message="No booking history yet." />
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

function BookingCard({ booking }: { booking: CustomerBooking }) {
  const router = useRouter();

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 4,
        border: "1px solid rgba(11, 61, 145, 0.12)",
        boxShadow: "0 12px 32px rgba(7, 42, 99, 0.08)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          height: 8,
          background:
            "linear-gradient(135deg, #072a63 0%, #0B3D91 45%, #2F5FB3 72%, #C9A227 100%)",
        }}
      />

      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            gap={2}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  color: "#072a63",
                  lineHeight: 1.3,
                }}
              >
                {booking.service_name}
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mt: 0.8, color: "text.secondary" }}
              >
                <BusinessRounded sx={{ fontSize: 18 }} />
                <Typography variant="body2">{booking.company_name}</Typography>
              </Stack>
            </Box>

            <StatusChip status={booking.status} />
          </Stack>

          <Divider />

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <BookingInfoItem
                icon={<CalendarMonthRounded />}
                label="Event date"
                value={formatDate(booking.event_date)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <BookingInfoItem
                icon={<AccessTimeRounded />}
                label="Time"
                value={booking.start_time || "Not selected"}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <BookingInfoItem
                icon={<LocationOnRounded />}
                label="Location"
                value={booking.location || "Not provided"}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <BookingInfoItem
                icon={<ReceiptLongRounded />}
                label="Total"
                value={formatPrice(booking.total_price)}
              />
            </Grid>
          </Grid>

          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              background:
                "linear-gradient(135deg, rgba(11, 61, 145, 0.05) 0%, rgba(201, 162, 39, 0.1) 100%)",
              border: "1px solid rgba(11, 61, 145, 0.1)",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 700,
              }}
            >
              Booking requested
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "#1f2937",
                fontWeight: 800,
                mt: 0.3,
              }}
            >
              {formatDate(booking.created_at)}
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<VisibilityRounded />}
            onClick={() => router.push(`/customer/bookings/${booking.id}`)}
            sx={{
              borderRadius: 3,
              py: 1.15,
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
            View Booking
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function BookingInfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Stack direction="row" spacing={1.2} alignItems="flex-start">
      <Box
        sx={{
          width: 36,
          height: 36,
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
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

function BookingSummaryCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 4,
        border: "1px solid rgba(11, 61, 145, 0.12)",
        boxShadow: "0 10px 28px rgba(7, 42, 99, 0.08)",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Typography
          variant="caption"
          sx={{
            color: "secondary.dark",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          {label}
        </Typography>

        <Typography
          variant="h4"
          sx={{
            color: "primary.main",
            fontWeight: 900,
            mt: 0.7,
          }}
        >
          {value}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {helper}
        </Typography>
      </CardContent>
    </Card>
  );
}

function StatusChip({ status }: { status: BookingStatus }) {
  const statusConfig: Record<
    BookingStatus,
    {
      label: string;
      color: string;
      backgroundColor: string;
    }
  > = {
    pending: {
      label: "Pending",
      color: "#7a4b00",
      backgroundColor: "rgba(255, 193, 7, 0.22)",
    },
    confirmed: {
      label: "Confirmed",
      color: "#073b1f",
      backgroundColor: "rgba(143, 245, 183, 0.95)",
    },
    declined: {
      label: "Declined",
      color: "#7f1d1d",
      backgroundColor: "rgba(248, 113, 113, 0.2)",
    },
    cancelled: {
      label: "Cancelled",
      color: "#374151",
      backgroundColor: "rgba(156, 163, 175, 0.25)",
    },
    completed: {
      label: "Completed",
      color: "#0B3D91",
      backgroundColor: "rgba(11, 61, 145, 0.12)",
    },
  };

  const config = statusConfig[status];

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        fontWeight: 900,
        color: config.color,
        backgroundColor: config.backgroundColor,
      }}
    />
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
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
  );
}

function SmallEmptyState({ message }: { message: string }) {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 4,
        border: "1px dashed rgba(11, 61, 145, 0.25)",
        background:
          "linear-gradient(135deg, rgba(11, 61, 145, 0.04) 0%, rgba(201, 162, 39, 0.08) 100%)",
        textAlign: "center",
      }}
    >
      <Typography color="text.secondary" fontWeight={700}>
        {message}
      </Typography>
    </Box>
  );
}

function EmptyBookingsView() {
  const router = useRouter();

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3 },
        py: 4,
        background: "linear-gradient(180deg, #F7FAFF 0%, #ffffff 100%)",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 620,
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid rgba(11, 61, 145, 0.12)",
          boxShadow: "0 18px 45px rgba(7, 42, 99, 0.12)",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            height: 10,
            background:
              "linear-gradient(135deg, #072a63 0%, #0B3D91 45%, #2F5FB3 72%, #C9A227 100%)",
          }}
        />

        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Stack spacing={2.5} alignItems="center">
            <Box
              sx={{
                width: 82,
                height: 82,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, rgba(11, 61, 145, 0.08) 0%, rgba(201, 162, 39, 0.18) 100%)",
                color: "#0B3D91",
              }}
            >
              <SearchOffRounded sx={{ fontSize: 46 }} />
            </Box>

            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  color: "#072a63",
                  mb: 1,
                }}
              >
                No bookings yet
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.7,
                  maxWidth: 460,
                  mx: "auto",
                }}
              >
                You have not requested any services yet. Browse available
                services and choose one that fits your event.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<ExploreRounded />}
              onClick={() => router.push("/services")}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.2,
                fontWeight: 800,
                textTransform: "none",
                color: "#fff",
                background:
                  "linear-gradient(135deg, #0B3D91 0%, #2F5FB3 65%, #C9A227 100%)",
                boxShadow: "0 10px 22px rgba(11, 61, 145, 0.28)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #072a63 0%, #0B3D91 60%, #8C6A12 100%)",
                  boxShadow: "0 12px 26px rgba(11, 61, 145, 0.34)",
                },
              }}
            >
              Browse Services
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

function BookingsPageSkeleton() {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        px: { xs: 2, sm: 3 },
        py: 3,
        background: "linear-gradient(180deg, #F7FAFF 0%, #ffffff 100%)",
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Skeleton variant="text" width={240} height={52} />
          <Skeleton variant="text" width={420} height={28} />
        </Box>

        <Grid container spacing={2}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 4 }}>
              <Skeleton
                variant="rounded"
                height={130}
                sx={{ borderRadius: 4 }}
              />
            </Grid>
          ))}
        </Grid>

        <Stack spacing={2}>
          <Skeleton variant="text" width={220} height={34} />

          <Grid container spacing={2}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Grid key={index} size={{ xs: 12, md: 6 }}>
                <Skeleton
                  variant="rounded"
                  height={310}
                  sx={{ borderRadius: 4 }}
                />
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Stack>
    </Box>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
