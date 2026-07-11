"use client";

import { getStatusChip } from "@/components/common/statusChip/statusChip";
import { useGetProviderBookingList } from "@/hooks/booking";
import { ProviderBookingListParams } from "@/services/provider/booking";
import {
  DropdownOptionItem,
  TableColumn,
  TableRowDataType,
} from "@/types/general";
import { formatPrice } from "@/utils/helperFunctions";
import {
  Avatar,
  Stack,
  Typography,
  Box,
  IconButton,
  CardContent,
  Card,
  Divider,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AccessTimeRounded,
  CalendarMonthRounded,
  GroupsRounded,
  LocationOnRounded,
  VisibilityRounded,
} from "@mui/icons-material";
import TableComponent from "@/components/common/table/Table";
import SelectDropdown from "@/components/common/dropdown/Dropdown";
import SearchInput from "@/components/common/searchInput/SearchInput";

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

export default function ListTableView({
  statusFilter,
  search,
}: {
  statusFilter: string | undefined;
  search: string | undefined;
}) {
  const router = useRouter();

  const [paginationPage, setPaginationPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [bookingParams, setBookingParams] = useState<ProviderBookingListParams>(
    { page: 1, page_size: 10 },
  );

  const { data: bookingResponse, isLoading: isBookingLoading } =
    useGetProviderBookingList(bookingParams);

  useEffect(() => {
    setBookingParams((prev) => ({
      ...prev,
      search: search?.trim() || undefined,
      status: statusFilter === "ALL" ? undefined : statusFilter,
    }));
  }, [statusFilter, search]);

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
    <Box pt={2}>
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
        inOneLineWhenCompact={true}
      />
    </Box>
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
