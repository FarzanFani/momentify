"use client";

import InputField from "@/components/common/input/InputField";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Switch,
  Typography,
} from "@mui/material";
import { Add, Check, Delete } from "@mui/icons-material";
import { Controller } from "react-hook-form";
import { CancellationPolicyFormProps } from "../add/formTypes";

const emptyCancellationPolicy = {
  rule_description: "",
  hours_before_event: "",
  refund_precentage: "",
  priority: "",
  is_active: true,
};

export default function CancellationPolicyForm({
  control,
  errors,
  fieldArray,
  onSaveCancellationPolicy,
  isSavingCancellationPolicy,
}: CancellationPolicyFormProps) {
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
              Cancellation Policy {index + 1}
            </Typography>

            <Box display={"flex"} gap={1}>
              {fields.length > 1 && (
                <IconButton color="error" onClick={() => remove(index)}>
                  <Delete fontSize="medium" />
                </IconButton>
              )}
              <IconButton
                color="primary"
                onClick={() => onSaveCancellationPolicy?.(index)}
                disabled={isSavingCancellationPolicy}
                size="small"
              >
                {isSavingCancellationPolicy ? (
                  <CircularProgress color="primary" />
                ) : (
                  <Check fontSize="medium" />
                )}
              </IconButton>
            </Box>
          </Box>

          <Grid
            container
            spacing={2}
            justifyContent={"center"}
            alignItems={"end"}
          >
            <Grid size={{ xs: 12 }}>
              <Controller
                name={`cancellation_policies.${index}.rule_description`}
                control={control}
                rules={{ required: "Rule description is required" }}
                render={({ field: f }) => (
                  <InputField
                    label="Rule Description"
                    value={f.value}
                    onChange={f.onChange}
                    error={
                      !!errors.cancellation_policies?.[index]?.rule_description
                    }
                    helperText={
                      errors.cancellation_policies?.[index]?.rule_description
                        ?.message
                    }
                    multiline
                    rows={4}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`cancellation_policies.${index}.hours_before_event`}
                control={control}
                rules={{ required: "Hours before event is required" }}
                render={({ field: f }) => (
                  <InputField
                    label="Hours Before Event"
                    value={f.value}
                    onChange={f.onChange}
                    error={
                      !!errors.cancellation_policies?.[index]
                        ?.hours_before_event
                    }
                    helperText={
                      errors.cancellation_policies?.[index]?.hours_before_event
                        ?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`cancellation_policies.${index}.refund_precentage`}
                control={control}
                rules={{ required: "Refund percentage is required" }}
                render={({ field: f }) => (
                  <InputField
                    label="Refund Percentage"
                    value={f.value}
                    onChange={f.onChange}
                    error={
                      !!errors.cancellation_policies?.[index]?.refund_precentage
                    }
                    helperText={
                      errors.cancellation_policies?.[index]?.refund_precentage
                        ?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`cancellation_policies.${index}.priority`}
                control={control}
                rules={{ required: "Priority is required" }}
                render={({ field: f }) => (
                  <InputField
                    label="Priority"
                    value={f.value}
                    onChange={f.onChange}
                    error={!!errors.cancellation_policies?.[index]?.priority}
                    helperText={
                      errors.cancellation_policies?.[index]?.priority?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`cancellation_policies.${index}.is_active`}
                control={control}
                render={({ field: f }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!f.value}
                        onChange={(e) => f.onChange(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Active"
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      ))}

      <Button
        startIcon={<Add />}
        onClick={() => append(emptyCancellationPolicy)}
        sx={{ mt: 2, textTransform: "none" }}
      >
        Add Another Cancellation Policy
      </Button>
    </Box>
  );
}
