"use client";

import { ReactNode, useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store";
import { theme } from "@/theme";
import { SnackbarProvider } from "@/contexts/SnackbarContext";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <QueryClientProvider client={queryClient}>
        <ReduxProvider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider>
              {children}
            </SnackbarProvider>
          </ThemeProvider>
        </ReduxProvider>
      </QueryClientProvider>
    </AppRouterCacheProvider>
  );
}
