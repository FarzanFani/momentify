"use client";

import { ReactNode, useEffect, useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store";
import { theme } from "@/theme";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import { useDispatch } from "react-redux";
import axiosInstance from "@/api/axiosInstance";
import { setUser } from "@/store/authSlice";
import { ApiResponse } from "@/types/general";
import { User } from "@/services/auth.service";

function AuthBootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    const hasAuthToken =
      typeof window !== "undefined" &&
      (Boolean(localStorage.getItem("access_token")) ||
        Boolean(localStorage.getItem("refresh_token")));

    if (!hasAuthToken) {
      return;
    }

    const restoreUser = async () => {
      try {
        const { data } =
          await axiosInstance.get<ApiResponse<User>>("/api/accounts/me/");
        if (data.success && data.data) {
          dispatch(setUser(data.data));
        }
      } catch {
        // Ignore here; auth/redirect behavior is handled in axios interceptor.
      }
    };

    restoreUser();
  }, [dispatch]);

  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <QueryClientProvider client={queryClient}>
        <ReduxProvider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthBootstrap />
            <SnackbarProvider>
              {children}
            </SnackbarProvider>
          </ThemeProvider>
        </ReduxProvider>
      </QueryClientProvider>
    </AppRouterCacheProvider>
  );
}
