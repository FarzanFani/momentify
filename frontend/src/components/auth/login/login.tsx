"use client";

import { Button, Container, Typography, Box } from "@mui/material";
import * as styles from "./styles";
import Link from "next/link";
import InputField from "@/components/common/input/InputField";
import PasswordField from "@/components/common/password/PasswordField";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/useLogin";
import { useForm, Controller } from "react-hook-form";
import { extractApiError } from "@/utils/extractApiError";

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const { showSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const router = useRouter();
  const { mutate, isPending } = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginForm) => {
    mutate(data, {
      onSuccess: ({ user }) => {
        dispatch(setUser(user));
        showSnackbar("Login successful!", "success");

        switch (user.role) {
          case "PROVIDER":
            router.push("/provider/dashboard");
            break;
          case "ADMIN":
            router.push("/admin/dashboard");
            break;
          case "CUSTOMER":
            router.push("/customer/dashboard");
            break;
        }
      },
      onError: (err) => {
        showSnackbar(extractApiError(err, "Login failed"), "error");
      },
    });
  };

  return (
    <Box sx={styles.pageContainer}>
      <Container
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={2}
          sx={styles.card}
        >
          <Box sx={styles.headerBox} maxWidth={"400px"} width={"100%"}>
            <Typography variant="body2" sx={styles.subtitle}>
              Welcome to
            </Typography>
            <Typography variant="h4" color="primary.dark" sx={styles.title}>
              Momentify
            </Typography>
          </Box>

          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
            maxWidth={"400px"}
            width={"100%"}
          >
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
              name="password"
              control={control}
              rules={{ required: "Password is required" }}
              render={({ field }) => (
                <PasswordField
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              )}
            />

            <Button
              type="button"
              variant="contained"
              color="primary"
              disabled={isPending}
              sx={styles.loginButton}
              onClick={handleSubmit(onSubmit)}
            >
              {isPending ? "Logging in..." : "Login"}
            </Button>

            <Link href="/register" style={{ width: "100%" }}>
              <Button variant="text" color="primary" sx={styles.registerButton}>
                Don&apos;t have an account?
              </Button>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
