"use client";

import {
  AppBar,
  Badge,
  Box,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logout } from "@/store/authSlice";
import { useState } from "react";
import { AccountCircle, Notifications } from "@mui/icons-material";
import ProviderNavCards from "@/components/provider/providerNavCards/providerNavCards";
import MenuIcon from "@mui/icons-material/Menu";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

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

  const icons = (
    <>
      <Badge badgeContent={10} color="error">
        <Notifications fontSize="large" color="primary" />
      </Badge>
      <IconButton size="large" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <AccountCircle fontSize="large" color="primary" />
      </IconButton>
    </>
  );

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {renderMenu}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 280,
            boxSizing: "border-box",
          },
        }}
      >
        <Box
          display={{ xs: "flex", sm: "none" }}
          gap={5}
          alignItems={"center"}
          justifyContent={"center"}
          sx={{
            backgroundColor: "#F5F7FA",
            borderRight: "3px solid black",
            pt: 1,
          }}
        >
          {icons}
        </Box>
        <ProviderNavCards onclick={handleDrawerToggle} />
      </Drawer>

      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "#F5F7FA",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Toolbar>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              py: 1,
              px: { xs: 2, sm: 4 },
            }}
          >
            <Box display={"flex"} gap={3}>
              <IconButton
                size="large"
                edge="start"
                color="primary"
                aria-label="menu"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { xs: "inline-flex", md: "none" } }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ color: "primary.main", fontSize: "2rem" }}
              >
                Momentify
              </Typography>
            </Box>
            <Box
              color="primary.contrastText"
              display={{ xs: "none", sm: "flex" }}
              gap={3}
              justifyContent="end"
              alignItems="center"
            >
              {icons}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Box
          sx={{
            width: "280px",
            flexShrink: 0,
            display: { xs: "none", md: "block" },
          }}
        >
          <ProviderNavCards />
        </Box>
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
      </Box>
    </Box>
  );
}
