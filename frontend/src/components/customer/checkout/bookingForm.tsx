"use client";

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
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { Control, Controller, FormState } from "react-hook-form";

import SelectDropdown from "@/components/common/dropdown/Dropdown";
import InputField from "@/components/common/input/InputField";
import { CustomerBookingPayload } from "@/services/customer/booking";
import { CompanyServices } from "@/services/provider/services";
import { DropdownOptionItem } from "@/types/general";
import { formatDuration, formatPrice } from "@/utils/helperFunctions";

export type CustomerBookingFormValues = Omit<
  CustomerBookingPayload,
  "service" | "starts_at"
> & {
  service?: string;
  start_date: string;
  start_time: string;
};

export const paymentOptions: DropdownOptionItem[] = [
  { value: "REQUEST_BOOKING_FIRST", label: "Request booking first" },
  { value: "PAY_DEPOSIT_LATER", label: "Pay deposit later" },
  { value: "PAY_FULL_AMOUNT_LATER", label: "Pay full amount later" },
  { value: "PAY_FULL_AMOUNT_NOW", label: "Pay full amount now" },
  { value: "PAY_DEPOSIT_NOW", label: "Pay deposite now" },
];

type CustomerBookingFormFieldsProps = {
  control: Control<CustomerBookingFormValues>;
  service: CompanyServices;
  useRegisterContactInfo?: boolean;
  onUseRegisterContactInfoChange?: (value: boolean) => void;
};

export function CustomerBookingFormFields({
  control,
  service,
  useRegisterContactInfo = false,
  onUseRegisterContactInfoChange,
}: CustomerBookingFormFieldsProps) {
  return (
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
              name="start_date"
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
              name="start_time"
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
        {onUseRegisterContactInfoChange && (
          <FormControlLabel
            control={
              <Checkbox
                checked={useRegisterContactInfo}
                onChange={(_, checked) =>
                  onUseRegisterContactInfoChange(checked)
                }
              />
            }
            label="Use my Registration contact details"
          />
        )}

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
            Your booking will be sent to the provider as a request. Once the
            provider confirms availability, you can receive the next steps for
            payment or deposit.
          </Typography>
        </Box>
      </CheckoutSectionCard>
    </Stack>
  );
}

type CustomerBookingPageLayoutProps = CustomerBookingFormFieldsProps & {
  title: string;
  subtitle: string;
  backLabel: string;
  onBack: () => void;
  formState: FormState<CustomerBookingFormValues>;
  onSubmit: () => void;
  submitLabel: string;
  submittingLabel?: string;
  isSubmitting?: boolean;
  submitIcon?: React.ReactNode;
  footerNote: string;
};

export function CustomerBookingPageLayout({
  title,
  subtitle,
  backLabel,
  onBack,
  control,
  service,
  formState,
  onSubmit,
  submitLabel,
  submittingLabel,
  isSubmitting = false,
  submitIcon = <CheckCircleRounded />,
  footerNote,
  useRegisterContactInfo,
  onUseRegisterContactInfoChange,
}: CustomerBookingPageLayoutProps) {
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
              {title}
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
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
              onClick={onBack}
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
              {backLabel}
            </Button>
          </Box>
        </Stack>

        <Grid container spacing={3} alignItems="flex-start">
          <Grid size={{ xs: 12, lg: 8 }}>
            <CustomerBookingFormFields
              control={control}
              service={service}
              useRegisterContactInfo={useRegisterContactInfo}
              onUseRegisterContactInfoChange={onUseRegisterContactInfoChange}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={2.5} sx={{ position: { lg: "sticky" }, top: 24 }}>
              <ServiceSummaryCard service={service} />

              <PriceSummaryCard service={service} />

              <Button
                fullWidth
                variant="contained"
                startIcon={submitIcon}
                disabled={!formState.isValid || isSubmitting}
                onClick={onSubmit}
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
                {isSubmitting && submittingLabel ? submittingLabel : submitLabel}
              </Button>

              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  textAlign: "center",
                  lineHeight: 1.6,
                }}
              >
                {footerNote}
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

function ServiceSummaryCard({ service }: { service: CompanyServices }) {
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

function PriceSummaryCard({ service }: { service: CompanyServices }) {
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
