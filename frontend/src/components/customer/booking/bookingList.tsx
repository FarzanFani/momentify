"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Tab,
  Tabs,
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
  GroupsRounded,
  CategoryRounded,
  PaymentRounded,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import {
  formatDate,
  formatPaymentOption,
  formatPrice,
  formatTime,
} from "@/utils/helperFunctions";
import {
  useGetCustomerBookingList,
  useGetCustomerHistoryBookingList,
} from "@/hooks/booking";
import { Booking } from "@/services/customer/booking";
import { getStatusChip } from "@/components/common/statusChip/statusChip";

export default function CustomerBookingsPage() {
  const { data: bookingsList, isLoading } = useGetCustomerBookingList();

  const { data: historyBooking, isLoading: isHistoryBookingLoading } =
    useGetCustomerHistoryBookingList();

  const bookings: Booking[] = bookingsList?.results ?? [];
  const historyBookings: Booking[] = historyBooking?.results ?? [];

  const isPageLoading = isLoading || isHistoryBookingLoading;
  const hasAnyBookings = bookings.length > 0 || historyBookings.length > 0;

  return isPageLoading ? (
    <BookingsPageSkeleton />
  ) : hasAnyBookings ? (
    <BookingsMainView bookings={bookings} historyBookings={historyBookings} />
  ) : (
    <EmptyBookingsView />
  );
}

function BookingsMainView({
  bookings,
  historyBookings,
}: {
  bookings: Booking[];
  historyBookings: Booking[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  const upcomingBookings = bookings.filter((booking) => {
    const status = booking.status?.toLowerCase();

    return status === "pending" || status === "confirmed";
  });

  const completedBookings =
    historyBookings.length > 0
      ? historyBookings
      : bookings.filter((booking) => {
          const status = booking.status?.toLowerCase();

          return (
            status === "completed" ||
            status === "cancelled" ||
            status === "rejected"
          );
        });

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
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
            flexDirection: { xs: "column", md: "row" },
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

          <Box
            width={{ xs: "100%", md: "auto" }}
            display="flex"
            justifyContent="flex-end"
          >
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
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <BookingSummaryCard
              label="Total Bookings"
              value={upcomingBookings.length + completedBookings.length}
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
              label="History"
              value={completedBookings.length}
              helper="Completed or closed bookings"
            />
          </Grid>
        </Grid>

        <Card
          sx={{
            borderRadius: 4,
            border: "1px solid rgba(11, 61, 145, 0.12)",
            boxShadow: "0 10px 28px rgba(7, 42, 99, 0.08)",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              borderBottom: "1px solid rgba(11, 61, 145, 0.12)",
              background:
                "linear-gradient(135deg, rgba(11, 61, 145, 0.04) 0%, rgba(201, 162, 39, 0.08) 100%)",
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 900,
                py: 2,
                color: "text.secondary",
              },
              "& .Mui-selected": {
                color: "#0B3D91",
              },
              "& .MuiTabs-indicator": {
                height: 4,
                borderRadius: 999,
                background: "linear-gradient(135deg, #0B3D91 0%, #C9A227 100%)",
              },
            }}
          >
            <Tab label={`Upcoming (${upcomingBookings.length})`} />
            <Tab label={`History (${completedBookings.length})`} />
          </Tabs>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {activeTab === 0 && (
              <Stack spacing={2.5}>
                <SectionTitle
                  title="Upcoming bookings"
                  subtitle="Pending and confirmed service bookings."
                />

                {upcomingBookings.length > 0 ? (
                  <Grid container spacing={2}>
                    {upcomingBookings.map((booking) => (
                      <Grid key={booking.id} size={{ xs: 12, md: 6, xl: 4 }}>
                        <BookingCard booking={booking} />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <SmallEmptyState message="You do not have any upcoming bookings." />
                )}
              </Stack>
            )}

            {activeTab === 1 && (
              <Stack spacing={2.5}>
                <SectionTitle
                  title="Booking history"
                  subtitle="Completed, cancelled or rejected bookings."
                />

                {completedBookings.length > 0 ? (
                  <Grid container spacing={2}>
                    {completedBookings.map((booking) => (
                      <Grid key={booking.id} size={{ xs: 12, md: 6, xl: 4 }}>
                        <BookingCard booking={booking} />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <SmallEmptyState message="No booking history yet." />
                )}
              </Stack>
            )}
          </Box>
        </Card>
      </Stack>
    </Box>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
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

            {getStatusChip(booking.status)}
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
                value={`${formatTime(booking.event_time)} - ${formatTime(
                  booking.event_end_time,
                )}`}
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
                icon={<GroupsRounded />}
                label="Guests"
                value={`${booking.guest_numbers} guest${
                  booking.guest_numbers === 1 ? "" : "s"
                }`}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <BookingInfoItem
                icon={<CategoryRounded />}
                label="Category"
                value={booking.category_name || booking.event_type}
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
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
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
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box display="flex" flexDirection="column">
                  <Box display="flex" alignItems="center" gap={1}>
                    <PaymentRounded
                      sx={{ fontSize: 18, color: "text.secondary" }}
                    />

                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 700,
                      }}
                    >
                      Payment option
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "#1f2937",
                      fontWeight: 800,
                      mt: 0.3,
                    }}
                  >
                    {formatPaymentOption(booking.payment_option)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<VisibilityRounded />}
            onClick={() =>
              router.push(`/customer/booking/${booking.id}/preview`)
            }
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
    <Stack direction="row" spacing={1.2} alignItems="flex-end">
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
          {value || "Not provided"}
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
                  height={360}
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
