"use client";

import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useRouter } from "next/navigation";

const values = [
  {
    title: "Care in every detail",
    body: "Every event marks a moment that matters. We treat each booking with the attention it deserves.",
  },
  {
    title: "Trusted providers",
    body: "We work with verified providers so you can book with confidence, from venues to photographers.",
  },
  {
    title: "Simple planning",
    body: "Browse services, compare packages and manage your bookings in one place.",
  },
];

export default function AboutUs() {
  const router = useRouter();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
      <Box sx={{ textAlign: "center", mb: 8 }}>
        <Typography
          variant="overline"
          sx={{
            color: "secondary.main",
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            letterSpacing: "0.15em",
            fontSize: "0.75rem",
          }}
        >
          About us
        </Typography>
        <Typography
          variant="h2"
          sx={{
            color: "primary.dark",
            fontSize: { xs: "2.5rem", md: "3.5rem" },
            mt: 1,
          }}
        >
          Life&apos;s important moments, handled with care
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", maxWidth: 640, mx: "auto", mt: 2 }}
        >
          Momentify connects you with the people and services you need for
          every chapter of life, from weddings and baptisms to debuts and
          farewells.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {values.map((value) => (
          <Grid key={value.title} size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                p: 4,
                height: "100%",
                border: "1px solid",
                borderColor: alpha("#0B3D91", 0.12),
                borderRadius: 3,
                bgcolor: "background.paper",
              }}
            >
              <Typography
                variant="h5"
                sx={{ color: "primary.dark", mb: 1.5, fontSize: "1.35rem" }}
              >
                {value.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.8 }}
              >
                {value.body}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ textAlign: "center", mt: 8 }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => router.push("/services")}
          sx={{ px: 6, fontSize: "0.85rem", bgcolor: "primary.dark" }}
        >
          Browse services
        </Button>
      </Box>
    </Container>
  );
}
