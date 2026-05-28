"use client";

import SelectDropdown from "@/components/common/dropdown/Dropdown";
import InputField from "@/components/common/input/InputField";
import { CompanyServicesFormValues } from "@/services/provider/services";
import { DropdownOptionItem } from "@/types/general";
import {
  Box,
  Card,
  CardContent,
  FormControlLabel,
  Grid,
  Switch,
  Typography,
} from "@mui/material";
import { Control, Controller } from "react-hook-form";

type ServceFormProps = {
  categoryOptions: DropdownOptionItem[];
  companyOptions: DropdownOptionItem[];
  control: Control<CompanyServicesFormValues>;
  inEdit: boolean;
};

export default function ServiceForm({
  categoryOptions,
  companyOptions,
  control,
  inEdit,
}: ServceFormProps) {
  return (
    <>
      <Card sx={{ width: "90%", borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            flexWrap={"wrap"}
            gap={1.5}
          >
            <Typography variant="h5" fontWeight={600} color="primary.main">
              Generla Information
            </Typography>

            <Grid
              container
              spacing={2}
              justifyContent={"space-evenly"}
              alignItems={"start"}
              width={"100%"}
            >
              <Grid size={{ xs: 12, sm: 6 }} maxWidth={"500px"}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Name is required" }}
                  render={({ field: f, fieldState }) => (
                    <InputField
                      label="name"
                      value={f.value}
                      onChange={f.onChange}
                      error={fieldState.invalid}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} maxWidth={"500px"}>
                <Controller
                  name="company"
                  control={control}
                  rules={{ required: "Selecting company is required" }}
                  render={({ field: f, fieldState }) => (
                    <SelectDropdown
                      label="Company"
                      value={f.value}
                      onChange={f.onChange}
                      options={companyOptions}
                      error={fieldState.error?.message}
                      disable={inEdit}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} maxWidth={"500px"}>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Selecting Category is required" }}
                  render={({ field: f, fieldState }) => (
                    <SelectDropdown
                      label="Category"
                      value={f.value}
                      onChange={f.onChange}
                      options={categoryOptions}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} mt={4} maxWidth={"500px"}>
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field: f }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(f.value)}
                          onChange={(_, checked) => f.onChange(checked)}
                          name="Is active"
                        />
                      }
                      label="Active"
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }} maxWidth={"1100px"}>
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: "Description is required" }}
                  render={({ field: f, fieldState }) => (
                    <InputField
                      value={f.value}
                      onChange={f.onChange}
                      label="Description"
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
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            flexWrap={"wrap"}
            gap={1.5}
          >
            <Typography variant="h5" fontWeight={600} color="primary.main">
              Control Information
            </Typography>
            <Grid
              container
              spacing={2}
              justifyContent={"space-evenly"}
              alignItems={"start"}
              width={"100%"}
            >
              <Grid size={{ xs: 12, sm: 6 }} maxWidth={"500px"}>
                <Controller
                  name="duration_minutes"
                  control={control}
                  rules={{ required: "Duration is required" }}
                  render={({ field: f, fieldState }) => (
                    <InputField
                      label="Duration in minutes"
                      type="number"
                      value={f.value}
                      onChange={f.onChange}
                      error={fieldState.invalid}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} maxWidth={"500px"}>
                <Controller
                  name="max_capacity"
                  control={control}
                  rules={{ required: "Max capacity is required" }}
                  render={({ field: f, fieldState }) => (
                    <InputField
                      label="Max capacity"
                      type="number"
                      value={f.value}
                      onChange={f.onChange}
                      error={fieldState.invalid}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} maxWidth={"500px"}>
                <Controller
                  name="buffer_before_minutes"
                  control={control}
                  rules={{ required: "Buffer after is required" }}
                  render={({ field: f, fieldState }) => (
                    <InputField
                      label="Buffer after"
                      type="number"
                      value={f.value}
                      onChange={f.onChange}
                      error={fieldState.invalid}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} maxWidth={"500px"}>
                <Controller
                  name="buffer_after_minutes"
                  control={control}
                  rules={{ required: "Buffer before is required" }}
                  render={({ field: f, fieldState }) => (
                    <InputField
                      label="Buffer before"
                      type="number"
                      value={f.value}
                      onChange={f.onChange}
                      error={fieldState.invalid}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} maxWidth={"500px"}>
                <Controller
                  name="price"
                  control={control}
                  rules={{ required: "Pricce is required" }}
                  render={({ field: f, fieldState }) => (
                    <InputField
                      label="Price"
                      value={f.value}
                      type="number"
                      onChange={f.onChange}
                      error={fieldState.invalid}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} maxWidth={"500px"}></Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}
