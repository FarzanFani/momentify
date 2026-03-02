"use client";

import InputField from "@/components/common/input/InputField";
import { Grid } from "@mui/material";
import { Controller } from "react-hook-form";
import { WorkingHoursFormProps } from "./formTypes";

export default function WorkingHoursForm({
  control,
  errors,
}: WorkingHoursFormProps) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="work_start_time"
          control={control}
          rules={{ required: "Start time is required" }}
          render={({ field }) => (
            <InputField
              label="Start Time"
              type="time"
              value={field.value}
              onChange={field.onChange}
              error={!!errors.work_start_time}
              helperText={errors.work_start_time?.message}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="work_end_time"
          control={control}
          rules={{ required: "End time is required" }}
          render={({ field }) => (
            <InputField
              label="End Time"
              type="time"
              value={field.value}
              onChange={field.onChange}
              error={!!errors.work_end_time}
              helperText={errors.work_end_time?.message}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Controller
          name="working_days"
          control={control}
          rules={{ required: "Working days are required" }}
          render={({ field }) => (
            <InputField
              label="Working Days"
              placeholder="Example: Monday, Tuesday, Wednesday"
              value={field.value}
              onChange={field.onChange}
              error={!!errors.working_days}
              helperText={errors.working_days?.message}
            />
          )}
        />
      </Grid>
    </Grid>
  );
}
