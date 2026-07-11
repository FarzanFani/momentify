import type { Theme } from "@mui/material";
import type { SystemStyleObject } from "@mui/system";
import type { CSSProperties } from "react";

type Sx = SystemStyleObject<Theme>;

export const page: Sx = {
  height: "100%",
  backgroundColor: "#F5F7FA",
  overflowY: "auto",
};

export const sidebarWrapper: Sx = {
  height: "100%",
  backgroundColor: "#F5F7FA",
  overflowY: "auto",
  borderRight: "3px solid black",
};

export const pageContainer: Sx = {
  paddingTop: 10,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#F5F7FA",
};

export const navContainer = (isSidebar: boolean): Sx => ({
  paddingTop: 5,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#F5F7FA",
  flexWrap: "wrap",
  gap: isSidebar ? 4 : 8,
});

export const cardItem = (isSidebar: boolean): CSSProperties => ({
  flex: isSidebar ? "1 0 100%" : "0 0 calc(50% - 32px)",
  display: "flex",
  justifyContent: "center",
});

export const dashboardSpacer: Sx = {
  flex: "0 0 calc(50% - 32px)",
};

export const container: Sx = {
  display: "flex",
  justifyContent: "center",
  alignContent: "center",
};

export const cardContainer: Sx = {
  padding: 4,
  borderRadius: 2,
  height: "100%",
  width: "60%",
  display: "flex",
  justifyContent: "center",
  gap: 2,
  flexDirection: "column",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.01)",
    boxShadow: "0 12px 48px rgba(0, 0, 0, 0.3)",
    cursor: "pointer",
  },
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
};

export const compactCard: Sx = {
  width: "85%",
  p: 2,
};

export const activeCard: Sx = {
  outline: "2px solid rgba(255, 255, 255, 0.8)",
  outlineOffset: "2px",
  transform: "scale(1.03)",
};

export const inactiveCard: Sx = {
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
  opacity: 0.7,
  "&:hover": {
    opacity: 1,
    transform: "scale(1.01)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
    cursor: "pointer",
  },
};

export const cardRow: Sx = {
  display: "flex",
  alignItems: "center",
  gap: 2,
};

export const userContainer: Sx = {
  backgroundColor: "red",
  height: "100%",
  width: "70%",
};
