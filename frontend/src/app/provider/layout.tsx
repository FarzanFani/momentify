"use client";

import {
  AppBar,
  Badge,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logout } from "@/store/authSlice";
import { useState } from "react";
import { AccountCircle, Notifications } from "@mui/icons-material";
import ProviderNavCards from "@/components/provider/providerNavCards/providerNavCards";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
    handleMenuClose();
  };
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      id={"profile-menu"}
      keepMounted
      transformOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );
  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {renderMenu}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "#F5F7FA",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            py: 1,
            px: 4,
          }}
        >
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{ color: "primary.main", fontSize: "2rem" }}
          >
            Momentify
          </Typography>
          <Box
            color="primary.contrastText"
            display="flex"
            gap={3}
            justifyContent="end"
            alignItems="center"
          >
            <Badge badgeContent={10} color="error">
              <Notifications fontSize="large" color="primary" />
            </Badge>
            <IconButton
              size="large"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <AccountCircle fontSize="large" color="primary" />
            </IconButton>
          </Box>
        </Box>
      </AppBar>
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Box sx={{ width: "280px", flexShrink: 0 }}>
          <ProviderNavCards />
        </Box>
        <Box sx={{ flex: 1, p: 3, overflowY: "auto", borderTop: "3px solid black" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
