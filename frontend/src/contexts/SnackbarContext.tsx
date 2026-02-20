"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Snackbar, Alert, AlertColor } from "@mui/material";

interface SnackbarState {
  id: number;
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface SnackbarContextType {
  showSnackbar: (message: string, severity?: AlertColor) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined,
);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [snackbars, setSnackbars] = useState<SnackbarState[]>([]);

  const showSnackbar = useCallback(
    (message: string, severity: AlertColor = "success") => {
      setSnackbars((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          open: true,
          message,
          severity,
        },
      ]);
    },
    [],
  );

  const handleClose = (
    id: number,
    _?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") return;
    setSnackbars((prev) => prev.filter((snackbar) => snackbar.id !== id));
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={snackbar.id}
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={(event, reason) => handleClose(snackbar.id, event, reason)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ top: `${24 + index * 60}px !important` }}
        >
          <Alert
            onClose={(event) => handleClose(snackbar.id, event)}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      ))}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
}
