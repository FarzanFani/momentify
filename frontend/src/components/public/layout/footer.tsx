"use client";

import { Box, Container, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

export default function Footer() {
  return (
    <Box
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      sx={{
        bgcolor: "primary.dark",
        height: { xs: "150px", md: "80px" },
        position: "relative",
        zIndex: 20,
        width: "100%",
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={3}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 28,
                height: 28,
                bgcolor: "secondary.main",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
              }}
            >
              ✦
            </Box>
            <Typography
              variant="h6"
              sx={{ color: "primary.contrastText", fontSize: "1.1rem" }}
            >
              Celebra
            </Typography>
          </Stack>

          <Stack direction="row" spacing={4}>
            {["Privacy", "Terms", "FAQ", "Contact"].map((item) => (
              <Typography
                key={item}
                variant="body2"
                sx={{
                  color: alpha("#f5f7fa", 0.5),
                  fontFamily: "'Lato', sans-serif",
                  fontSize: "0.75rem",
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  "&:hover": { color: "secondary.main" },
                  transition: "color 0.2s",
                }}
              >
                {item}
              </Typography>
            ))}
          </Stack>

          <Typography
            variant="body2"
            sx={{
              color: alpha("#f5f7fa", 0.4),
              fontFamily: "'Lato', sans-serif",
              fontSize: "0.75rem",
            }}
          >
            © {new Date().getFullYear()} Celebra. All rights reserved.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
