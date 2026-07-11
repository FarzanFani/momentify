"use client";

import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
  Dialog,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventContentArg, DayCellContentArg } from "@fullcalendar/core";
import { chipColors } from "@/components/common/statusFilterChips/statusFilterChips";
import { bookingCalendarStyles } from "./bookingCalendar.styles";
import { useEffect, useRef, useState } from "react";
import {
  useGetProviderBookingList,
  useUpdateProviderBookingStatus,
} from "@/hooks/booking";
import { ProviderBookingListParams } from "@/services/provider/booking";
import { format } from "date-fns";
import { Booking } from "@/services/customer/booking";
import { formatDate, formatPrice } from "@/utils/helperFunctions";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { extractApiError } from "@/utils/extractApiError";

type BookingDetailsContentProps = {
  booking: Booking | null;
  onClose: () => void;
  handleUpdateBookingStatus: (
    id: string,
    status: "CONFIRMED" | "REJECTED",
  ) => void;
};

type CalendarViewProps = {
  search: string;
  status: string;
};

const DayCellContent = (info: DayCellContentArg) => {
  return (
    <Box
      component="span"
      sx={{
        color: "black",
        fontWeight: 600,
        fontSize: "0.85rem",
      }}
    >
      {info.isToday ? "Today" : info.dayNumberText}
    </Box>
  );
};

const getEventDurationMinutes = (startTime?: string, endTime?: string) => {
  if (!startTime || !endTime) return 0;

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;

  return endTotalMinutes - startTotalMinutes;
};

const BookingEventContent = (eventInfo: EventContentArg) => {
  const { event, view } = eventInfo;

  const status = event.extendedProps.status;
  const serviceName = event.extendedProps.service_name;
  const categoryName = event.extendedProps.category_name;
  const startTime = event.extendedProps.event_time;
  const endTime = event.extendedProps.event_end_time;

  const isWeekView = view.type === "timeGridWeek";
  const durationMinutes = getEventDurationMinutes(startTime, endTime);
  const isShortWeekEvent = isWeekView && durationMinutes < 30;

  const statusStyle = chipColors[status ?? ""] ?? {
    backgroundColor: "#E2E8F0",
    activeBackgroundColor: "#CBD5E1",
    color: "#334155",
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        p: isShortWeekEvent ? "0 4px" : "6px 8px",
        borderRadius: "4px",
        backgroundColor: statusStyle.backgroundColor,
        border: `1px solid ${statusStyle.activeBackgroundColor}`,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          mb: isShortWeekEvent ? 0 : 0.4,
        }}
      >
        <Typography
          sx={{
            fontSize: isShortWeekEvent ? "0.68rem" : "0.78rem",
            fontWeight: 900,
            lineHeight: 1.1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: "black",
          }}
        >
          {serviceName}
        </Typography>

        <Typography
          sx={{
            color: "black",
            fontSize: isShortWeekEvent ? "0.68rem" : "0.78rem",

            ".fc-popover &": {
              color: "white",
            },
          }}
        >
          |
        </Typography>

        <Typography
          sx={{
            fontSize: isShortWeekEvent ? "0.68rem" : "0.78rem",
            fontWeight: 900,
            lineHeight: 1.1,
            whiteSpace: "nowrap",
            textAlign: "right",
            color: "black",
            flexGrow: 1,
          }}
        >
          {startTime}
        </Typography>
      </Box>

      {!isShortWeekEvent && (
        <Typography
          sx={{
            fontSize: "0.7rem",
            fontWeight: 700,
            opacity: 0.85,
            lineHeight: 1.25,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: "black",
          }}
        >
          {categoryName}
        </Typography>
      )}
    </Box>
  );
};

type DetailRowProps = {
  label: string;
  value?: string | number | null;
};

const DetailRow = ({ label, value }: DetailRowProps) => {
  return (
    <Stack direction="row" justifyContent="space-between" gap={2}>
      <Typography sx={{ color: "#64748B", fontWeight: 600 }}>
        {label}
      </Typography>

      <Typography
        sx={{
          color: "#0F172A",
          fontWeight: 700,
          textAlign: "right",
        }}
      >
        {value || "-"}
      </Typography>
    </Stack>
  );
};

const BookingDetailsContent = ({
  booking,
  onClose,
  handleUpdateBookingStatus,
}: BookingDetailsContentProps) => {
  if (!booking) return null;

  const statusStyle = chipColors[booking.status ?? ""] ?? {
    backgroundColor: "#E2E8F0",
    activeBackgroundColor: "#CBD5E1",
    color: "#334155",
  };

  return (
    <Box sx={{ width: { xs: "100%", sm: 420 } }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 2 }}
      >
        <Typography sx={{ fontSize: "1.1rem", fontWeight: 900 }}>
          Booking Details
        </Typography>

        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Stack>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
        >
          <Typography
            sx={{
              fontWeight: 900,
              color: "#0F172A",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {booking.service_name}
          </Typography>

          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: "999px",
              backgroundColor: statusStyle.backgroundColor,
              border: `1px solid ${statusStyle.activeBackgroundColor}`,
              color: statusStyle.color,
              fontSize: "0.75rem",
              fontWeight: 800,
              textTransform: "capitalize",
              whiteSpace: "nowrap",
            }}
          >
            {booking.status}
          </Box>
        </Stack>
      </Box>

      <Divider />

      <Stack spacing={2.5} sx={{ p: 2 }}>
        <Box>
          <Typography sx={{ mb: 1, fontWeight: 900, color: "#0F172A" }}>
            Customer:
          </Typography>

          <Stack spacing={0.5}>
            <Typography sx={{ fontWeight: 700 }}>
              {booking.contact_detail_full_name}
            </Typography>

            <Typography sx={{ color: "#64748B" }}>
              {booking.contact_detail_phone_number}
            </Typography>

            <Typography sx={{ color: "#64748B" }}>
              {booking.contact_detail_email || "-"}
            </Typography>
          </Stack>
        </Box>

        <Box>
          <Typography sx={{ mb: 1.5, fontWeight: 900, color: "#0F172A" }}>
            Event Details
          </Typography>

          <Stack spacing={1.2}>
            <DetailRow label="Date" value={formatDate(booking.event_date)} />
            <DetailRow
              label="Time"
              value={
                booking.event_time && booking.event_end_time
                  ? `${booking.event_time} - ${booking.event_end_time}`
                  : booking.event_time
              }
            />
            <DetailRow label="Location" value={booking.location} />
            <DetailRow label="Guests" value={booking.guest_numbers} />
          </Stack>
        </Box>

        <Box>
          <Typography sx={{ mb: 1.5, fontWeight: 900, color: "#0F172A" }}>
            Payment
          </Typography>

          <Stack spacing={1.2}>
            <DetailRow label="Total" value={formatPrice(booking.total_price)} />
            <DetailRow label="Payment" value={booking.payment_option} />
          </Stack>
        </Box>

        <Stack spacing={1.2} sx={{ pt: 1 }}>
          {booking.status === "PENDING" && (
            <>
              <Button
                onClick={() =>
                  handleUpdateBookingStatus(booking.id, "CONFIRMED")
                }
                variant="contained"
                fullWidth
              >
                Confirme
              </Button>

              <Button
                onClick={() =>
                  handleUpdateBookingStatus(booking.id, "REJECTED")
                }
                variant="outlined"
                color="error"
                fullWidth
              >
                Reject
              </Button>
            </>
          )}

          <Button
            variant="text"
            fullWidth
            onClick={() => {
              window.location.href = `/provider/bookings/${booking.id}/preview`;
            }}
          >
            View full review page
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default function BookingCalendarView({
  search,
  status,
}: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar | null>(null);

  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const [bookingParams, setBookingParams] = useState<ProviderBookingListParams>(
    {},
  );

  const { data: bookingResponse, refetch } =
    useGetProviderBookingList(bookingParams);

  const { mutate: updateBookingStatus, isPending: isUpdateBookingStatus } =
    useUpdateProviderBookingStatus();

  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    setBookingParams((prev) => ({
      ...prev,
      search: search.trim() || undefined,
      status: status === "ALL" ? undefined : status,
    }));
  }, [status, search]);

  const events = bookingResponse?.results.map((booking) => {
    const title = booking.service_name || booking.customer_name || "Booking";

    const start = `${booking.event_date}T${booking.event_time}`;
    const end = `${booking.event_date}T${booking.event_end_time}`;

    return {
      id: String(booking.id),
      title,
      start,
      end,

      extendedProps: {
        status: booking.status,
        contact_detail_full_name: booking.customer_name,
        contact_detail_phone_number: booking.contact_detail_phone_number,
        contact_detail_email: booking.contact_detail_email,
        service_name: booking.service_name,
        category_name: booking.category_name,
        event_date: booking.event_date,
        event_time: booking.event_time,
        event_end_time: booking.event_end_time,
        location: booking.location,
        guest_numbers: booking.guest_numbers,
        total_price: booking.total_price,
        payment_type: booking.payment_option,
        id: booking.id,
      },
    };
  });

  const handleDatesSet = (startDate: Date, endDate: Date) => {
    const start_date = format(startDate, "yyyy-MM-dd");
    const end_date = format(endDate, "yyyy-MM-dd");

    setBookingParams((prev) => ({
      ...prev,
      start_date,
      end_date,
    }));
  };

  const handleCloseDetails = () => {
    setSelectedBooking(null);
  };

  const handleUpdateBookingStatus = (
    bookingId: string,
    status: "CONFIRMED" | "REJECTED",
  ) => {
    updateBookingStatus(
      { bookingId, status },
      {
        onSuccess: () => {
          handleCloseDetails();
          showSnackbar("Status updated successfully", "success");
          refetch();
        },
        onError: (error: any) => {
          showSnackbar(extractApiError(error), "error");
        },
      },
    );
  };

  return (
    <Box sx={bookingCalendarStyles}>
      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <Box sx={{ minWidth: { xs: 760, md: "100%" } }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            ref={calendarRef}
            initialView="dayGridMonth"
            initialDate={new Date()}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek",
            }}
            datesSet={(dateSet) => handleDatesSet(dateSet.start, dateSet.end)}
            buttonText={{
              today: "Today",
              month: "Month",
              week: "Week",
            }}
            events={events ?? []}
            eventContent={BookingEventContent}
            height="auto"
            nowIndicator
            eventDisplay="block"
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            slotDuration="00:30:00"
            dayCellContent={DayCellContent}
            dayMaxEvents={1}
            fixedWeekCount={false}
            eventClick={(info) => {
              setSelectedBooking(info.event.extendedProps as Booking);
            }}
          />
        </Box>
      </Box>

      {isSmUp ? (
        <Drawer
          anchor="right"
          open={Boolean(selectedBooking)}
          onClose={handleCloseDetails}
          PaperProps={{
            sx: {
              width: 420,
              maxWidth: "100vw",
            },
          }}
        >
          <BookingDetailsContent
            booking={selectedBooking}
            onClose={handleCloseDetails}
            handleUpdateBookingStatus={handleUpdateBookingStatus}
          />
        </Drawer>
      ) : (
        <Dialog
          open={Boolean(selectedBooking)}
          onClose={handleCloseDetails}
          fullWidth
          maxWidth="xs"
          PaperProps={{
            sx: {
              borderRadius: 3,
            },
          }}
        >
          <BookingDetailsContent
            booking={selectedBooking}
            onClose={handleCloseDetails}
            handleUpdateBookingStatus={handleUpdateBookingStatus}
          />
        </Dialog>
      )}
    </Box>
  );
}
