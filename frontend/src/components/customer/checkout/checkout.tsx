"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  AccessTimeRounded,
  ArrowBackRounded,
  BusinessRounded,
  CheckCircleRounded,
  EventRounded,
  GroupsRounded,
  LocationOnRounded,
  NotesRounded,
  PaymentRounded,
  PersonRounded,
  ReceiptLongRounded,
} from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";

import { formatDuration, formatPrice } from "@/utils/helperFunctions";
import { useGetSinglePublicService } from "@/hooks/service";
import NoServiceSelectedView from "./noService";
import CheckoutUnavailableView from "./checkoutUnavalable";
import CheckoutPageSkeleton from "./checkoutSkeleton";
import InputField from "@/components/common/input/InputField";
import { Controller, useForm } from "react-hook-form";
import SelectDropdown from "@/components/common/dropdown/Dropdown";
import { DropdownOptionItem } from "@/types/general";
import { useAppSelector } from "@/store/hook";
import { CustomerBookingPayload } from "@/services/customer/booking";
import { usePostCustomerBooking } from "@/hooks/booking";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { extractApiError } from "@/utils/extractApiError";

const paymentOptions: DropdownOptionItem[] = [
  { value: "REQUEST_BOOKING_FIRST", label: "Request booking first" },
  { value: "PAY_DEPOSIT_LATER", label: "Pay deposit later" },
  { value: "PAY_FULL_AMOUNT_LATER", label: "Pay full amount later" },
  { value: "PAY_FULL_AMOUNT_NOW", label: "Pay full amount now" },
  { value: "PAY_DEPOSIT_NOW", label: "Pay deposite now" },
];

export default function CustomerCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAppSelector((state) => state.auth.user);

  const serviceId = searchParams.get("serviceId");

  if (!serviceId) {
    return <NoServiceSelectedView />;
  }

  const {
    data: service,
    isLoading,
    isError,
  } = useGetSinglePublicService(serviceId || "");

  const [useRegisterContactInfo, setRegisterContactInfo] = useState(false);
  const { mutate: createBooking, isPending: isBookingCreateLoading } =
    usePostCustomerBooking();
  const { showSnackbar } = useSnackbar();

  const { control, handleSubmit, setValue, clearErrors, formState } =
    useForm<CustomerBookingPayload>({
      mode: "onChange",
      defaultValues: {
        payment_option: "REQUEST_BOOKING_FIRST",
      },
    });

  const handleSubmitBooking = (data: CustomerBookingPayload) => {
    if (!service) return;
    createBooking(
      { ...data, service: service.id },
      {
        onSuccess: (data) => {
          showSnackbar("Checkout Succesfull", "success");
          router.push(`/customer/booking/${data.id}/preview`);
        },
        onError: (error: any) => {
          showSnackbar(extractApiError(error), "error");
        },
      },
    );
  };

  useEffect(() => {
    if (useRegisterContactInfo) {
      setValue("contact_detail_email", user?.email ?? "");
      clearErrors("contact_detail_email");
      setValue(
        "contact_detail_full_name",
        `${user?.first_name} ${user?.last_name}`,
      );
      clearErrors("contact_detail_full_name");
      setValue("contact_detail_phone_number", user?.phone_number ?? "");
      clearErrors("contact_detail_phone_number");
    } else {
      setValue("contact_detail_email", "");
      clearErrors("contact_detail_email");
      setValue("contact_detail_full_name", "");
      clearErrors("contact_detail_full_name");
      setValue("contact_detail_phone_number", "");
      clearErrors("contact_detail_phone_number");
    }
  }, [
    useRegisterContactInfo,
    user?.email,
    user?.first_name,
    user?.last_name,
    user?.phone_number,
    setValue,
    clearErrors,
  ]);

  if (isLoading) {
    return <CheckoutPageSkeleton />;
  }

  if (isError || !service) {
    return <CheckoutUnavailableView />;
  }

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
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
        >
          <Box>
            <Typography variant="h4" fontWeight={900} color="primary.main">
              Checkout
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Review the service and send your booking request.
            </Typography>
          </Box>

          <Box
            display={"flex"}
            justifyContent={"flex-end"}
            width={{ xs: "100%", sm: "auto" }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackRounded />}
              onClick={() => router.push(`/services/${service.id}/preview`)}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.1,
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
              Back to Service
            </Button>
          </Box>
        </Stack>

        <Grid container spacing={3} alignItems="flex-start">
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={3}>
              <CheckoutSectionCard
                icon={<EventRounded />}
                title="Event details"
                subtitle="Tell the provider when and where you need this service."
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InputField
                      label="Event Type"
                      value={service.category_name}
                      onChange={() => {}}
                      disabled
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      control={control}
                      name="event_date"
                      rules={{ required: "Event date is required" }}
                      render={({ field, fieldState }) => (
                        <InputField
                          label="Event Date"
                          value={field.value}
                          onChange={field.onChange}
                          error={fieldState.invalid}
                          helperText={fieldState.error?.message}
                          type="date"
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      control={control}
                      name="event_time"
                      rules={{ required: "Start time is required" }}
                      render={({ field, fieldState }) => (
                        <InputField
                          label="Start time"
                          value={field.value}
                          onChange={field.onChange}
                          error={fieldState.invalid}
                          helperText={fieldState.error?.message}
                          type="time"
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      control={control}
                      name="guest_numbers"
                      rules={{
                        required: "Guest Number is required",
                        min: { value: 1, message: "Minimum allow number is 1" },
                        max: {
                          value: service.max_capacity,
                          message: `Maximum allow number is ${service.max_capacity}`,
                        },
                      }}
                      render={({ field, fieldState }) => (
                        <InputField
                          label="Number of Guests"
                          value={field.value}
                          onChange={field.onChange}
                          type="number"
                          placeholder="Number of guests"
                          error={fieldState.invalid}
                          helperText={
                            fieldState.invalid
                              ? fieldState.error?.message
                              : `Maximum capacity: ${service.max_capacity} guests`
                          }
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }} mt={"-20px"}>
                    <Controller
                      control={control}
                      name="location"
                      render={({ field }) => (
                        <InputField
                          label="Location"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Event vanue name, address, city or postcode"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CheckoutSectionCard>

              <CheckoutSectionCard
                icon={<PersonRounded />}
                title="Contact details"
                subtitle="The provider may use these details to confirm your request."
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      value={useRegisterContactInfo}
                      onChange={() =>
                        setRegisterContactInfo(!useRegisterContactInfo)
                      }
                    />
                  }
                  label="Use my Registration contact details"
                />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      control={control}
                      name="contact_detail_full_name"
                      rules={{ required: "Full name is required" }}
                      render={({ field, fieldState }) => (
                        <InputField
                          label="Full name"
                          value={field.value}
                          onChange={field.onChange}
                          error={fieldState.invalid}
                          helperText={fieldState.error?.message}
                          placeholder="Full name"
                          disabled={useRegisterContactInfo}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      control={control}
                      name="contact_detail_phone_number"
                      rules={{ required: "Phone number is required" }}
                      render={({ field, fieldState }) => (
                        <InputField
                          label="Phone number"
                          value={field.value}
                          onChange={field.onChange}
                          error={fieldState.invalid}
                          helperText={fieldState.error?.message}
                          placeholder="eg. 011263245"
                          disabled={useRegisterContactInfo}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Controller
                      control={control}
                      name="contact_detail_email"
                      rules={{ required: "Email is required" }}
                      render={({ field, fieldState }) => (
                        <InputField
                          label="Email"
                          value={field.value}
                          onChange={field.onChange}
                          error={fieldState.invalid}
                          helperText={fieldState.error?.message}
                          placeholder="eg. someone@example.com"
                          disabled={useRegisterContactInfo}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CheckoutSectionCard>

              <CheckoutSectionCard
                icon={<NotesRounded />}
                title="Special requests"
                subtitle="Share anything important the provider should know."
              >
                <Controller
                  control={control}
                  name="special_request"
                  render={({ field }) => (
                    <InputField
                      label="Special Request"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Example: setup instructions, cultural requirements, accessibility needs, preferred contact method..."
                      multiline
                      rows={5}
                    />
                  )}
                />
              </CheckoutSectionCard>

              <CheckoutSectionCard
                icon={<PaymentRounded />}
                title="Payment option"
                subtitle="For event services, the provider may need to confirm availability first."
              >
                <Controller
                  control={control}
                  name="payment_option"
                  rules={{ required: "Payment option is required" }}
                  render={({ field, fieldState }) => (
                    <SelectDropdown
                      options={paymentOptions}
                      label="Payment Option"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 3,
                    background:
                      "linear-gradient(135deg, rgba(11, 61, 145, 0.05) 0%, rgba(201, 162, 39, 0.1) 100%)",
                    border: "1px solid rgba(11, 61, 145, 0.1)",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7 }}
                  >
                    Your booking will be sent to the provider as a request. Once
                    the provider confirms availability, you can receive the next
                    steps for payment or deposit.
                  </Typography>
                </Box>
              </CheckoutSectionCard>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={2.5} sx={{ position: { lg: "sticky" }, top: 24 }}>
              <ServiceSummaryCard service={service} />

              <PriceSummaryCard service={service} />

              <Button
                fullWidth
                variant="contained"
                startIcon={<CheckCircleRounded />}
                disabled={!formState.isValid}
                onClick={handleSubmit(handleSubmitBooking)}
                sx={{
                  borderRadius: 3,
                  py: 1.35,
                  fontWeight: 900,
                  textTransform: "none",
                  color: "#fff",
                  background:
                    "linear-gradient(135deg, #0B3D91 0%, #2F5FB3 65%, #C9A227 100%)",
                  boxShadow: "0 12px 26px rgba(11, 61, 145, 0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #072a63 0%, #0B3D91 60%, #8C6A12 100%)",
                    boxShadow: "0 14px 30px rgba(11, 61, 145, 0.36)",
                  },
                  "&.Mui-disabled": {
                    color: "rgba(255,255,255,0.75)",
                    background:
                      "linear-gradient(135deg, rgba(11, 61, 145, 0.45) 0%, rgba(47, 95, 179, 0.4) 65%, rgba(201, 162, 39, 0.45) 100%)",
                  },
                }}
              >
                Request Booking
              </Button>

              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  textAlign: "center",
                  lineHeight: 1.6,
                }}
              >
                You are not charged at this stage. The provider will review your
                request and confirm availability.
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}

function CheckoutSectionCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        border: "1px solid rgba(11, 61, 145, 0.12)",
        boxShadow: "0 12px 32px rgba(7, 42, 99, 0.08)",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.5,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "primary.main",
                background:
                  "linear-gradient(135deg, rgba(11, 61, 145, 0.08) 0%, rgba(201, 162, 39, 0.16) 100%)",
                "& svg": {
                  fontSize: 24,
                },
              }}
            >
              {icon}
            </Box>

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
          </Stack>

          <Divider />

          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

function ServiceSummaryCard({ service }: { service: any }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid rgba(11, 61, 145, 0.12)",
        boxShadow: "0 14px 36px rgba(7, 42, 99, 0.1)",
      }}
    >
      <Box
        sx={{
          minHeight: 120,
          p: 2.5,
          color: "#fff",
          display: "flex",
          alignItems: "flex-end",
          background:
            "linear-gradient(135deg, #072a63 0%, #0B3D91 45%, #2F5FB3 72%, #C9A227 100%)",
        }}
      >
        <Stack spacing={1.2}>
          <Chip
            label={service.category_name}
            size="small"
            sx={{
              width: "fit-content",
              textTransform: "capitalize",
              fontWeight: 800,
              color: "#111",
              backgroundColor: "rgba(242, 214, 117, 0.95)",
            }}
          />

          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              lineHeight: 1.25,
            }}
          >
            {service.name}
          </Typography>
        </Stack>
      </Box>

      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <SummaryRow
            icon={<BusinessRounded />}
            label="Provider"
            value={service.company_name}
          />

          <SummaryRow
            icon={<AccessTimeRounded />}
            label="Duration"
            value={formatDuration(service.duration_minutes)}
          />

          <SummaryRow
            icon={<GroupsRounded />}
            label="Capacity"
            value={`Up to ${service.max_capacity} guests`}
          />

          <SummaryRow
            icon={<LocationOnRounded />}
            label="Location"
            value="Provided during booking"
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

function PriceSummaryCard({ service }: { service: any }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        border: "1px solid rgba(11, 61, 145, 0.12)",
        boxShadow: "0 12px 32px rgba(7, 42, 99, 0.08)",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "primary.main",
                background:
                  "linear-gradient(135deg, rgba(11, 61, 145, 0.08) 0%, rgba(201, 162, 39, 0.16) 100%)",
              }}
            >
              <ReceiptLongRounded />
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: "primary.main",
                  fontWeight: 900,
                }}
              >
                Price Summary
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Starting price for this service
              </Typography>
            </Box>
          </Stack>

          <Divider />

          <Stack spacing={1.2}>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">Service price</Typography>
              <Typography fontWeight={900}>
                {formatPrice(service.price)}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">Fees</Typography>
              <Typography fontWeight={900}>Calculated later</Typography>
            </Stack>
          </Stack>

          <Divider />

          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Typography
              sx={{
                color: "secondary.dark",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 0.7,
              }}
            >
              Starting total
            </Typography>

            <Typography
              variant="h5"
              sx={{
                color: "primary.main",
                fontWeight: 900,
              }}
            >
              {formatPrice(service.price)}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function SummaryRow({
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
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}
