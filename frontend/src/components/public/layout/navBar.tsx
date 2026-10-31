"use client";

import { useAppSelector } from "@/store/hook";
import { AccountCircle /* , Notifications */ } from "@mui/icons-material";
import {
  // Badge,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";

const landingNavItems = [
  "Services",
  "How It Works",
  "Testimonials",
  "Contact",
].map((label) => ({
  label,
  href: `#${label.toLowerCase().replace(/\s/g, "-")}`,
}));

const pageNavItems = [
  { label: "Services", href: "/services" },
  { label: "Packages", href: "/packages" },
];

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dispatch = useDispatch();

  const isLandingPage = pathname === "/";
  const navItems = isLandingPage
    ? landingNavItems
    : user?.role === "CUSTOMER"
      ? [...pageNavItems, { label: "My bookings", href: "/customer/booking" }]
      : pageNavItems;

  const showLoginButton = !isAuthenticated && pathname !== "/login";
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
    <Box
      component="nav"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        bgcolor: alpha("#072a63", 0.97),
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid",
        borderColor: alpha("#C9A227", 0.2),
      }}
    >
      {renderMenu}
      <Box px={{ xs: 2, md: 12, lg: 12, xl: 20 }} sx={{ width: "100%" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ py: 2 }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            onClick={() => router.push("/")}
            sx={{
              cursor: "pointer",
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                bgcolor: "secondary.main",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography sx={{ fontSize: 18, lineHeight: 1 }}>✦</Typography>
            </Box>
            <Typography
              variant="h5"
              sx={{
                color: "primary.contrastText",
                fontWeight: 700,
                fontSize: "1.4rem",
              }}
            >
              Momentify
            </Typography>
          </Stack>

          <Stack
            sx={{ display: { xs: "none", md: "flex" } }}
            direction="row"
            spacing={4}
          >
            {navItems.map((item) => {
              const isActive =
                !isLandingPage && pathname.startsWith(item.href);
              return (
                <Typography
                  key={item.label}
                  variant="body2"
                  component={Link}
                  href={item.href}
                  sx={{
                    color: isActive
                      ? "secondary.main"
                      : alpha("#f5f7fa", 0.75),
                    textDecoration: "none",
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    transition: "color 0.2s",
                    "&:hover": { color: "secondary.light" },
                  }}
                >
                  {item.label}
                </Typography>
              );
            })}
          </Stack>

          <Box display={"flex"} gap={2} alignItems={"center"}>
            {showLoginButton ? (
              <Button
                variant="contained"
                color="secondary"
                size="small"
                sx={{ px: 3, py: 1, fontSize: "0.75rem" }}
                onClick={() => router.push("/login")}
              >
                Login
              </Button>
            ) : !isAuthenticated ? null : (
              <>
                {/* Notifications are hidden until they are implemented.
                <Badge badgeContent={10} color="error">
                  <Notifications
                    fontSize="large"
                    sx={{ color: "secondary.main" }}
                  />
                </Badge> */}
                <IconButton
                  size="large"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                  <AccountCircle
                    fontSize="large"
                    sx={{ color: "secondary.main" }}
                  />
                </IconButton>
              </>
            )}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
