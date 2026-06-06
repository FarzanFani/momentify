"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
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
import { getStatusChip } from "@/components/common/statusChip/statusChip";
import type {
  DropdownOptionItem,
  TableColumn,
  TableRowDataType,
} from "@/types/general";
import { useGetProviderBookingList } from "@/hooks/booking";
import { ProviderBookingListParams } from "@/services/provider/booking";
import { useRouter } from "next/navigation";

const statusFilterOptions: DropdownOptionItem[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Rejected", value: "REJECTED" },
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
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [paginationPage, setPaginationPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [bookingParams, setBookingParams] = useState<ProviderBookingListParams>(
    { page: 1, page_size: 10 },
  );

  const { data: bookingResponse, isLoading: isBookingLoading } =
    useGetProviderBookingList(bookingParams);

  const tableRows = useMemo<TableRowDataType[]>(
    () =>
      bookingResponse
        ? bookingResponse.results.map((booking) => ({
            id: booking.id,
            cells: {
              customer: (
                <Stack direction="row" gap={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    {booking.customer_name.charAt(0)}
                  </Avatar>

                  <Box>
                    <Typography fontWeight={900} color="primary.dark">
                      {booking.customer_name}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {booking.contact_detail_email}
                    </Typography>
                  </Box>
                </Stack>
              ),
              service: (
                <Box>
                  <Typography fontWeight={900}>
                    {booking.service_name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {booking.company_name}
                  </Typography>
                </Box>
              ),
              schedule: (
                <Stack spacing={0.5}>
                  <IconText
                    icon={<CalendarMonthRounded />}
                    text={booking.event_date}
                  />
                  <IconText
                    icon={<AccessTimeRounded />}
                    text={`${booking.event_time} - ${booking.event_end_time}`}
                  />
                </Stack>
              ),
              location: (
                <Stack spacing={0.5}>
                  <IconText
                    icon={<LocationOnRounded />}
                    text={!booking.location ? "Not provided" : booking.location}
                  />
                  <IconText
                    icon={<GroupsRounded />}
                    text={`${booking.guest_numbers} guests`}
                  />
                </Stack>
              ),
              status: getStatusChip(booking.status),
              total: (
                <Box textAlign="right">
                  <Typography fontWeight={900}>
                    {formatPrice(booking.total_price)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {booking.total_price}
                  </Typography>
                </Box>
              ),
              action_items: (
                <Stack direction="row" justifyContent="flex-end">
                  <IconButton
                    aria-label="Preview booking"
                    onClick={() =>
                      router.push(`/provider/bookings/${booking.id}/preview`)
                    }
                  >
                    <VisibilityRounded color="primary" />
                  </IconButton>
                </Stack>
              ),
            },
          }))
        : [],
    [bookingResponse, router],
  );

  const onChangeDropdown = useCallback((value: string) => {
    setStatus(value);
    setBookingParams((prev) => ({
      ...prev,
      status: value === "ALL" ? undefined : value,
      page: 1,
    }));
  }, []);

  const onChangeSearch = useCallback((value: string) => {
    setSearch(value);
    setBookingParams((prev) => ({
      ...prev,
      search: value.trim() !== "" ? value : undefined,
      page: 1,
    }));
  }, []);

  const onPageSizeChange = useCallback((value: number) => {
    setPageSize(value);
    setPaginationPage(1);
    setBookingParams((prev) => ({ ...prev, page_size: value, page: 1 }));
  }, []);

  const onPageChange = useCallback((value: number) => {
    setPaginationPage(value);
    setBookingParams((prev) => ({ ...prev, page: value }));
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100%",
        width: "100%",
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
        </Stack>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <SummaryCard
              title="Total Bookings"
              value={bookingResponse ? bookingResponse.total_booking_count : 0}
              helper="All visible requests"
              icon={<EventAvailableRounded />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <SummaryCard
              title="Pending"
              value={bookingResponse ? bookingResponse.pending_count : 0}
              helper="Waiting for response"
              icon={<AccessTimeRounded />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <SummaryCard
              title="Confirmed"
              value={bookingResponse ? bookingResponse.confirmed_count : 0}
              helper={`${bookingResponse ? bookingResponse.completed_count : 0} completed`}
              icon={<CheckCircleRounded />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <SummaryCard
              title="Booked Value"
              value={formatPrice(
                bookingResponse ? bookingResponse.total_price : 0,
              )}
              helper="Excluding cancelled and rejected"
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
                  value={search}
                  placeholder="Search by customer, service, location"
                  maxWidth="430px"
                  onChange={(value) => onChangeSearch(value)}
                />

                <Box sx={{ width: { xs: "100%", md: 220 } }}>
                  <SelectDropdown
                    label="Status"
                    value={status}
                    options={statusFilterOptions}
                    onChange={(value) => onChangeDropdown(value)}
                    height={40}
                  />
                </Box>
              </Stack>

              <Divider />

              <TableComponent
                columns={columns}
                data={tableRows}
                count={bookingResponse?.count ?? 0}
                paginationPage={paginationPage}
                setPaginationPage={onPageChange}
                pageSize={pageSize}
                isLoading={isBookingLoading}
                setPageSize={onPageSizeChange}
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
