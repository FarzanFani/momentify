"use client";

import InputField from "@/components/common/input/InputField";
import { Box, Button, Divider, Grid, IconButton, Typography } from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { Controller } from "react-hook-form";
import { LocationFormProps } from "./formTypes";

const emptyLocation = {
  address: "",
  city: "",
  country: "",
  latitude: "",
  longitude: "",
};

export default function LocationForm({
  control,
  errors,
  fieldArray,
}: LocationFormProps) {
  const { fields, append, remove } = fieldArray;

  return (
    <Box>
      {fields.map((field, index) => (
        <Box key={field.id}>
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
              Address {index + 1}
            </Typography>
            {fields.length > 1 && (
              <IconButton color="error" onClick={() => remove(index)} size="small">
                <Delete fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name={`locations.${index}.address`}
                control={control}
                rules={{ required: "Address is required" }}
                render={({ field: f }) => (
                  <InputField
                    label="Address"
                    value={f.value}
                    onChange={f.onChange}
                    error={!!errors.locations?.[index]?.address}
                    helperText={errors.locations?.[index]?.address?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`locations.${index}.city`}
                control={control}
                rules={{ required: "City is required" }}
                render={({ field: f }) => (
                  <InputField
                    label="City"
                    value={f.value}
                    onChange={f.onChange}
                    error={!!errors.locations?.[index]?.city}
                    helperText={errors.locations?.[index]?.city?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`locations.${index}.country`}
                control={control}
                rules={{ required: "Country is required" }}
                render={({ field: f }) => (
                  <InputField
                    label="Country"
                    value={f.value}
                    onChange={f.onChange}
                    error={!!errors.locations?.[index]?.country}
                    helperText={errors.locations?.[index]?.country?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`locations.${index}.latitude`}
                control={control}
                rules={{ required: "Latitude is required" }}
                render={({ field: f }) => (
                  <InputField
                    label="Latitude"
                    value={f.value}
                    onChange={f.onChange}
                    error={!!errors.locations?.[index]?.latitude}
                    helperText={errors.locations?.[index]?.latitude?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`locations.${index}.longitude`}
                control={control}
                rules={{ required: "Longitude is required" }}
                render={({ field: f }) => (
                  <InputField
                    label="Longitude"
                    value={f.value}
                    onChange={f.onChange}
                    error={!!errors.locations?.[index]?.longitude}
                    helperText={errors.locations?.[index]?.longitude?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      ))}

      <Button
        startIcon={<Add />}
        onClick={() => append(emptyLocation)}
        sx={{ mt: 2, textTransform: "none" }}
      >
        Add Another Address
      </Button>
    </Box>
  );
}
