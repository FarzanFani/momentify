"use client";

import { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import {
  AccessTimeRounded,
  CalendarMonthRounded,
  CheckCircleRounded,
  CloseRounded,
  EventAvailableRounded,
  GroupsRounded,
  LocationOnRounded,
  MoreVertRounded,
  VisibilityRounded,
} from "@mui/icons-material";
import { formatPrice } from "@/utils/helperFunctions";
import SearchInput from "@/components/common/searchInput/SearchInput";
import SelectDropdown from "@/components/common/dropdown/Dropdown";
import TableComponent from "@/components/common/table/Table";
import type {
  DropdownOptionItem,
  TableColumn,
  TableRowDataType,
} from "@/types/general";

type ProviderBookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

type ProviderBooking = {
  id: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  companyName: string;
  date: string;
  time: string;
  location: string;
  guests: number;
  totalPrice: number;
  status: ProviderBookingStatus;
  payment: string;
};

const bookings: ProviderBooking[] = [
  {
    id: "BK-1048",
    customerName: "Mina Carter",
    customerEmail: "mina.carter@example.com",
    serviceName: "Wedding Photography",
    companyName: "Luma Studio",
    date: "2026-06-18",
    time: "15:00 - 20:00",
    location: "Rosewood Hall",
    guests: 120,
    totalPrice: 2800,
    status: "pending",
    payment: "Deposit later",
  },
  {
    id: "BK-1047",
    customerName: "Daniel Brooks",
    customerEmail: "daniel.brooks@example.com",
    serviceName: "Corporate Catering",
    companyName: "North Table",
    date: "2026-06-22",
    time: "11:30 - 14:30",
    location: "Cedar Conference Center",
    guests: 85,
    totalPrice: 3400,
    status: "confirmed",
    payment: "Deposit paid",
  },
  {
    id: "BK-1046",
    customerName: "Sara Nguyen",
    customerEmail: "sara.nguyen@example.com",
    serviceName: "Live Jazz Trio",
    companyName: "Blue Note Events",
    date: "2026-06-27",
    time: "19:00 - 22:00",
    location: "Private Residence",
    guests: 45,
    totalPrice: 1250,
    status: "confirmed",
    payment: "Full amount later",
  },
  {
    id: "BK-1045",
    customerName: "Owen Hill",
    customerEmail: "owen.hill@example.com",
    serviceName: "Birthday Decoration",
    companyName: "Bloom & Bash",
    date: "2026-05-29",
    time: "09:00 - 13:00",
    location: "Maple Garden",
    guests: 32,
    totalPrice: 760,
    status: "completed",
    payment: "Paid",
  },
  {
    id: "BK-1044",
    customerName: "Priya Shah",
    customerEmail: "priya.shah@example.com",
    serviceName: "Event Makeup Artist",
    companyName: "Vera Beauty",
    date: "2026-05-25",
    time: "13:00 - 16:00",
    location: "Grand Aster Hotel",
    guests: 8,
    totalPrice: 540,
    status: "cancelled",
    payment: "Refunded",
  },
];

const statusLabels: Record<ProviderBookingStatus | "all", string> = {
  all: "All",
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusColors: Record<
  ProviderBookingStatus,
  { background: string; color: string }
> = {
  pending: { background: "#FEF3C7", color: "#92400E" },
  confirmed: { background: "#DCFCE7", color: "#166534" },
  completed: { background: "#DBEAFE", color: "#1D4ED8" },
  cancelled: { background: "#FEE2E2", color: "#991B1B" },
};

const statusFilterOptions: DropdownOptionItem[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const columns: TableColumn[] = [
  {
    id: "customer",
    label: "Customer",
    minWidth: 250,
    align: "left",
  },
  {
    id: "service",
    label: "Service",
    minWidth: 230,
    align: "left",
  },
  {
    id: "schedule",
    label: "Schedule",
    minWidth: 180,
    align: "left",
  },
  {
    id: "location",
    label: "Location",
    minWidth: 210,
    align: "left",
  },
  {
    id: "status",
    label: "Status",
    minWidth: 130,
    align: "left",
  },
  {
    id: "total",
    label: "Total",
    minWidth: 150,
    align: "right",
  },
  {
    id: "action_items",
    label: "",
    minWidth: 120,
    align: "right",
  },
];

export default function ProviderBookings() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ProviderBookingStatus | "all">("all");
  const [paginationPage, setPaginationPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredBookings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesStatus = status === "all" || booking.status === status;
      const matchesQuery =
        normalizedQuery === "" ||
        [
          booking.id,
          booking.customerName,
          booking.customerEmail,
          booking.serviceName,
          booking.companyName,
          booking.location,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [query, status]);

  const tableRows = useMemo<TableRowDataType[]>(
    () =>
      filteredBookings.map((booking) => ({
        id: booking.id,
        cells: {
          customer: (
            <Stack direction="row" gap={1.5} alignItems="center">
              <Avatar sx={{ bgcolor: "primary.main" }}>
                {booking.customerName.charAt(0)}
              </Avatar>

              <Box>
                <Typography fontWeight={900} color="primary.dark">
                  {booking.customerName}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {booking.customerEmail}
                </Typography>
              </Box>
            </Stack>
          ),
          service: (
            <Box>
              <Typography fontWeight={900}>{booking.serviceName}</Typography>

              <Typography variant="body2" color="text.secondary">
                {booking.companyName} - {booking.id}
              </Typography>
            </Box>
          ),
          schedule: (
            <Stack spacing={0.5}>
              <IconText icon={<CalendarMonthRounded />} text={booking.date} />
              <IconText icon={<AccessTimeRounded />} text={booking.time} />
            </Stack>
          ),
          location: (
            <Stack spacing={0.5}>
              <IconText icon={<LocationOnRounded />} text={booking.location} />
              <IconText
                icon={<GroupsRounded />}
                text={`${booking.guests} guests`}
              />
            </Stack>
          ),
          status: <StatusChip status={booking.status} />,
          total: (
            <Box textAlign="right">
              <Typography fontWeight={900}>
                {formatPrice(booking.totalPrice)}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {booking.payment}
              </Typography>
            </Box>
          ),
          action_items: (
            <Stack direction="row" justifyContent="flex-end">
              <IconButton aria-label="Preview booking">
                <VisibilityRounded color="primary" />
              </IconButton>

              <IconButton aria-label="More booking actions">
                <MoreVertRounded color="primary" />
              </IconButton>
            </Stack>
          ),
        },
      })),
    [filteredBookings],
  );

  const paginatedRows = useMemo(() => {
    const startIndex = (paginationPage - 1) * pageSize;

    return tableRows.slice(startIndex, startIndex + pageSize);
  }, [paginationPage, pageSize, tableRows]);

  const pendingCount = bookings.filter(
    (booking) => booking.status === "pending",
  ).length;
  const confirmedCount = bookings.filter(
    (booking) => booking.status === "confirmed",
  ).length;
  const completedCount = bookings.filter(
    (booking) => booking.status === "completed",
  ).length;
  const revenue = bookings
    .filter((booking) => booking.status !== "cancelled")
    .reduce((total, booking) => total + booking.totalPrice, 0);

  return (
    <Box
      sx={{
        minHeight: "100%",
        width: "100%",
        backgroundColor: "#F5F7FA",
        px: { xs: 0, sm: 1, lg: 2 },
        py: { xs: 1, md: 2 },
      }}
    >
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "flex-end" }}
          gap={2}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ color: "primary.main", fontWeight: 900 }}
            >
              Bookings
            </Typography>

            <Typography color="text.secondary">
              Review customer booking requests and upcoming provider work.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
            <Button
              variant="outlined"
              startIcon={<CloseRounded />}
              sx={{ textTransform: "none", fontWeight: 800 }}
            >
              Decline
            </Button>

            <Button
              variant="contained"
              startIcon={<CheckCircleRounded />}
              sx={{ textTransform: "none", fontWeight: 800 }}
            >
              Confirm Booking
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <SummaryCard
              title="Total Bookings"
              value={bookings.length}
              helper="All visible requests"
              icon={<EventAvailableRounded />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <SummaryCard
              title="Pending"
              value={pendingCount}
              helper="Waiting for response"
              icon={<AccessTimeRounded />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <SummaryCard
              title="Confirmed"
              value={confirmedCount}
              helper={`${completedCount} completed`}
              icon={<CheckCircleRounded />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <SummaryCard
              title="Booked Value"
              value={formatPrice(revenue)}
              helper="Excluding cancelled"
              icon={<GroupsRounded />}
            />
          </Grid>
        </Grid>

        <Card
          sx={{
            borderRadius: 2,
            border: "1px solid rgba(11, 61, 145, 0.12)",
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Stack spacing={2.5}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", md: "center" }}
                gap={2}
              >
                <SearchInput
                  value={query}
                  placeholder="Search by customer, service, location"
                  maxWidth="430px"
                  onChange={(value) => {
                    setQuery(value);
                    setPaginationPage(1);
                  }}
                />

                <Box sx={{ width: { xs: "100%", md: 220 } }}>
                  <SelectDropdown
                    label="Status"
                    value={status}
                    options={statusFilterOptions}
                    onChange={(value) => {
                      setStatus(value as ProviderBookingStatus | "all");
                      setPaginationPage(1);
                    }}
                    height={40}
                  />
                </Box>
              </Stack>

              <Divider />

              <TableComponent
                columns={columns}
                data={paginatedRows}
                count={tableRows.length}
                paginationPage={paginationPage}
                setPaginationPage={setPaginationPage}
                pageSize={pageSize}
                setPageSize={(nextPageSize) => {
                  setPageSize(nextPageSize);
                  setPaginationPage(1);
                }}
                rowsPerPageOptions={[5, 10, 25]}
                emptyMessage="No bookings match this view"
                inOneLineWhenCompact={false}
              />
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

function SummaryCard({
  title,
  value,
  helper,
  icon,
}: {
  title: string;
  value: string | number;
  helper: string;
  icon: React.ReactNode;
}) {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 2,
        border: "1px solid rgba(11, 61, 145, 0.12)",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" gap={2}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "secondary.dark",
                fontWeight: 900,
                textTransform: "uppercase",
              }}
            >
              {title}
            </Typography>

            <Typography
              variant="h5"
              sx={{ color: "primary.main", fontWeight: 900, mt: 0.6 }}
            >
              {value}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {helper}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.main",
              backgroundColor: "rgba(11, 61, 145, 0.08)",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function StatusChip({ status }: { status: ProviderBookingStatus }) {
  const colors = statusColors[status];

  return (
    <Chip
      label={statusLabels[status]}
      size="small"
      sx={{
        backgroundColor: colors.background,
        color: colors.color,
        fontWeight: 900,
        textTransform: "capitalize",
      }}
    />
  );
}

function IconText({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Stack direction="row" gap={0.8} alignItems="center">
      <Box
        sx={{
          color: "primary.main",
          display: "flex",
          "& svg": { fontSize: 18 },
        }}
      >
        {icon}
      </Box>

      <Typography variant="body2" color="text.secondary" fontWeight={700}>
        {text}
      </Typography>
    </Stack>
  );
}
