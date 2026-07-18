"use client";

import SelectDropdown from "@/components/common/dropdown/Dropdown";
import InputField from "@/components/common/input/InputField";
import { CompanyServicesFormValues } from "@/services/provider/services";
import { DropdownOptionItem } from "@/types/general";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Box,
  Card,
  CardContent,
  FormControlLabel,
  Grid,
  IconButton,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { Control, Controller, useWatch } from "react-hook-form";

type ServiceFormProps = {
  categoryOptions: DropdownOptionItem[];
  companyOptions: DropdownOptionItem[];
  control: Control<CompanyServicesFormValues>;
  inEdit: boolean;
};

const controlFieldWidth = {
  xs: 12,
  sm: 6,
} as const;

export default function ServiceForm({
  categoryOptions,
  companyOptions,
  control,
  inEdit,
}: ServiceFormProps) {
  const guestCountPolicy = useWatch({
    control,
    name: "guest_count_policy",
  });

  const minimumBillableGuest = useWatch({
    control,
    name: "minimum_billable_guest",
  });

  const isFixedPricing = guestCountPolicy === "fixed";
  const isVariablePricing = guestCountPolicy === "variable";
  const hasSelectedPricingPolicy = isFixedPricing || isVariablePricing;

  return (
    <>
      <Card sx={{ width: "90%", borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexWrap="wrap"
            gap={1.5}
          >
            <Typography variant="h5" fontWeight={600} color="primary.main">
              General Information
            </Typography>

            <Grid
              container
              spacing={2}
              justifyContent="space-evenly"
              alignItems="start"
              width="100%"
            >
              <Grid size={controlFieldWidth} maxWidth="500px">
                <Controller
                  name="name"
                  control={control}
                  rules={{
                    required: "Service name is required",
                  }}
                  render={({ field, fieldState }) => (
                    <InputField
                      label="Service name"
                      placeholder="e.g. Private City Walking Tour"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      error={fieldState.invalid}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={controlFieldWidth} maxWidth="500px">
                <Controller
                  name="company"
                  control={control}
                  rules={{
                    required: "Selecting a company is required",
                  }}
                  render={({ field, fieldState }) => (
                    <SelectDropdown
                      label="Select company"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={companyOptions}
                      error={fieldState.error?.message}
                      disable={inEdit}
                    />
                  )}
                />
              </Grid>

              <Grid size={controlFieldWidth} maxWidth="500px">
                <Controller
                  name="category"
                  control={control}
                  rules={{
                    required: "Selecting a category is required",
                  }}
                  render={({ field, fieldState }) => (
                    <SelectDropdown
                      label="Select category"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={categoryOptions}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid
                size={controlFieldWidth}
                mt={{ xs: 0, sm: 4 }}
                maxWidth="500px"
              >
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(field.value)}
                          onChange={(_, checked) => {
                            field.onChange(checked);
                          }}
                          name="is_active"
                        />
                      }
                      label="Active"
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }} maxWidth="1100px">
                <Controller
                  name="description"
                  control={control}
                  rules={{
                    required: "Description is required",
                  }}
                  render={({ field, fieldState }) => (
                    <InputField
                      label="Description"
                      placeholder="Describe what guests can expect, what is included, and any important service details."
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

      <Card sx={{ width: "90%", borderRadius: 3, mt: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexWrap="wrap"
            gap={1.5}
          >
            <Typography variant="h5" fontWeight={600} color="primary.main">
              Booking and Pricing Information
            </Typography>

            <Grid
              container
              spacing={2}
              justifyContent="space-evenly"
              alignItems="start"
              width="100%"
            >
              <Grid size={controlFieldWidth} maxWidth="500px">
                <Controller
                  name="guest_count_policy"
                  control={control}
                  rules={{
                    required: "Guest pricing policy is required",
                  }}
                  render={({ field, fieldState }) => (
                    <SelectDropdown
                      options={[
                        {
                          label: "Fixed guest count",
                          value: "fixed",
                        },
                        {
                          label: "Variable guest count",
                          value: "variable",
                        },
                      ]}
                      label="Select guest pricing policy"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              {isFixedPricing && (
                <Grid size={controlFieldWidth} maxWidth="500px">
                  <Controller
                    name="fixed_guest_count"
                    control={control}
                    shouldUnregister
                    rules={{
                      required: "Guest number is required",
                      min: {
                        value: 1,
                        message: "Guest number must be at least 1",
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <InputField
                        label="Guest number"
                        placeholder="e.g. 6"
                        type="number"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        error={fieldState.invalid}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </Grid>
              )}

              {isVariablePricing && (
                <>
                  <Grid size={controlFieldWidth} maxWidth="500px">
                    <Box sx={{ position: "relative" }}>
                      <Controller
                        name="minimum_billable_guest"
                        control={control}
                        shouldUnregister
                        rules={{
                          required: "Minimum guest number is required",
                          min: {
                            value: 1,
                            message: "Minimum guest number must be at least 1",
                          },
                        }}
                        render={({ field, fieldState }) => (
                          <InputField
                            label="Minimum guest number"
                            placeholder="e.g. 2"
                            type="number"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            error={fieldState.invalid}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />

                      <Tooltip
                        arrow
                        placement="top"
                        title="The minimum number of guests included in the booking charge. For example, if the minimum is 3 and only 2 guests book, the customer will still be charged for 3 guests."
                      >
                        <IconButton
                          type="button"
                          size="small"
                          aria-label="Information about minimum guest number"
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 6,
                            zIndex: 2,
                            color: "text.secondary",
                          }}
                        >
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>

                  <Grid size={controlFieldWidth} maxWidth="500px">
                    <Controller
                      name="max_capacity"
                      control={control}
                      shouldUnregister
                      rules={{
                        required: "Maximum capacity is required",
                        min: {
                          value: 1,
                          message: "Maximum capacity must be at least 1",
                        },
                        validate: (value) => {
                          if (
                            minimumBillableGuest !== undefined &&
                            minimumBillableGuest !== null &&
                            minimumBillableGuest !== 0 &&
                            Number(value) < Number(minimumBillableGuest)
                          ) {
                            return "Maximum capacity cannot be less than the minimum guest number";
                          }

                          return true;
                        },
                      }}
                      render={({ field, fieldState }) => (
                        <InputField
                          label="Maximum capacity"
                          placeholder="e.g. 12"
                          type="number"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          error={fieldState.invalid}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                  </Grid>
                </>
              )}

              {hasSelectedPricingPolicy && (
                <Grid size={controlFieldWidth} maxWidth="500px">
                  <Controller
                    name="price"
                    control={control}
                    rules={{
                      required: isVariablePricing
                        ? "Base price is required"
                        : "Price is required",
                      min: {
                        value: 0,
                        message: isVariablePricing
                          ? "Base price cannot be negative"
                          : "Price cannot be negative",
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <InputField
                        label={isVariablePricing ? "Base price" : "Price"}
                        placeholder={
                          isVariablePricing ? "e.g. 100.00" : "e.g. 250.00"
                        }
                        type="number"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        error={fieldState.invalid}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </Grid>
              )}

              {isVariablePricing && (
                <Grid size={controlFieldWidth} maxWidth="500px">
                  <Controller
                    name="price_per_guest"
                    control={control}
                    shouldUnregister
                    rules={{
                      required: "Price per guest is required",
                      min: {
                        value: 0,
                        message: "Price per guest cannot be negative",
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <InputField
                        label="Price per guest"
                        placeholder="e.g. 45.00"
                        type="number"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        error={fieldState.invalid}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </Grid>
              )}
              <Grid size={controlFieldWidth} maxWidth="500px">
                <Controller
                  name="duration_minutes"
                  control={control}
                  rules={{
                    required: "Duration is required",
                    min: {
                      value: 1,
                      message: "Duration must be at least 1 minute",
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <InputField
                      label="Duration in minutes"
                      placeholder="e.g. 90"
                      type="number"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      error={fieldState.invalid}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={controlFieldWidth} maxWidth="500px">
                <Controller
                  name="buffer_before_minutes"
                  control={control}
                  rules={{
                    required: "Buffer before is required",
                    min: {
                      value: 0,
                      message: "Buffer before cannot be negative",
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <InputField
                      label="Buffer before in minutes"
                      placeholder="e.g. 15"
                      type="number"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      error={fieldState.invalid}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={controlFieldWidth} maxWidth="500px">
                <Controller
                  name="buffer_after_minutes"
                  control={control}
                  rules={{
                    required: "Buffer after is required",
                    min: {
                      value: 0,
                      message: "Buffer after cannot be negative",
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <InputField
                      label="Buffer after in minutes"
                      placeholder="e.g. 15"
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
    </>
  );
}
