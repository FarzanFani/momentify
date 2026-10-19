"use client";

import FormDateCalendar from "@/components/common/datePicker/DateCalnedar";
import InputField from "@/components/common/input/InputField";
import { getStatusChip } from "@/components/common/statusChip/statusChip";
import type {
  PackageBooking,
  PackageScheduleEntry,
} from "@/services/customer/packageBooking";
import {
  combineDateAndTime,
  formatDateTime,
  formatDuration,
  formatPrice,
} from "@/utils/helperFunctions";
import { INSTALLMENT_INTERVAL_LABEL } from "@/utils/packagePricing";
import { EventAvailable, EventBusy } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";

export const cardSx = {
  borderRadius: 4,
  border: "1px solid rgba(11, 61, 145, 0.12)",
  boxShadow: "0 14px 40px rgba(7, 42, 99, 0.08)",
};

export function getPackagePaymentLabel(booking: PackageBooking) {
  if (booking.payment_option === "DEPOSIT" && booking.deposit_amount) {
    return `Deposit of ${formatPrice(Number(booking.deposit_amount))}`;
  }
  if (booking.payment_option === "INSTALLMENTS" && booking.installment_amount) {
    const interval =
      INSTALLMENT_INTERVAL_LABEL[booking.installment_interval ?? ""] ??
      booking.installment_interval;
    return `${booking.installment_count} × ${formatPrice(Number(booking.installment_amount))} ${interval}`;
  }
  return "Full payment";
}

export function getScheduleLabel(booking: PackageBooking) {
  if (booking.unscheduled_count === 0) return "All services scheduled";
  const count = `${booking.unscheduled_count} service${booking.unscheduled_count === 1 ? "" : "s"} to schedule`;
  if (booking.is_schedule_overdue) return `${count} · deadline passed`;
  if (booking.schedule_deadline) {
    return `${count} by ${formatDateTime(booking.schedule_deadline)}`;
  }
  return count;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Box display="flex" justifyContent="space-between" gap={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700} textAlign="right">
        {value}
      </Typography>
    </Box>
  );
}

export function PackageBookingSummaryCard({
  booking,
}: {
  booking: PackageBooking;
}) {
  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={1.25}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={900} color="primary.main">
              Summary
            </Typography>
            {getStatusChip(booking.status)}
          </Box>
          <Row label="Package" value={formatPrice(Number(booking.package_price))} />
          {Number(booking.extra_guests_price) > 0 && (
            <Row
              label="Extra guests"
              value={`+ ${formatPrice(Number(booking.extra_guests_price))}`}
            />
          )}
          {Number(booking.addons_price) > 0 && (
            <Row
              label="Add-ons"
              value={`+ ${formatPrice(Number(booking.addons_price))}`}
            />
          )}
          <Divider />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography fontWeight={900}>Total</Typography>
            <Typography variant="h5" fontWeight={900} color="primary.main">
              {formatPrice(Number(booking.total_price))}
            </Typography>
          </Box>
          <Divider />
          <Row label="Payment" value={getPackagePaymentLabel(booking)} />
          <Row label="Guests" value={String(booking.guest_numbers)} />
          {booking.location && <Row label="Location" value={booking.location} />}
          <Row label="Contact" value={booking.contact_detail_full_name} />
          <Row label="Email" value={booking.contact_detail_email} />
          <Row label="Phone" value={booking.contact_detail_phone_number} />
          <Row label="Booked on" value={formatDateTime(booking.created_at)} />
          {booking.special_request && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Special request
              </Typography>
              <Typography variant="body2">{booking.special_request}</Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

type SlotInput = { date: string; time: string };

export function PackageBookingServices({
  booking,
  canSchedule = false,
  isScheduling = false,
  onSchedule,
}: {
  booking: PackageBooking;
  canSchedule?: boolean;
  isScheduling?: boolean;
  onSchedule?: (schedule: PackageScheduleEntry[]) => void;
}) {
  const [slots, setSlots] = useState<Record<string, SlotInput>>({});

  const setSlot = (itemId: string, patch: Partial<SlotInput>) =>
    setSlots((current) => ({
      ...current,
      [itemId]: { ...(current[itemId] ?? { date: "", time: "" }), ...patch },
    }));

  const readyEntries = Object.entries(slots)
    .filter(([, slot]) => slot.date && slot.time)
    .map(([item, slot]) => ({
      item,
      starts_at: combineDateAndTime(slot.date, slot.time),
    }));

  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={900} color="primary.main">
              Services
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getScheduleLabel(booking)}
            </Typography>
          </Box>

          {booking.is_schedule_overdue && (
            <Alert severity="warning">
              The scheduling deadline has passed. Remaining services must be
              arranged directly with {booking.company_name}.
            </Alert>
          )}

          {booking.items.map((item) => (
            <Box
              key={item.id}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid rgba(11, 61, 145, 0.1)",
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                gap={1}
                flexWrap="wrap"
              >
                <Box>
                  <Typography fontWeight={800}>
                    {item.quantity > 1
                      ? `${item.quantity} × ${item.service_name}`
                      : item.service_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {[
                      item.service_category_name,
                      formatDuration(item.duration_minutes),
                      formatPrice(Number(item.line_total)),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  {item.is_addon && (
                    <Chip
                      label="Add-on"
                      size="small"
                      sx={{ fontWeight: 700, backgroundColor: "rgba(201, 162, 39, 0.18)" }}
                    />
                  )}
                  {item.booking_status && getStatusChip(item.booking_status)}
                </Stack>
              </Box>

              {item.starts_at ? (
                <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                  <EventAvailable sx={{ color: "success.main", fontSize: 20 }} />
                  <Typography variant="body2" fontWeight={700}>
                    {formatDateTime(item.starts_at)}
                  </Typography>
                </Stack>
              ) : canSchedule ? (
                <Grid container spacing={2} mt={0.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormDateCalendar
                      label="Date"
                      value={slots[item.id]?.date ?? ""}
                      onChange={(value) => setSlot(item.id, { date: value ?? "" })}
                      disablePast
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InputField
                      label="Start time"
                      type="time"
                      value={slots[item.id]?.time ?? ""}
                      onChange={(value) =>
                        setSlot(item.id, { time: String(value ?? "") })
                      }
                    />
                  </Grid>
                </Grid>
              ) : (
                <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                  <EventBusy sx={{ color: "text.disabled", fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Not scheduled yet
                  </Typography>
                </Stack>
              )}
            </Box>
          ))}

          {canSchedule && onSchedule && booking.unscheduled_count > 0 && (
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                disabled={readyEntries.length === 0 || isScheduling}
                onClick={() => onSchedule(readyEntries)}
                sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2 }}
              >
                {isScheduling
                  ? "Saving..."
                  : `Save ${readyEntries.length || ""} date${readyEntries.length === 1 ? "" : "s"}`}
              </Button>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
