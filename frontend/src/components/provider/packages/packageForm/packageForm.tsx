"use client";

import SelectDropdown from "@/components/common/dropdown/Dropdown";
import InputField from "@/components/common/input/InputField";
import { useGetProviderServicesTinyList } from "@/hooks/service";
import { ServicePackagesPayload } from "@/services/provider/services";
import { DropdownOptionItem } from "@/types/general";
import { formatPrice } from "@/utils/helperFunctions";
import {
  calculatePackageBreakdown,
  INSTALLMENT_INTERVAL_LABEL,
} from "@/utils/packagePricing";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useState } from "react";
import {
  Control,
  Controller,
  UseFormSetValue,
  useFieldArray,
  useWatch,
} from "react-hook-form";

const INSTALLMENT_INTERVAL_OPTIONS = [
  { label: "Weekly", value: "weekly" },
  { label: "Every two weeks", value: "biweekly" },
  { label: "Monthly", value: "monthly" },
];

const PRICING_METHOD_FIELD_LABEL: Record<string, string> = {
  fixed_price: "Fixed price",
  percentage_discount: "Percentage discount",
  fixed_discount: "Fixed discount",
};

const cardSx = {
  width: "90%",
  borderRadius: 3,
  mt: 2,
  border: "1px solid",
  borderColor: "divider",
};

type PackageFormProps = {
  control: Control<ServicePackagesPayload>;
  setValue: UseFormSetValue<ServicePackagesPayload>;
  companyOptions: DropdownOptionItem[];
  categoryOptions: DropdownOptionItem[];
  inEdit?: boolean;
  initialServiceOptions?: DropdownOptionItem[];
  initialDepositEnabled?: boolean;
  initialInstallmentEnabled?: boolean;
  coverPreview: string | null;
  onCoverChange: (file: File | null) => void;
};

export default function PackageForm({
  control,
  setValue,
  companyOptions,
  categoryOptions,
  inEdit = false,
  initialServiceOptions = [],
  initialDepositEnabled = false,
  initialInstallmentEnabled = false,
  coverPreview,
  onCoverChange,
}: PackageFormProps) {
  const [depositEnabled, setDepositEnabled] = useState(initialDepositEnabled);
  const [installmentEnabled, setInstallmentEnabled] = useState(
    initialInstallmentEnabled,
  );

  const company = useWatch({ control, name: "company" });
  const pricingMethod = useWatch({ control, name: "pricing_method" });
  const watchedServices = useWatch({ control, name: "services" }) ?? [];
  const fixedPrice = useWatch({ control, name: "fixed_price" });
  const fixedDiscount = useWatch({ control, name: "fixed_discount" });
  const percentageDiscount = useWatch({ control, name: "percentage_discount" });
  const installmentCount = useWatch({ control, name: "installment_count" });
  const installmentInterval = useWatch({
    control,
    name: "installment_interval",
  });
  const allowSchedulingLate = useWatch({
    control,
    name: "allow_scheduling_late",
  });

  const { data: services, isLoading: isServicesLoading } =
    useGetProviderServicesTinyList(company);

  const fetchedServiceOptions = (services ?? []).map((service) => ({
    label: service.category_name
      ? `${service.name} (${service.category_name})`
      : service.name,
    value: service.id,
  }));

  const serviceOptions = [
    ...initialServiceOptions.filter(
      (initialOption) =>
        !fetchedServiceOptions.some(
          (option) => option.value === initialOption.value,
        ),
    ),
    ...fetchedServiceOptions,
  ];

  const findService = (id: string) => services?.find((s) => s.id === id);

  const selectedCapacities = watchedServices
    .map((item) => findService(item.service)?.max_capacity)
    .filter((capacity): capacity is number => capacity !== undefined);
  const maxGuests =
    selectedCapacities.length > 0 ? Math.min(...selectedCapacities) : null;

  const breakdown = calculatePackageBreakdown({
    pricingMethod,
    lines: watchedServices,
    fixedPrice,
    fixedDiscount,
    percentageDiscount,
  });

  const installmentAmount =
    installmentEnabled && Number(installmentCount) >= 2
      ? breakdown.total / Number(installmentCount)
      : null;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "services",
  });

  return (
    <>
      {/* Package details */}
      <Card sx={{ ...cardSx, mt: 0 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={1}
            >
              <Typography variant="h5" fontWeight={600} color="primary.main">
                Package details
              </Typography>

              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(field.value)}
                        onChange={(_, checked) => field.onChange(checked)}
                      />
                    }
                    label={
                      field.value ? "Active · visible to customers" : "Inactive · hidden"
                    }
                  />
                )}
              />
            </Box>

            <Grid container spacing={2} width="100%">
              <Grid size={{ xs: 12, sm: 6 }} maxWidth="500px">
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Package name is required" }}
                  render={({ field, fieldState }) => (
                    <InputField
                      label="Package name"
                      placeholder="e.g. Golden Wedding Package"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      error={fieldState.invalid}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} maxWidth="500px">
                <Controller
                  name="company"
                  control={control}
                  rules={{ required: "Selecting a company is required" }}
                  render={({ field, fieldState }) => (
                    <SelectDropdown
                      label="Select company"
                      placeholder="Choose a company"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={companyOptions}
                      error={fieldState.error?.message}
                      disable={inEdit}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} maxWidth="500px">
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Selecting a category is required" }}
                  render={({ field, fieldState }) => (
                    <SelectDropdown
                      label="Listed under category"
                      placeholder="Choose a category"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={categoryOptions}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }} maxWidth="1100px">
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: "Description is required" }}
                  render={({ field, fieldState }) => (
                    <InputField
                      label="Description"
                      placeholder="Describe what's included in this package."
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      multiline
                      error={fieldState.invalid}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }} maxWidth="1100px">
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Cover image
                </Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                >
                  <Box
                    sx={{
                      width: 220,
                      height: 124,
                      borderRadius: 2,
                      border: "1px dashed",
                      borderColor: "divider",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(11, 61, 145, 0.04)",
                      color: "text.disabled",
                    }}
                  >
                    {coverPreview ? (
                      <Box
                        component="img"
                        src={coverPreview}
                        alt="Package cover"
                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <ImageOutlinedIcon sx={{ fontSize: 40 }} />
                    )}
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <Button
                      component="label"
                      variant="outlined"
                      sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                      {coverPreview ? "Change image" : "Upload image"}
                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) onCoverChange(file);
                          event.target.value = "";
                        }}
                      />
                    </Button>
                    {coverPreview && (
                      <Button
                        color="error"
                        sx={{ textTransform: "none", fontWeight: 600 }}
                        onClick={() => onCoverChange(null)}
                      >
                        Remove
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Services */}
      <Card sx={cardSx}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Box>
              <Typography variant="h5" fontWeight={600} color="primary.main">
                Services
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Services can come from any category. Optional services are
                add-ons the customer can choose; they are priced on top of the
                package and are not discounted.
              </Typography>
            </Box>

            <Box display="flex" flexDirection="column" gap={3} width="100%">
              {fields.map((field, index) => {
                const selected = findService(watchedServices[index]?.service);

                return (
                  <Grid
                    key={field.id}
                    container
                    spacing={2}
                    alignItems="center"
                    width="100%"
                  >
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Controller
                        name={`services.${index}.service`}
                        control={control}
                        rules={{ required: "Selecting a service is required" }}
                        render={({ field: serviceField, fieldState }) => (
                          <SelectDropdown
                            label="Select service"
                            placeholder="Choose a service"
                            value={serviceField.value ?? ""}
                            onChange={(value) => {
                              serviceField.onChange(value);
                              const service = findService(value);
                              if (service) {
                                setValue(
                                  `services.${index}.price`,
                                  Number(service.price),
                                );
                              }
                            }}
                            options={serviceOptions}
                            error={fieldState.error?.message}
                            disable={isServicesLoading || !company}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 6, sm: 2 }}>
                      <Controller
                        name={`services.${index}.quantity`}
                        control={control}
                        rules={{
                          required: "Quantity is required",
                          min: {
                            value: 1,
                            message: "Quantity must be at least 1",
                          },
                        }}
                        render={({ field: quantityField, fieldState }) => (
                          <InputField
                            label="Quantity"
                            type="number"
                            value={quantityField.value ?? ""}
                            onChange={quantityField.onChange}
                            error={fieldState.invalid}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 6, sm: 2 }}>
                      <Controller
                        name={`services.${index}.price`}
                        control={control}
                        rules={{
                          required: "Price is required",
                          min: { value: 0, message: "Price cannot be negative" },
                        }}
                        render={({ field: priceField, fieldState }) => (
                          <InputField
                            label="Price in package"
                            placeholder="e.g. 150.00"
                            type="number"
                            value={priceField.value ?? ""}
                            onChange={priceField.onChange}
                            error={fieldState.invalid}
                            helperText={
                              fieldState.error?.message ??
                              (selected
                                ? `Regular: ${formatPrice(selected.price)}`
                                : undefined)
                            }
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      size={{ xs: 6, sm: 3 }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        pt: { sm: 3.2 },
                      }}
                    >
                      <Controller
                        name={`services.${index}.required`}
                        control={control}
                        render={({ field: requiredField }) => (
                          <FormControlLabel
                            control={
                              <Switch
                                checked={!requiredField.value}
                                onChange={(_, checked) =>
                                  requiredField.onChange(!checked)
                                }
                              />
                            }
                            label="Optional add-on"
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      size={{ xs: 6, sm: 1 }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: { xs: "flex-start", sm: "center" },
                        pt: { sm: 3.2 },
                      }}
                    >
                      <IconButton
                        aria-label="Remove service"
                        color="error"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                );
              })}
            </Box>

            <Box display="flex" justifyContent="flex-start">
              <Button
                variant="text"
                color="primary"
                startIcon={<AddIcon fontSize="small" />}
                onClick={() =>
                  append({
                    service: "",
                    price: undefined,
                    quantity: 1,
                    required: true,
                  })
                }
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Add service
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Pricing method */}
      <Card sx={cardSx}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h5" fontWeight={600} color="primary.main">
              Pricing
            </Typography>

            <Controller
              name="pricing_method"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  row
                  value={field.value}
                  onChange={(_, value) => field.onChange(value)}
                  sx={{ gap: 2 }}
                >
                  <FormControlLabel
                    value="service_total"
                    control={<Radio />}
                    label="Service total"
                  />
                  <FormControlLabel
                    value="fixed_price"
                    control={<Radio />}
                    label="Fixed price"
                  />
                  <FormControlLabel
                    value="percentage_discount"
                    control={<Radio />}
                    label="Percentage discount"
                  />
                  <FormControlLabel
                    value="fixed_discount"
                    control={<Radio />}
                    label="Fixed discount"
                  />
                </RadioGroup>
              )}
            />

            {pricingMethod !== "service_total" && (
              <Grid container width="100%">
                <Grid size={{ xs: 12, sm: 6 }} maxWidth="500px">
                  <Controller
                    key={pricingMethod}
                    name={
                      pricingMethod as
                        | "fixed_price"
                        | "percentage_discount"
                        | "fixed_discount"
                    }
                    control={control}
                    shouldUnregister
                    rules={{
                      required: `${PRICING_METHOD_FIELD_LABEL[pricingMethod]} is required`,
                      validate: (value) => {
                        const number = Number(value);
                        if (!(number > 0)) return "Must be greater than 0";
                        if (pricingMethod === "percentage_discount" && number >= 100)
                          return "Must be lower than 100";
                        if (
                          pricingMethod === "fixed_price" &&
                          number > breakdown.subtotal
                        )
                          return `Cannot be higher than the services total (${formatPrice(breakdown.subtotal)})`;
                        if (
                          pricingMethod === "fixed_discount" &&
                          number >= breakdown.subtotal
                        )
                          return `Must be lower than the services total (${formatPrice(breakdown.subtotal)})`;
                        return true;
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <InputField
                        label={PRICING_METHOD_FIELD_LABEL[pricingMethod]}
                        placeholder="e.g. 50"
                        type="number"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        error={fieldState.invalid}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            )}

            <PriceSummary breakdown={breakdown} />
          </Box>
        </CardContent>
      </Card>

      {/* Guests */}
      <Card sx={cardSx}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Box>
              <Typography variant="h5" fontWeight={600} color="primary.main">
                Guests
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The package price covers the included guests. Each extra guest
                is charged the extra guest price.
                {maxGuests !== null &&
                  ` The selected services allow up to ${maxGuests} guests.`}
              </Typography>
            </Box>

            <Grid container spacing={2} width="100%">
              <Grid size={{ xs: 12, sm: 6 }} maxWidth="500px">
                <Controller
                  name="included_guests"
                  control={control}
                  rules={{
                    required: "Included guests is required",
                    validate: (value) => {
                      const number = Number(value);
                      if (!Number.isInteger(number) || number < 1)
                        return "Must be a whole number of at least 1";
                      if (maxGuests !== null && number > maxGuests)
                        return `Cannot exceed ${maxGuests}, the smallest service capacity`;
                      return true;
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <InputField
                      label="Included guests"
                      placeholder="e.g. 50"
                      type="number"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      error={fieldState.invalid}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} maxWidth="500px">
                <Controller
                  name="price_per_extra_guest"
                  control={control}
                  rules={{
                    min: { value: 0, message: "Price cannot be negative" },
                  }}
                  render={({ field, fieldState }) => (
                    <InputField
                      label="Price per extra guest"
                      placeholder="e.g. 25.00"
                      type="number"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      error={fieldState.invalid}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Payment */}
      <Card sx={cardSx}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h5" fontWeight={600} color="primary.main">
              Payment
            </Typography>

            <Box display="flex" flexDirection="column" gap={1}>
              <Controller
                name="allow_full_payment"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(field.value)}
                        onChange={(_, checked) => field.onChange(checked)}
                      />
                    }
                    label="Full payment"
                  />
                )}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={depositEnabled}
                    onChange={(_, checked) => setDepositEnabled(checked)}
                  />
                }
                label="Deposit"
              />
              {depositEnabled && (
                <Grid container width="100%">
                  <Grid
                    size={{ xs: 12, sm: 6 }}
                    maxWidth="500px"
                    ml={{ sm: 4 }}
                  >
                    <Controller
                      name="deposit_percentage"
                      control={control}
                      shouldUnregister
                      rules={{
                        required: "Deposit percentage is required",
                        validate: (value) =>
                          (Number(value) > 0 && Number(value) < 100) ||
                          "Must be between 0 and 100",
                      }}
                      render={({ field, fieldState }) => (
                        <InputField
                          label="Deposit percentage"
                          placeholder="e.g. 20"
                          type="number"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          error={fieldState.invalid}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    checked={installmentEnabled}
                    onChange={(_, checked) => setInstallmentEnabled(checked)}
                  />
                }
                label="Installments"
              />
              {installmentEnabled && (
                <Grid container spacing={2} width="100%">
                  <Grid
                    size={{ xs: 12, sm: 6 }}
                    maxWidth="500px"
                    ml={{ sm: 4 }}
                  >
                    <Controller
                      name="installment_count"
                      control={control}
                      shouldUnregister
                      rules={{
                        required: "Number of installments is required",
                        validate: (value) => {
                          const number = Number(value);
                          return (
                            (Number.isInteger(number) &&
                              number >= 2 &&
                              number <= 52) ||
                            "Must be between 2 and 52"
                          );
                        },
                      }}
                      render={({ field, fieldState }) => (
                        <InputField
                          label="Number of installments"
                          placeholder="e.g. 3"
                          type="number"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          error={fieldState.invalid}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }} maxWidth="500px">
                    <Controller
                      name="installment_interval"
                      control={control}
                      shouldUnregister
                      rules={{ required: "Installment interval is required" }}
                      render={({ field, fieldState }) => (
                        <SelectDropdown
                          label="Installment interval"
                          placeholder="Choose an interval"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          options={INSTALLMENT_INTERVAL_OPTIONS}
                          error={fieldState.error?.message}
                        />
                      )}
                    />
                  </Grid>
                  {installmentAmount !== null && (
                    <Grid size={{ xs: 12 }} ml={{ sm: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {`${installmentCount} payments of ${formatPrice(installmentAmount)}`}
                        {installmentInterval
                          ? ` ${INSTALLMENT_INTERVAL_LABEL[installmentInterval]}`
                          : ""}
                        {" "}for the base package price.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Scheduling */}
      <Card sx={cardSx}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h5" fontWeight={600} color="primary.main">
              Scheduling
            </Typography>
            <Controller
              name="allow_scheduling_late"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(field.value)}
                      onChange={(_, checked) => field.onChange(checked)}
                    />
                  }
                  label="Customers can buy the package now and schedule its services later"
                />
              )}
            />
            {allowSchedulingLate && (
              <Grid container width="100%">
                <Grid size={{ xs: 12, sm: 6 }} maxWidth="500px" ml={{ sm: 4 }}>
                  <Controller
                    name="scheduling_deadline_days"
                    control={control}
                    shouldUnregister
                    rules={{
                      required: "Scheduling deadline is required",
                      validate: (value) => {
                        const number = Number(value);
                        return (
                          (Number.isInteger(number) &&
                            number >= 1 &&
                            number <= 365) ||
                          "Must be between 1 and 365 days"
                        );
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <InputField
                        label="Days to schedule after booking"
                        placeholder="e.g. 30"
                        type="number"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        error={fieldState.invalid}
                        helperText={
                          fieldState.error?.message ??
                          "Customers must pick dates for every service within this many days."
                        }
                      />
                    )}
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        </CardContent>
      </Card>
    </>
  );
}

function PriceSummary({
  breakdown,
}: {
  breakdown: ReturnType<typeof calculatePackageBreakdown>;
}) {
  const rows = [
    { label: "Required services", value: formatPrice(breakdown.subtotal) },
    ...(breakdown.savings > 0
      ? [{ label: "Customer saves", value: `− ${formatPrice(breakdown.savings)}` }]
      : []),
  ];

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        maxWidth: 500,
        background:
          "linear-gradient(135deg, rgba(11, 61, 145, 0.06) 0%, rgba(201, 162, 39, 0.12) 100%)",
        border: "1px solid rgba(11, 61, 145, 0.12)",
      }}
    >
      <Stack spacing={1}>
        {rows.map((row) => (
          <Box key={row.label} display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              {row.label}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {row.value}
            </Typography>
          </Box>
        ))}
        <Divider />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography fontWeight={700}>Package price</Typography>
          <Typography variant="h6" fontWeight={800} color="primary.main">
            {formatPrice(breakdown.total)}
          </Typography>
        </Box>
        {breakdown.addonsSubtotal > 0 && (
          <Typography variant="caption" color="text.secondary">
            {`Optional add-ons available for up to ${formatPrice(breakdown.addonsSubtotal)} more.`}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
