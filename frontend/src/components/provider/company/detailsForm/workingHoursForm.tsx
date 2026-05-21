"use client";

import InputField from "@/components/common/input/InputField";
import MultiSelectDropdown from "@/components/common/multiSelectDropdown/MultiSelectDropdown";
import { Add, Check, Delete } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormHelperText,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { WorkingHoursFormProps } from "../add/formTypes";
import { DropdownOptionItem } from "@/types/general";

const emptyWorkingHour = {
  weekday: [],
  start_time: "",
  end_time: "",
};

const weekDays: DropdownOptionItem[] = [
  { value: "0", label: "Monday" },
  { value: "1", label: "Tuesday" },
  { value: "2", label: "Wednesday" },
  { value: "3", label: "Thursday" },
  { value: "4", label: "Friday" },
  { value: "5", label: "Saturday" },
  { value: "6", label: "Sunday" },
];

export default function WorkingHoursForm({
  control,
  errors,
  fieldArray,
  onSaveWorkingHour,
  isSavingWorkingHour,
}: WorkingHoursFormProps) {
  const { fields, append, remove } = fieldArray;

  return (
    <Box>
      {fields.map((field, index) => (
        <Box key={field.fieldId}>
          {index > 0 && <Divider sx={{ my: 3 }} />}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography fontWeight={600} color="primary.main">
              Working Hours {index + 1}
            </Typography>

            <Box display={"flex"} gap={1}>
              {fields.length > 1 && (
                <IconButton color="error" onClick={() => remove(index)}>
                  <Delete fontSize="medium" />
                </IconButton>
              )}
              <IconButton
                color="primary"
                onClick={() => onSaveWorkingHour?.(index)}
                disabled={isSavingWorkingHour}
                size="small"
              >
                {isSavingWorkingHour ? (
                  <CircularProgress color="primary" />
                ) : (
                  <Check fontSize="medium" />
                )}
              </IconButton>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name={`working_hours.${index}.weekday`}
                control={control}
                rules={{
                  validate: (value) =>
                    value.length > 0 || "At least one day is required",
                }}
                render={({ field: f }) => (
                  <Box>
                    <MultiSelectDropdown
                      label="Days"
                      options={weekDays}
                      value={f.value || []}
                      onChange={f.onChange}
                      fullWidth
                    />

                    {!!errors.working_hours?.[index]?.weekday && (
                      <FormHelperText error>
                        {errors.working_hours[index]?.weekday?.message}
                      </FormHelperText>
                    )}
                  </Box>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`working_hours.${index}.start_time`}
                control={control}
                rules={{ required: "Start time is required" }}
                render={({ field: f }) => (
                  <InputField
                    label="Start Time"
                    type="time"
                    value={f.value}
                    onChange={f.onChange}
                    error={!!errors.working_hours?.[index]?.start_time}
                    helperText={
                      errors.working_hours?.[index]?.start_time?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`working_hours.${index}.end_time`}
                control={control}
                rules={{ required: "End time is required" }}
                render={({ field: f }) => (
                  <InputField
                    label="End Time"
                    type="time"
                    value={f.value}
                    onChange={f.onChange}
                    error={!!errors.working_hours?.[index]?.end_time}
                    helperText={
                      errors.working_hours?.[index]?.end_time?.message
                    }
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      ))}

      <Button
        startIcon={<Add />}
        onClick={() => append(emptyWorkingHour)}
        sx={{ mt: 2, textTransform: "none" }}
      >
        Add Another Working Hours
      </Button>
    </Box>
  );
}
