"use client";

import InputField from "@/components/common/input/InputField";
import { FormControlLabel, Grid, Switch } from "@mui/material";
import { Controller } from "react-hook-form";
import { CancellationPolicyFormProps } from "./formTypes";

export default function CancellationPolicyForm({
  control,
  errors,
}: CancellationPolicyFormProps) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Controller
          name="cancellation_policy_text"
          control={control}
          rules={{ required: "Cancellation policy is required" }}
          render={({ field }) => (
            <InputField
              label="Cancellation Policy"
              value={field.value}
              onChange={field.onChange}
              error={!!errors.cancellation_policy_text}
              helperText={errors.cancellation_policy_text?.message}
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
