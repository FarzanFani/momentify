"use client";

import InputField from "@/components/common/input/InputField";
import SelectDropdown from "@/components/common/dropdown/Dropdown";
import { Box, FormControlLabel, Grid, Switch } from "@mui/material";
import { Controller } from "react-hook-form";
import { RegisterFormProps } from "../add/formTypes";

const timezoneOptions = [
  { label: "UTC", value: "UTC" },
  { label: "Europe/London", value: "Europe/London" },
  { label: "Asia/Tehran", value: "Asia/Tehran" },
  { label: "Asia/Dubai", value: "Asia/Dubai" },
];

export default function RegisterForm({ control, errors }: RegisterFormProps) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="name"
          control={control}
          rules={{ required: "Company name is required" }}
          render={({ field }) => (
            <InputField
              label="Company Name"
              value={field.value}
              onChange={field.onChange}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="email"
          control={control}
          rules={{
            required: "Company email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
          }}
          render={({ field }) => (
            <InputField
              label="Company Email"
              value={field.value}
              onChange={field.onChange}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name="phone_number"
          control={control}
          rules={{ required: "Phone number is required" }}
          render={({ field }) => (
            <InputField
              label="Phone Number"
              value={field.value}
              onChange={field.onChange}
              error={!!errors.phone_number}
              helperText={errors.phone_number?.message}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name="timezone"
          control={control}
          render={({ field }) => (
            <Box>
              <SelectDropdown
                label="Timezone"
                value={field.value}
                onChange={field.onChange}
                options={timezoneOptions}
                fullWidth
                height={45}
              />
            </Box>
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="description"
          control={control}
          rules={{ required: "Description is required" }}
          render={({ field }) => (
            <InputField
              label="Description"
              value={field.value}
              onChange={field.onChange}
              error={!!errors.description}
              helperText={errors.description?.message}
              multiline
              rows={4}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Controller
          name="auto_approve_booking"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  color="primary"
                />
              }
              label="Auto-approve bookings"
            />
          )}
        />
      </Grid>
    </Grid>
  );
}
