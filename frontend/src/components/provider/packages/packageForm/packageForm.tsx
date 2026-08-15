"use client";

import SelectDropdown from "@/components/common/dropdown/Dropdown";
import InputField from "@/components/common/input/InputField";
import { useGetProviderServicesTinyList } from "@/hooks/service";
import { ServicePackagesPayload } from "@/services/provider/services";
import { DropdownOptionItem } from "@/types/general";
import { mapApiResponseToDropdownOptions } from "@/utils/helperFunctions";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Switch,
  Typography,
} from "@mui/material";
import { useState } from "react";
import {
  Control,
  Controller,
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

type PackageFormProps = {
  control: Control<ServicePackagesPayload>;
  companyOptions: DropdownOptionItem[];
  categoryOptions: DropdownOptionItem[];
  inEdit?: boolean;
  initialServiceOptions?: DropdownOptionItem[];
  initialDepositEnabled?: boolean;
  initialInstallmentEnabled?: boolean;
};

export default function PackageForm({
  control,
  companyOptions,
  categoryOptions,
  inEdit = false,
  initialServiceOptions = [],
  initialDepositEnabled = false,
  initialInstallmentEnabled = false,
}: PackageFormProps) {
  const [depositEnabled, setDepositEnabled] = useState(initialDepositEnabled);
  const [installmentEnabled, setInstallmentEnabled] = useState(
    initialInstallmentEnabled,
  );

  const company = useWatch({ control, name: "company" });
  const category = useWatch({ control, name: "category" });
  const pricingMethod = useWatch({ control, name: "pricing_method" });

  const { data: services, isLoading: isServicesLoading } =
    useGetProviderServicesTinyList(company, category);

  const fetchedServiceOptions = mapApiResponseToDropdownOptions(
    services ?? [],
    "id",
    "name",
  );

  const serviceOptions = [
    ...initialServiceOptions,
    ...fetchedServiceOptions.filter(
      (option) =>
        !initialServiceOptions.some(
          (initialOption) => initialOption.value === option.value,
        ),
    ),
  ];

  const { fields, append, remove } = useFieldArray({
    control,
    name: "services",
  });

  const isServiceTotal = pricingMethod === "service_total";

  return (
    <>
      {/* Package details */}
      <Card
        sx={{
          width: "90%",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h5" fontWeight={600} color="primary.main">
              Package details
            </Typography>

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
                      label="Select category"
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
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Services */}
      <Card
        sx={{
          width: "90%",
          borderRadius: 3,
          mt: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h5" fontWeight={600} color="primary.main">
              Services
            </Typography>

            <Box display="flex" flexDirection="column" gap={3} width="100%">
              {fields.map((field, index) => (
                <Grid
                  key={field.id}
                  container
                  spacing={2}
                  alignItems="center"
                  width="100%"
                >
                  <Grid size={{ xs: 12, sm: isServiceTotal ? 4 : 5 }}>
                    <Controller
                      name={`services.${index}.service`}
                      control={control}
                      rules={{ required: "Selecting a service is required" }}
                      render={({ field: serviceField, fieldState }) => (
                        <SelectDropdown
                          label="Select service"
                          placeholder="Choose a service"
                          value={serviceField.value ?? ""}
                          onChange={serviceField.onChange}
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
                        min: { value: 1, message: "Quantity must be at least 1" },
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

                  {isServiceTotal && (
                    <Grid size={{ xs: 6, sm: 2 }}>
                      <Controller
                        name={`services.${index}.price`}
                        control={control}
                        shouldUnregister
                        render={({ field: priceField }) => (
                          <InputField
                            label="Price"
                            placeholder="e.g. 150.00"
                            type="number"
                            value={priceField.value ?? ""}
                            onChange={priceField.onChange}
                          />
                        )}
                      />
                    </Grid>
                  )}

                  <Grid
                    size={{ xs: 6, sm: 2 }}
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
                          label="Optional"
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
              ))}
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
      <Card
        sx={{
          width: "90%",
          borderRadius: 3,
          mt: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h5" fontWeight={600} color="primary.main">
              Pricing method
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
          </Box>
        </CardContent>
      </Card>

      {/* Payment */}
      <Card
        sx={{
          width: "90%",
          borderRadius: 3,
          mt: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
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
                      rules={{ required: "Deposit percentage is required" }}
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
                label="Installment"
              />
              {installmentEnabled && (
                <Grid container spacing={2} width="100%">
                  <Grid
                    size={{ xs: 12, sm: 6 }}
                    maxWidth="500px"
                    ml={{ sm: 4 }}
                  >
                    <Controller
                      name="installment_amount"
                      control={control}
                      shouldUnregister
                      rules={{ required: "Installment amount is required" }}
                      render={({ field, fieldState }) => (
                        <InputField
                          label="Installment amount"
                          placeholder="e.g. 100.00"
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
                </Grid>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}
