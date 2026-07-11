"use client";

import SelectDropdown from "@/components/common/dropdown/Dropdown";
import InputField from "@/components/common/input/InputField";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { Close } from "@mui/icons-material";
import { useAddUser } from "@/hooks/users";
import { AddUserPayload } from "@/services/admin/user";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { extractApiError } from "@/utils/extractApiError";

interface AddModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddModal({ open, onClose }: AddModalProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddUserPayload>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      role: "CUSTOMER",
    },
  });

  const { mutate, isPending } = useAddUser();
  const { showSnackbar } = useSnackbar();

  const onSubmit = (data: AddUserPayload) => {
    console.log(data);

    mutate(data, {
      onSuccess: () => {
        onClose();
        showSnackbar("User added successfully", "success");
      },
      onError: (error) => {
        showSnackbar(extractApiError(error, "User addition failed"), "error");
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle display={"flex"} justifyContent={"space-between"}>
        <Typography color="primary" fontWeight={"600"} fontSize={"20px"}>
          Add User
        </Typography>
        <IconButton onClick={onClose}>
          <Close color="error" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Controller
            control={control}
            name="first_name"
            rules={{
              required: "First Name is required",
            }}
            render={({ field }) => (
              <InputField
                value={field.value}
                onChange={field.onChange}
                label="First Name"
                error={!!errors.first_name}
                helperText={errors.first_name?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="last_name"
            rules={{
              required: "Last Name is required",
            }}
            render={({ field }) => (
              <InputField
                value={field.value}
                onChange={field.onChange}
                label="Last Name"
                error={!!errors.last_name}
                helperText={errors.last_name?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address",
              },
            }}
            render={({ field }) => (
              <InputField
                value={field.value}
                onChange={field.onChange}
                label="Email"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="phone_number"
            rules={{
              required: "Phone Number is required",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Enter a valid phone number",
              },
            }}
            render={({ field }) => (
              <InputField
                value={field.value}
                onChange={field.onChange}
                label="Phone Number"
                error={!!errors.phone_number}
                helperText={errors.phone_number?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="role"
            rules={{
              required: "Role is required",
            }}
            render={({ field }) => (
              <SelectDropdown
                value={field.value}
                onChange={field.onChange}
                label="Role"
                fullWidth={true}
                options={[
                  { label: "Customer", value: "CUSTOMER" },
                  { label: "Provider", value: "PROVIDER" },
                ]}
              />
            )}
          />
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            color="primary"
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              height: "45px",
              marginTop: "16px",
            }}
            // disabled={isPending}
            startIcon={
              isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : undefined
            }
          >
            Add User
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
