import { SxProps, Theme } from "@mui/material";

const fieldWidth = 400;

export const pageContainer: SxProps<Theme> = {
  width: "100%",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#F5F7FA",
};

export const card: SxProps<Theme> = {
  p: 4,
  backdropFilter: "blur(20px)",
  borderRadius: 3,
  WebkitBackdropFilter: "blur(20px)",
  background: `linear-gradient(135deg, rgba(255,255,255,0.75), rgba(255,255,255,0.55))`,
  border: "1px solid rgba(255, 255, 255, 0.3)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  transition: "all 0.5s ease",
  "&:hover": {
    transform: "scale(1.01)",
    boxShadow: "0 12px 48px rgba(0, 0, 0, 0.3)",
  },
};

export const headerBox: SxProps<Theme> = {
  width: fieldWidth,
  textAlign: "left",
};

export const subtitle: SxProps<Theme> = {
  fontWeight: 400,
  color: "gray",
};

export const title: SxProps<Theme> = {
  fontWeight: 700,
  fontFamily: "'Geist', sans-serif",
};

export const loginButton: SxProps<Theme> = {
  width: fieldWidth,
  height: 45,
  borderRadius: 1.5,
  textTransform: "none",
};

export const registerButton: SxProps<Theme> = {
  width: fieldWidth,
  fontSize: 14,
  textTransform: "none",
  mt: 1,
  height: 45,
};
