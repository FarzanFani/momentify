"use client";

import { Button, Container, Typography, Box } from "@mui/material";
import * as styles from "@/components/auth/login/styles";
import Link from "next/link";
import InputField from "@/components/common/input/InputField";
import PasswordField from "@/components/common/password/PasswordField";
import { useRegister } from "@/hooks/useRegister";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useForm, Controller } from "react-hook-form";

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { mutate, isPending } = useRegister();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = (data: RegisterForm) => {
    console.log(data);

    mutate(
      {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
        role: "CUSTOMER",
        phone_number: data.phoneNumber,
      },
      {
        onSuccess: () => {
          showSnackbar("Registration successful!", "success");
          router.push("/login");
        },
        onError: (err) => {
          const apiErrors = err.response?.data?.errors;
          if (apiErrors) {
            const message = Object.values(apiErrors).flat().join("\n");
            showSnackbar(message, "error");
          } else {
            showSnackbar(
              err.response?.data?.message || "Registration failed",
              "error",
            );
          }
        },
      },
    );
  };

  return (
    <Box sx={styles.pageContainer}>
      <Container maxWidth="sm">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={2}
          sx={styles.card}
        >
          <Box sx={styles.headerBox}>
            <Typography variant="body2" sx={styles.subtitle}>
              Welcome to
            </Typography>
            <Typography variant="h4" color="primary.dark" sx={styles.title}>
              Momentify
            </Typography>
          </Box>

          <Controller
            name="firstName"
            control={control}
            rules={{ required: "First name is required" }}
            render={({ field }) => (
              <InputField
                value={field.value}
                onChange={field.onChange}
                label="First Name"
                placeholder="Enter your first name"
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
            )}
          />

          <Controller
            name="lastName"
            control={control}
            rules={{ required: "Last name is required" }}
            render={({ field }) => (
              <InputField
                value={field.value}
                onChange={field.onChange}
                label="Last Name"
                placeholder="Enter your last name"
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
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
                placeholder="Enter your email"
                type="email"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />

          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <InputField
                value={field.value}
                onChange={field.onChange}
                label="Phone Number"
                placeholder="Enter your phone number"
                type="tel"
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={{
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            }}
            render={({ field }) => (
              <PasswordField
                value={field.value}
                onChange={field.onChange}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: "Please confirm your password",
              validate: (value) =>
                value === password || "Passwords do not match",
            }}
            render={({ field }) => (
              <PasswordField
                value={field.value}
                onChange={field.onChange}
                label="Confirm Password"
                placeholder="Confirm your password"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
            )}
          />

          <Button
            variant="contained"
            color="primary"
            disabled={isPending}
            sx={styles.registerButton}
            onClick={handleSubmit(onSubmit)}
          >
            {isPending ? "Registering..." : "Register"}
          </Button>

          <Link href="/login">
            <Button variant="text" color="primary" sx={styles.registerButton}>
              Already have an account?
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
