"use client";

import { Box, Card, CircularProgress, Typography } from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type {
  EventContentArg,
  DayCellContentArg,
  DatesSetArg,
} from "@fullcalendar/core";
import { chipColors } from "@/components/common/statusFilterChips/statusFilterChips";
import { bookingCalendarStyles } from "./bookingCalendar.styles";
import { useEffect, useRef, useState } from "react";
import { useGetProviderBookingList } from "@/hooks/booking";
import { ProviderBookingListParams } from "@/services/provider/booking";
import { format } from "date-fns";

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
  const startTime = event.extendedProps.start_time;
  const endTime = event.extendedProps.end_time;

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

type CalendarViewProps = {
  search: string;
  status: string;
};

export default function BookingCalendarView({
  search,
  status,
}: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar | null>(null);

  const [bookingParams, setBookingParams] = useState<ProviderBookingListParams>(
    {},
  );

  const { data: bookingResponse, isLoading: isBookingLoading } =
    useGetProviderBookingList(bookingParams);

  useEffect(() => {
    setBookingParams((prev) => ({
      ...prev,
      search: search.trim() || undefined,
      status: status === "ALL" ? undefined : status,
    }));
  }, [status, search]);

  // useEffect(() => {
  //   const calendarApi = calendarRef.current?.getApi();

  //   if (!calendarApi) return;

  //   const currentStart = calendarApi.view.currentStart;
  //   const currentEnd = calendarApi.view.currentEnd;

  //   handleDatesSet(currentStart, currentEnd);
  // }, []);

  const events = bookingResponse?.results.map((booking) => {
    const title =
      booking.service_name ||
      booking.customer_name ||
      booking.service_name ||
      "Booking";

    const start = `${booking.event_date}T${booking.event_time}`;
    const end = `${booking.event_date}T${booking.event_end_time}`;

    return {
      id: String(booking.id),
      title,
      start,
      end,

      extendedProps: {
        status: booking.status,
        customer_name: booking.customer_name,
        service_name: booking.service_name,
        category_name: booking.category_name,
        booking_date: booking.event_date,
        start_time: booking.event_time,
        end_time: booking.event_end_time,
      },
    };
  });

  const handleDatesSet = (startDate: Date, endDate: Date) => {
    const start_date = format(startDate, "yyyy-MM-dd");
    const end_date = format(endDate, "yyyy-MM-dd");

    setBookingParams((prev) => ({
      ...prev,
      start_date: start_date,
      end_date: end_date,
    }));
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
            events={events}
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
              console.log("Clicked booking:", info.event.id);
              console.log("Booking data:", info.event.extendedProps);
            }}
            dateClick={(info) => {
              console.log("Clicked date:", info.dateStr);
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
