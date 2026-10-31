"use client";

import { Box, Container, Divider, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import Link from "next/link";

type Section = {
  title: string;
  paragraphs: string[];
};

const privacySections: Section[] = [
  {
    title: "Information we collect",
    paragraphs: [
      "When you create an account we collect your name, email address and password. When you book a service or package we also collect the contact details, event location, guest count and any special requests you enter.",
      "We keep a record of your bookings, payments and reviews so you and the provider can manage them.",
    ],
  },
  {
    title: "How we use your information",
    paragraphs: [
      "We use your information to run your account, send your booking requests to providers, and keep you updated on their status.",
      "Providers see the details they need to deliver your booking, such as your contact details, the event date, location and guest count.",
    ],
  },
  {
    title: "Reviews",
    paragraphs: [
      "Reviews are shown publicly on the provider's services. If you post a review anonymously, your name is not shown with it.",
    ],
  },
  {
    title: "Your choices",
    paragraphs: [
      "You can update your account details at any time. To ask for a copy of your data or to have your account deleted, contact us.",
    ],
  },
];

const termsSections: Section[] = [
  {
    title: "Using Momentify",
    paragraphs: [
      "Momentify connects customers with independent providers. The provider is responsible for delivering the services you book with them.",
      "You agree to give accurate information when you create an account or make a booking.",
    ],
  },
  {
    title: "Bookings",
    paragraphs: [
      "A booking is a request until the provider confirms it. Providers may reject a request, for example if they are not available.",
      "For packages that allow later scheduling, any dates you leave open must be picked before the scheduling deadline shown on your package booking.",
    ],
  },
  {
    title: "Payments",
    paragraphs: [
      "Prices and payment options, such as full payment, deposit or installments, are set by each provider and shown before you book.",
    ],
  },
  {
    title: "Cancellations and refunds",
    paragraphs: [
      "You can cancel a pending or confirmed booking from your booking page. Refunds follow the provider's cancellation policy, which depends on how long before the event you cancel.",
      "A package booking can only be cancelled as a whole, which cancels every service in it. Other changes to a package booking, such as guests or add-ons, are not possible after booking.",
    ],
  },
  {
    title: "Reviews",
    paragraphs: [
      "Reviews must be honest and based on your own experience. We may remove reviews that are abusive or misleading.",
    ],
  },
];

export default function PrivacyTerms() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
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
          Privacy & Terms
        </Typography>
        <Typography
          variant="h2"
          sx={{
            color: "primary.dark",
            fontSize: { xs: "2.5rem", md: "3.5rem" },
            mt: 1,
          }}
        >
          How we handle your data and bookings
        </Typography>
      </Box>

      <Stack spacing={6}>
        <PolicyBlock heading="Privacy policy" sections={privacySections} />
        <PolicyBlock heading="Terms of service" sections={termsSections} />

        <Typography variant="body2" color="text.secondary" textAlign="center">
          Questions about these terms?{" "}
          <Box
            component={Link}
            href="/contact"
            sx={{ color: "primary.main", fontWeight: 700 }}
          >
            Contact us
          </Box>
          .
        </Typography>
      </Stack>
    </Container>
  );
}

function PolicyBlock({
  heading,
  sections,
}: {
  heading: string;
  sections: Section[];
}) {
  return (
    <Box
      sx={{
        p: { xs: 3, md: 5 },
        border: "1px solid",
        borderColor: alpha("#0B3D91", 0.12),
        borderRadius: 3,
        bgcolor: "background.paper",
      }}
    >
      <Typography
        variant="h4"
        sx={{ color: "primary.dark", fontSize: { xs: "1.75rem", md: "2rem" } }}
      >
        {heading}
      </Typography>
      <Divider sx={{ my: 3 }} />

      <Stack spacing={3}>
        {sections.map((section) => (
          <Box key={section.title}>
            <Typography
              variant="h5"
              sx={{ color: "primary.dark", fontSize: "1.2rem", mb: 1 }}
            >
              {section.title}
            </Typography>
            <Stack spacing={1}>
              {section.paragraphs.map((paragraph) => (
                <Typography
                  key={paragraph}
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.8 }}
                >
                  {paragraph}
                </Typography>
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
