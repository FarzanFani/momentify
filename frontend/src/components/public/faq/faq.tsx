"use client";

import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useRouter } from "next/navigation";

const questions = [
  {
    question: "How does booking a service work?",
    answer:
      "Pick a service, choose a date and time, and send your request. The provider reviews it and confirms or rejects it. You can follow the status of every request under My bookings.",
  },
  {
    question: "What is a package?",
    answer:
      "A package bundles several services from one provider, often at a lower price than booking them one by one. Some services are included, and others are optional add-ons you can choose when booking.",
  },
  {
    question: "Do I have to pick every date when I book a package?",
    answer:
      "Not always. If the provider allows it, you can leave some dates empty and pick them later from the package booking page, before the scheduling deadline shown there.",
  },
  {
    question: "How do I pay?",
    answer:
      "Each provider sets which payment options they accept. Depending on the service or package, you can pay in full, pay a deposit, or pay in installments.",
  },
  {
    question: "Can I cancel a booking?",
    answer:
      "Yes. You can cancel a pending or confirmed booking from its booking page. Cancelling a package cancels every service in it; you can't cancel just one service from a package. Any refund follows that provider's cancellation policy, which depends on how long before the event you cancel.",
  },
  {
    question: "Can I leave a review?",
    answer:
      "Yes. Once a booking is completed, you can rate the service and leave a comment. You can choose to post your review anonymously.",
  },
  {
    question: "How can I offer my services on Momentify?",
    answer:
      "Get in touch with us through the contact page and we will help you set up a provider account.",
  },
];

export default function Faq() {
  const router = useRouter();

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
          FAQ
        </Typography>
        <Typography
          variant="h2"
          sx={{
            color: "primary.dark",
            fontSize: { xs: "2.5rem", md: "3.5rem" },
            mt: 1,
          }}
        >
          Frequently asked questions
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", maxWidth: 640, mx: "auto", mt: 2 }}
        >
          Answers to common questions about booking services and packages.
        </Typography>
      </Box>

      <Stack spacing={1.5}>
        {questions.map((item) => (
          <Accordion
            key={item.question}
            disableGutters
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: alpha("#0B3D91", 0.12),
              borderRadius: 3,
              "&:before": { display: "none" },
              "&.MuiAccordion-rounded": { borderRadius: 3 },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 3, py: 1 }}>
              <Typography
                variant="h5"
                sx={{ color: "primary.dark", fontSize: "1.15rem" }}
              >
                {item.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pb: 3 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.8 }}
              >
                {item.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>

      <Box sx={{ textAlign: "center", mt: 8 }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Still have a question?
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => router.push("/contact")}
          sx={{ px: 6, fontSize: "0.85rem", bgcolor: "primary.dark" }}
        >
          Contact us
        </Button>
      </Box>
    </Container>
  );
}
