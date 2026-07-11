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
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import AdminNavCards from "@/components/admin/adminNavCards/adminNavCards";
import { AccountCircle, Notifications } from "@mui/icons-material";
import { useState } from "react";
import { logout } from "@/store/authSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname === "/admin/dashboard";
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const dispatch = useDispatch();

  const router = useRouter();

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
          ...(isDashboard && { borderBottom: "3px solid black" }),
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
            sx={{
              color: "primary.main",
              fontSize: "2rem",
            }}
          >
            Momentify
          </Typography>
          <Box sx={{ flex: 1 }} />
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
        <motion.div
          layout
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 30,
          }}
          style={{
            width: isDashboard ? "100%" : "280px",
            flexShrink: 0,
            height: "100%",
          }}
        >
          <AdminNavCards variant={isDashboard ? "dashboard" : "sidebar"} />
        </motion.div>
        {!isDashboard && (
          <Box
            sx={{
              flex: 1,
              p: 3,
              overflowY: "auto",
              borderTop: "3px solid black",
            }}
          >
            {children}
          </Box>
        )}
        {isDashboard && <Box sx={{ display: "none" }}>{children}</Box>}
      </Box>
    </Box>
  );
}
