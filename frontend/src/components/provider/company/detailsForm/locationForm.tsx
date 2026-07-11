"use client";

import InputField from "@/components/common/input/InputField";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { Add, Check, Delete } from "@mui/icons-material";
import { Controller } from "react-hook-form";
import { CompanyLocation, LocationFormProps } from "../add/formTypes";
import { updateCompanyLocation } from "@/hooks/company";

const emptyLocation = {
  name: "",
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
  onSaveAddress,
  isSavingAddress,
  isAddPage,
  handleDeleteLocation,
}: LocationFormProps) {
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
              Address {index + 1}
            </Typography>
            <Box display={"flex"} gap={1}>
              {fields.length > 1 && (
                <IconButton
                  color="error"
                  onClick={() => {
                    console.log(field.id, handleDeleteLocation);

                    if (field.id && handleDeleteLocation) {
                      handleDeleteLocation(field.id ?? "").then((value) => {
                        if (value) {
                          remove(index);
                          return;
                        } else {
                          return;
                        }
                      });
                    }
                    remove(index);
                  }}
                >
                  <Delete fontSize="medium" />
                </IconButton>
              )}
              {!isAddPage && (
                <IconButton
                  color="primary"
                  onClick={() => onSaveAddress?.(index)}
                  disabled={isSavingAddress}
                  size="small"
                >
                  {isSavingAddress ? (
                    <CircularProgress color="primary" />
                  ) : (
                    <Check fontSize="medium" />
                  )}
                </IconButton>
              )}
            </Box>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name={`locations.${index}.name`}
                control={control}
                rules={{ required: "Name is required" }}
                render={({ field: f }) => (
                  <InputField
                    label="name"
                    value={f.value}
                    onChange={f.onChange}
                    error={!!errors.locations?.[index]?.name}
                    helperText={errors.locations?.[index]?.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
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
                    multiline
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
