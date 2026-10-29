"use client";

import { Button, Container, Typography, Box } from "@mui/material";
import * as styles from "./styles";
import Link from "next/link";
import InputField from "@/components/common/input/InputField";
import PasswordField from "@/components/common/password/PasswordField";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/authSlice";
import { useRouter, useSearchParams } from "next/navigation";
import { useLogin } from "@/hooks/useLogin";
import { useForm, Controller } from "react-hook-form";
import { extractApiError } from "@/utils/extractApiError";
import { useAppSelector } from "@/store/hook";
import { useEffect } from "react";

interface LoginForm {
  email: string;
  password: string;
}

const homeRouteByRole = {
  CUSTOMER: "/customer/booking",
  PROVIDER: "/provider/dashboard",
  ADMIN: "/admin/dashboard",
};

export default function Login() {
  const { showSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const router = useRouter();
  const { mutate, isPending } = useLogin();
  const searchParams = useSearchParams();
  const { user, isAuthInitialized } = useAppSelector((state) => state.auth);

  // Logged-in users never see the form: send them to `next` or their home.
  useEffect(() => {
    if (!isAuthInitialized || !user) {
      return;
    }
    const nextRoute = searchParams.get("next");
    // Only same-site paths, so `next` can't send users to another website.
    const safeNextRoute =
      nextRoute?.startsWith("/") && !nextRoute.startsWith("//")
        ? nextRoute
        : null;
    router.replace(safeNextRoute ?? homeRouteByRole[user.role]);
  }, [isAuthInitialized, user, searchParams, router]);

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
        // The effect above redirects once the user is in the store.
        dispatch(setUser(user));
        showSnackbar("Login successful!", "success");
      },
      onError: (err) => {
        showSnackbar(extractApiError(err, "Login failed"), "error");
      },
    });
  };

  // Avoid flashing the form while auth loads or the redirect is on its way.
  if (!isAuthInitialized || user) {
    return null;
  }

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
                  onEnterPressed={handleSubmit(onSubmit)}
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
                  onEnterPressed={handleSubmit(onSubmit)}
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
