"use client";

import { Email, Phone, Place } from "@mui/icons-material";
import { Box, Container, Grid, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

// Placeholder details: replace with the real contact information.
const contactDetails = [
  { icon: Email, label: "Email", value: "contact@example.com" },
  { icon: Phone, label: "Phone", value: "+00 000 000 000" },
  { icon: Place, label: "Address", value: "Street, City, Country" },
];

export default function Contact() {
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
          Contacts
        </Typography>
        <Typography
          variant="h2"
          sx={{
            color: "primary.dark",
            fontSize: { xs: "2.5rem", md: "3.5rem" },
            mt: 1,
          }}
        >
          We&apos;re here to help
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", maxWidth: 560, mx: "auto", mt: 2 }}
        >
          Have a question about an event, a booking or becoming a provider?
          Get in touch and our team will get back to you.
        </Typography>
      </Box>

      <Grid container spacing={3} justifyContent="center">
        {contactDetails.map(({ icon: Icon, label, value }) => (
          <Grid key={label} size={{ xs: 12, sm: 6, md: 4 }}>
            <Box
              sx={{
                p: 4,
                height: "100%",
                textAlign: "center",
                border: "1px solid",
                borderColor: alpha("#0B3D91", 0.12),
                borderRadius: 3,
                bgcolor: "background.paper",
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  mx: "auto",
                  mb: 2,
                  borderRadius: 2,
                  bgcolor: alpha("#C9A227", 0.12),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon sx={{ color: "secondary.main" }} />
              </Box>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "primary.dark",
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  mb: 0.5,
                }}
              >
                {label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
