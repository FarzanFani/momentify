"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Tabs,
  Tab,
  Typography,
} from "@mui/material";
import {
  AccessTimeRounded,
  CalendarMonthRounded,
  CheckCircleRounded,
  EventAvailableRounded,
  GroupsRounded,
  List,
  Event,
} from "@mui/icons-material";
import { formatPrice } from "@/utils/helperFunctions";
import SearchInput from "@/components/common/searchInput/SearchInput";
import { BookingList } from "@/services/provider/booking";
import { useRouter } from "next/navigation";
import ListTableView from "./List/tableView";
import ListCalendarView from "./List/calendarView/calendarView";
import { statusFilterOptions } from "@/utils/constants";
import StatusFilterChips from "@/components/common/statusFilterChips/statusFilterChips";
import { useGetProviderBookingSummary } from "@/hooks/booking";
import QuickManageView from "./List/quickManageView/quickManageView";

export default function ProviderBookings({
  bookingResponse,
}: {
  bookingResponse: BookingList | undefined;
}) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const { data: providerBookingSummary } = useGetProviderBookingSummary();

  const [statusFilter, setStatusFilter] = useState("ALL");

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
              value={
                providerBookingSummary
                  ? providerBookingSummary.total_booking_count
                  : 0
              }
              helper="All visible requests"
              icon={<EventAvailableRounded />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <SummaryCard
              title="Pending"
              value={
                providerBookingSummary
                  ? providerBookingSummary.pending_count
                  : 0
              }
              helper="Waiting for response"
              icon={<AccessTimeRounded />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <SummaryCard
              title="Confirmed"
              value={
                providerBookingSummary
                  ? providerBookingSummary.confirmed_count
                  : 0
              }
              helper={`${providerBookingSummary ? providerBookingSummary.completed_count : 0} completed`}
              icon={<CheckCircleRounded />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <SummaryCard
              title="Booked Value"
              value={formatPrice(
                providerBookingSummary ? providerBookingSummary.total_price : 0,
              )}
              helper="Excluding cancelled and rejected"
              icon={<GroupsRounded />}
            />
          </Grid>
        </Grid>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="booking-page-tabs"
          sx={{
            borderBottom: "1px solid",
            borderColor: "primary.main",

            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "0.8rem",
              minHeight: 40,
              px: 2,
            },

            "& .Mui-selected": {
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          <Tab
            icon={<CalendarMonthRounded />}
            iconPosition="start"
            label="Calendar view"
          />
          <Tab icon={<List />} iconPosition="start" label="List view" />
          <Tab icon={<Event />} iconPosition="start" label="Quick Manage" />
        </Tabs>

        <Stack direction={"row"} gap={2} flexWrap={"wrap"}>
          <SearchInput
            value={search}
            placeholder="Search by customer, service"
            maxWidth="430px"
            onChange={setSearch}
          />

          {activeTab !== 2 && (
            <StatusFilterChips
              options={statusFilterOptions}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          )}
        </Stack>

        {activeTab === 0 && (
          <ListCalendarView search={search} status={statusFilter} />
        )}
        {activeTab === 1 && (
          <ListTableView search={search} statusFilter={statusFilter} />
        )}
        {activeTab === 2 && <QuickManageView search={search} />}
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
