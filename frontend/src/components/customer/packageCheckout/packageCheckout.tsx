"use client";

import Breadcrumb from "@/components/common/breadcrumb/Breadcrumb";
import FormDateCalendar from "@/components/common/datePicker/DateCalnedar";
import InputField from "@/components/common/input/InputField";
import { cardSx } from "@/components/common/packageBooking/packageBookingParts";
import { PackageUnavailableView } from "@/components/provider/packages/packageDetail/packageDetail";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { usePostPackageBooking } from "@/hooks/packageBooking";
import {
  useGetSinglePublicPackage,
  usePostPackageCalculatePrice,
} from "@/hooks/service";
import type { PackagePaymentOption } from "@/services/customer/packageBooking";
import type { ServicePackage } from "@/services/provider/services";
import { useAppSelector } from "@/store/hook";
import type { ApiResponse } from "@/types/general";
import { extractApiError } from "@/utils/extractApiError";
import { combineDateAndTime, formatPrice } from "@/utils/helperFunctions";
import { INSTALLMENT_INTERVAL_LABEL } from "@/utils/packagePricing";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import type { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type SlotInput = { date: string; time: string };

export default function PackageCheckoutPage({ uuid }: { uuid: string }) {
  const { data: servicePackage, isLoading } = useGetSinglePublicPackage(uuid);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  return servicePackage ? (
    <PackageCheckoutForm servicePackage={servicePackage} />
  ) : (
    <PackageUnavailableView />
  );
}

function PackageCheckoutForm({
  servicePackage,
}: {
  servicePackage: ServicePackage;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSnackbar } = useSnackbar();
  const user = useAppSelector((state) => state.auth.user);

  const optionalIds = new Set(
    servicePackage.services.filter((item) => !item.required).map((i) => i.id),
  );

  const [guests, setGuests] = useState(
    searchParams.get("guests") ?? String(servicePackage.included_guests),
  );
  const [addons, setAddons] = useState<string[]>(
    (searchParams.get("addons") ?? "")
      .split(",")
      .filter((id) => optionalIds.has(id)),
  );
  const [slots, setSlots] = useState<Record<string, SlotInput>>({});
  const [paymentOption, setPaymentOption] = useState<PackagePaymentOption>(
    servicePackage.allow_full_payment
      ? "FULL"
      : servicePackage.deposit_percentage
        ? "DEPOSIT"
        : "INSTALLMENTS",
  );
  const [contact, setContact] = useState({
    contact_detail_full_name:
      `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim(),
    contact_detail_email: user?.email ?? "",
    contact_detail_phone_number: user?.phone_number ?? "",
    location: "",
    special_request: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const { mutate: calculatePrice, data: calculation } =
    usePostPackageCalculatePrice();
  const { mutate: bookPackage, isPending: isBooking } = usePostPackageBooking();

  const guestCount = Number(guests);
  const guestsValid =
    Number.isInteger(guestCount) &&
    guestCount >= 1 &&
    (servicePackage.max_guests === null || guestCount <= servicePackage.max_guests);

  useEffect(() => {
    if (!guestsValid) return;
    const timeout = setTimeout(
      () =>
        calculatePrice({
          packageId: servicePackage.id,
          guest_count: guestCount,
          addons,
        }),
      300,
    );
    return () => clearTimeout(timeout);
  }, [guestCount, guestsValid, addons, servicePackage.id, calculatePrice]);

  const selectedItems = servicePackage.services.filter(
    (item) => item.required || addons.includes(item.id),
  );
  const total = Number(calculation?.total_price ?? servicePackage.total_price);
  const canScheduleLater = servicePackage.allow_scheduling_late;

  const setSlot = (itemId: string, patch: Partial<SlotInput>) =>
    setSlots((current) => ({
      ...current,
      [itemId]: { ...(current[itemId] ?? { date: "", time: "" }), ...patch },
    }));

  const isSlotComplete = (itemId: string) =>
    Boolean(slots[itemId]?.date && slots[itemId]?.time);
  const isSlotPartial = (itemId: string) =>
    Boolean(slots[itemId]?.date) !== Boolean(slots[itemId]?.time);

  const missingSlots = selectedItems.filter(
    (item) =>
      isSlotPartial(item.id) || (!canScheduleLater && !isSlotComplete(item.id)),
  );
  const contactMissing =
    !contact.contact_detail_full_name ||
    !contact.contact_detail_email ||
    !contact.contact_detail_phone_number;

  const paymentChoices = [
    servicePackage.allow_full_payment && {
      value: "FULL" as const,
      label: `Pay in full · ${formatPrice(total)}`,
    },
    servicePackage.deposit_percentage && {
      value: "DEPOSIT" as const,
      label: `${Number(servicePackage.deposit_percentage)}% deposit · ${formatPrice(
        (total * Number(servicePackage.deposit_percentage)) / 100,
      )}`,
    },
    servicePackage.installment_count && {
      value: "INSTALLMENTS" as const,
      label: `${servicePackage.installment_count} installments of ${formatPrice(
        total / Number(servicePackage.installment_count),
      )} ${INSTALLMENT_INTERVAL_LABEL[servicePackage.installment_interval ?? ""] ?? ""}`,
    },
  ].filter(Boolean) as { value: PackagePaymentOption; label: string }[];

  const handleSubmit = () => {
    setSubmitted(true);
    if (!guestsValid || missingSlots.length > 0 || contactMissing) return;

    bookPackage(
      {
        package: servicePackage.id,
        guest_numbers: guestCount,
        addons,
        payment_option: paymentOption,
        schedule: selectedItems
          .filter((item) => isSlotComplete(item.id))
          .map((item) => ({
            item: item.id,
            starts_at: combineDateAndTime(
              slots[item.id].date,
              slots[item.id].time,
            ),
          })),
        ...contact,
      },
      {
        onSuccess(booking) {
          showSnackbar("Package booked", "success");
          router.push(`/customer/package-bookings/${booking.id}`);
        },
        onError(error) {
          showSnackbar(
            extractApiError(error as AxiosError<ApiResponse<null>>),
            "error",
          );
        },
      },
    );
  };

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      <Breadcrumb
        items={[
          { label: "Packages", href: "/packages" },
          { label: servicePackage.name, href: `/packages/${servicePackage.id}` },
          { label: "Checkout" },
        ]}
      />
      <Typography variant="h4" fontWeight={800} color="primary.main" mt={1}>
        {`Book ${servicePackage.name}`}
      </Typography>

      <Grid container spacing={3} mt={1}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={3}>
            <Card sx={cardSx}>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h6" fontWeight={900} color="primary.main">
                      Dates
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {canScheduleLater
                        ? `Each service has its own date. You can leave dates empty and pick them within ${servicePackage.scheduling_deadline_days} days after booking.`
                        : "Each service has its own date. Pick a date and time for every service."}
                    </Typography>
                  </Box>

                  {selectedItems.map((item) => {
                    const showError =
                      submitted &&
                      (isSlotPartial(item.id) ||
                        (!canScheduleLater && !isSlotComplete(item.id)));
                    return (
                      <Box
                        key={item.id}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border: "1px solid",
                          borderColor: showError
                            ? "error.main"
                            : "rgba(11, 61, 145, 0.1)",
                        }}
                      >
                        <Typography fontWeight={800}>
                          {item.quantity > 1
                            ? `${item.quantity} × ${item.service_name}`
                            : item.service_name}
                          {!item.required && " (add-on)"}
                        </Typography>
                        <Grid container spacing={2} mt={0.5}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <FormDateCalendar
                              label="Date"
                              value={slots[item.id]?.date ?? ""}
                              onChange={(value) =>
                                setSlot(item.id, { date: value ?? "" })
                              }
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
                              error={showError}
                              helperText={
                                showError
                                  ? "Pick both a date and a time"
                                  : undefined
                              }
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>

            <Card sx={cardSx}>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight={900} color="primary.main">
                    Contact details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <InputField
                        label="Full name"
                        value={contact.contact_detail_full_name}
                        onChange={(value) =>
                          setContact({
                            ...contact,
                            contact_detail_full_name: String(value ?? ""),
                          })
                        }
                        error={submitted && !contact.contact_detail_full_name}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <InputField
                        label="Email"
                        type="email"
                        value={contact.contact_detail_email}
                        onChange={(value) =>
                          setContact({
                            ...contact,
                            contact_detail_email: String(value ?? ""),
                          })
                        }
                        error={submitted && !contact.contact_detail_email}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <InputField
                        label="Phone number"
                        value={contact.contact_detail_phone_number}
                        onChange={(value) =>
                          setContact({
                            ...contact,
                            contact_detail_phone_number: String(value ?? ""),
                          })
                        }
                        error={submitted && !contact.contact_detail_phone_number}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <InputField
                        label="Location"
                        placeholder="Event address (optional)"
                        value={contact.location}
                        onChange={(value) =>
                          setContact({ ...contact, location: String(value ?? "") })
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <InputField
                        label="Special request"
                        multiline
                        value={contact.special_request}
                        onChange={(value) =>
                          setContact({
                            ...contact,
                            special_request: String(value ?? ""),
                          })
                        }
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={cardSx}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <InputField
                  label="Number of guests"
                  type="number"
                  value={guests}
                  onChange={(value) => setGuests(String(value ?? ""))}
                  error={!guestsValid}
                  helperText={
                    servicePackage.max_guests
                      ? `Up to ${servicePackage.max_guests} guests`
                      : undefined
                  }
                />

                {optionalIds.size > 0 && (
                  <Box>
                    <Typography fontWeight={800}>Optional add-ons</Typography>
                    {servicePackage.services
                      .filter((item) => !item.required)
                      .map((item) => (
                        <FormControlLabel
                          key={item.id}
                          sx={{ display: "flex" }}
                          control={
                            <Checkbox
                              checked={addons.includes(item.id)}
                              onChange={(_, checked) =>
                                setAddons((current) =>
                                  checked
                                    ? [...current, item.id]
                                    : current.filter((id) => id !== item.id),
                                )
                              }
                            />
                          }
                          label={`${item.quantity > 1 ? `${item.quantity} × ` : ""}${item.service_name} (+${formatPrice(Number(item.line_total))})`}
                        />
                      ))}
                  </Box>
                )}

                <Divider />

                <Box>
                  <Typography fontWeight={800}>Payment</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Payment is arranged with the provider. Your choice is
                    recorded with the booking.
                  </Typography>
                  <RadioGroup
                    value={paymentOption}
                    onChange={(_, value) =>
                      setPaymentOption(value as PackagePaymentOption)
                    }
                  >
                    {paymentChoices.map((choice) => (
                      <FormControlLabel
                        key={choice.value}
                        value={choice.value}
                        control={<Radio />}
                        label={choice.label}
                      />
                    ))}
                  </RadioGroup>
                </Box>

                <Divider />

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={900}>Total</Typography>
                  <Typography variant="h5" fontWeight={900} color="primary.main">
                    {formatPrice(total)}
                  </Typography>
                </Box>

                {submitted && (missingSlots.length > 0 || contactMissing) && (
                  <Alert severity="error">
                    {contactMissing
                      ? "Fill in your contact details."
                      : "Complete the highlighted dates."}
                  </Alert>
                )}

                <Button
                  variant="contained"
                  size="large"
                  disabled={isBooking}
                  onClick={handleSubmit}
                  sx={{ textTransform: "none", fontWeight: 800, borderRadius: 3 }}
                >
                  {isBooking ? "Booking..." : "Book package"}
                </Button>
                <Typography variant="caption" color="text.secondary">
                  {servicePackage.company_name} approves the whole package. A
                  package booking cannot be cancelled once made.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
