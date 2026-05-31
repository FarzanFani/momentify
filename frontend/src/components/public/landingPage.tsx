"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { VerifiedUser } from "@mui/icons-material";
import { usePathname, useRouter } from "next/navigation";

const services = [
  {
    icon: "💍",
    label: "Wedding",
    description:
      "Plan your perfect day with curated vendors, venues, and full-service coordination.",
    color: "#C9A227",
    tag: "Most Popular",
    id: 1,
  },
  {
    icon: "✝️",
    label: "Baptism",
    description:
      "Celebrate a new beginning with graceful ceremony planning and cherished traditions.",
    color: "#0B3D91",
    tag: null,
    id: 2,
  },
  {
    icon: "🕊️",
    label: "Funeral",
    description:
      "Compassionate, dignified arrangements to honor and remember your loved ones.",
    color: "#3a3a3a",
    tag: null,
    id: 3,
  },
  {
    icon: "🎂",
    label: "Debut / 18th",
    description:
      "Mark life's milestone with a grand celebration tailored to your vision.",
    color: "#C9A227",
    tag: null,
  },
  {
    icon: "🎓",
    label: "Graduation",
    description:
      "Commemorate years of hard work with an unforgettable gathering of family and friends.",
    color: "#0B3D91",
    tag: null,
  },
  {
    icon: "🙏",
    label: "Religious Events",
    description:
      "From first communions to confirmations — sacred moments deserve perfect planning.",
    color: "#3a3a3a",
    tag: null,
  },
];

const steps = [
  {
    num: "01",
    title: "Choose Your Event",
    body: "Browse our service categories and select the occasion you're planning.",
  },
  {
    num: "02",
    title: "Customise & Confirm",
    body: "Pick your date, preferences, and packages. Our team reviews every detail.",
  },
  {
    num: "03",
    title: "Relax & Celebrate",
    body: "We handle coordination so you can be fully present on your special day.",
  },
];

const testimonials = [
  {
    quote:
      "Our wedding was beyond anything we imagined. Every detail was flawless from start to finish.",
    name: "Maria & Jose Santos",
    event: "Wedding — Cebu City",
  },
  {
    quote:
      "They handled our father's funeral with such grace and compassion. A true relief during a hard time.",
    name: "The Reyes Family",
    event: "Funeral — Manila",
  },
  {
    quote:
      "Our daughter's debut was absolutely magical. The team thought of everything we forgot!",
    name: "Lourdes Dela Cruz",
    event: "Debut — Davao",
  },
];

const stats = [
  { value: "5,000+", label: "Events Hosted" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "12+", label: "Years Experience" },
  { value: "50+", label: "Trusted Vendors" },
];

function Hero() {
  const router = useRouter();
  return (
    <Box
      id="hero"
      sx={{
        minHeight: "100vh",
        bgcolor: "#FFFCF4",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        width: "100%",
        p: 0,
        m: 0,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "50%",
          height: "100%",
          background: `linear-gradient(135deg, transparent 40%, ${alpha("#F4E7C5", 0.45)} 100%)`,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: "15%",
          right: "-60px",
          width: "520px",
          height: "520px",
          borderRadius: "50%",
          border: `1px solid ${alpha("#C9A227", 0.25)}`,
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "25%",
          right: "-20px",
          width: "380px",
          height: "380px",
          borderRadius: "50%",
          border: `1px solid ${alpha("#C9A227", 0.25)}`,
          pointerEvents: "none",
        }}
      />
      <Grid
        container
        spacing={{ xs: 4, md: 4, lg: 4 }}
        alignItems="center"
        width="100%"
        justifyContent="center"
      >
        <Grid
          size={{ xs: 12, lg: 7 }}
          sx={{
            display: "flex",
            justifyContent: {
              xs: "center",
              md: "center",
              lg: "flex-end",
              xl: "flex-end",
            },
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: {
                xs: "100%",
                sm: "90%",
                md: "85%",
                lg: "fit-content",
                xl: "fit-content",
              },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: {
                xs: "center",
                md: "flex-start",
              },
              textAlign: {
                xs: "center",
                md: "left",
              },
            }}
          >
            <Chip
              label="✦ Trusted Event Services"
              size="small"
              sx={{
                mb: 3,
                bgcolor: "primary.dark",
                color: "primary.contrastText",
                border: `1px solid ${alpha("#0B3D91", 0.3)}`,
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                letterSpacing: "0.1em",
                fontSize: "0.7rem",
              }}
            />

            <Typography
              variant="h1"
              sx={{
                color: "primary.dark",
                fontSize: {
                  xs: "3rem",
                  md: "3.8rem",
                  lg: "4rem",
                  xl: "4.4rem",
                },
                lineHeight: 1.08,
                mb: 2,
                whiteSpace: { md: "nowrap" },
              }}
            >
              Life's{" "}
              <Box component="span" sx={{ color: "secondary.main" }}>
                important
              </Box>{" "}
              moments,
            </Typography>
            <Typography
              variant="h2"
              sx={{
                color: "primary.dark",
                fontSize: { xs: "1.5rem", md: "2rem", lg: "2.35rem" },
                lineHeight: 1.2,
                mb: 3,
                fontWeight: 600,
              }}
            >
              Handled with care.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: alpha("#0B3D91", 0.75),
                fontSize: { xs: "0.95rem", md: "1.05rem" },
                maxWidth: 620,
                mb: 5,
                lineHeight: 1.8,
              }}
            >
              From weddings to baptisms, debuts to farewells — we bring warmth,
              care, and flawless execution to life's most meaningful events.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2.5}
              alignItems={{ xs: "center", sm: "center" }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push("/services")}
                sx={{
                  px: 5,
                  fontSize: "0.85rem",
                  bgcolor: "primary.dark",
                  color: "primary.contrastText",
                  position: "relative",
                  overflow: "hidden",
                  border: "2px solid transparent",
                  boxShadow: `0 0 18px ${alpha("#C9A227", 0.35)}`,

                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    borderRadius: "inherit",
                    padding: "2px",
                    background:
                      "linear-gradient(120deg, rgba(166, 137, 40, 0.95) 30%, rgba(255,255,255,1) 50%, rgba(166, 137, 40, 0.95) 70%, transparent 100%)",
                    backgroundSize: "220% 220%",
                    WebkitMask:
                      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    animation: "moveButtonLight 8s linear infinite",
                    pointerEvents: "none",
                  },

                  "&::after": {
                    content: '""',
                    position: "absolute",
                    inset: "-2px",
                    borderRadius: "inherit",
                    background:
                      "linear-gradient(120deg, transparent, rgba(201,162,39,0.28), transparent)",
                    animation: "moveButtonGlow 8s linear infinite",
                    pointerEvents: "none",
                    zIndex: 0,
                  },

                  "& > *": {
                    position: "relative",
                    zIndex: 1,
                  },

                  "@keyframes moveButtonLight": {
                    "0%": {
                      backgroundPosition: "220% 50%",
                    },
                    "100%": {
                      backgroundPosition: "-220% 50%",
                    },
                  },

                  "@keyframes moveButtonGlow": {
                    "0%": {
                      transform: "translateX(-100%)",
                    },
                    "100%": {
                      transform: "translateX(100%)",
                    },
                  },

                  "&:hover": {
                    bgcolor: alpha("#0B3D91", 0.92),
                    boxShadow: `0 0 26px ${alpha("#C9A227", 0.5)}`,
                  },
                }}
              >
                Book with Confidence
              </Button>

              <Stack direction="row" spacing={1} alignItems="center">
                <VerifiedUser
                  sx={{
                    color: "secondary.main",
                    fontSize: "1.25rem",
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: alpha("#0B3D91", 0.75),
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 700,
                  }}
                >
                  Trusted, verified, compassionate.
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Grid>

        <Grid
          size={{ xs: 12, lg: 5 }}
          px={4}
          sx={{
            display: "flex",
            justifyContent: {
              xs: "center",
              md: "center",
              lg: "flex-start",
              xl: "flex-start",
            },
            alignItems: "center",
          }}
        >
          <Grid container spacing={2}>
            {stats.map((s) => (
              <Grid key={s.label} size={{ xs: 12, sm: 6 }}>
                <Box display={"flex"} justifyContent={"center"}>
                  <Box
                    sx={{
                      p: 3,
                      border: `1px solid ${alpha("#C9A227", 0.25)}`,
                      borderRadius: 2,
                      bgcolor: alpha("#FFFFFF", 0.75),
                      backdropFilter: "blur(4px)",
                      textAlign: "center",
                      boxShadow: `0 12px 40px ${alpha("#0B3D91", 0.08)}`,
                      maxWidth: "340px",
                      width: "100%",
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        color: "secondary.main",
                        fontSize: "2.2rem",
                        mb: 0.5,
                      }}
                    >
                      {s.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: alpha("#0B3D91", 0.65),
                        fontSize: "0.75rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        fontFamily: "'Lato', sans-serif",
                        fontWeight: 700,
                      }}
                    >
                      {s.label}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

function ServicesSection() {
  const router = useRouter();
  return (
    <Box
      id="services"
      sx={{ py: { xs: 10, md: 14 }, bgcolor: "background.default" }}
    >
      <Container maxWidth="lg">
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
            What We Offer
          </Typography>
          <Typography
            variant="h2"
            sx={{
              color: "primary.dark",
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              mt: 1,
            }}
          >
            Occasions We Celebrate
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", maxWidth: 560, mx: "auto", mt: 2 }}
          >
            Each event is unique. Our platform connects you with the right
            people and services for every chapter of life.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {services.map((svc) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={svc.label}>
              <Card
                sx={{
                  height: "100%",
                  border: `1px solid`,
                  borderColor: alpha(svc.color, 0.18),
                  transition: "all 0.25s ease",
                  position: "relative",
                  overflow: "visible",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    borderColor: alpha(svc.color, 0.5),
                    boxShadow: `0 12px 40px ${alpha(svc.color, 0.12)}`,
                  },
                }}
              >
                {svc.tag && (
                  <Chip
                    label={svc.tag}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: -12,
                      right: 16,
                      bgcolor: "secondary.main",
                      color: "secondary.contrastText",
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.65rem",
                      letterSpacing: "0.08em",
                    }}
                  />
                )}
                <CardContent sx={{ p: 3.5 }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      bgcolor: alpha(svc.color, 0.1),
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 26,
                      mb: 2.5,
                    }}
                  >
                    {svc.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{ color: "primary.dark", mb: 1.5, fontSize: "1.35rem" }}
                  >
                    {svc.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.8 }}
                  >
                    {svc.description}
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() =>
                      router.push(`/services/?category_id=${svc.id}`)
                    }
                    sx={{
                      mt: 2.5,
                      color: svc.color,
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      letterSpacing: "0.1em",
                      p: 0,
                      "&:hover": { bgcolor: "transparent", opacity: 0.75 },
                    }}
                  >
                    Book This Event →
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

function HowItWorks() {
  return (
    <Box
      id="how-it-works"
      sx={{
        py: { xs: 10, md: 14 },
        bgcolor: "primary.dark",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative arc */}
      <Box
        sx={{
          position: "absolute",
          bottom: -200,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 800,
          borderRadius: "50%",
          border: `1px solid ${alpha("#C9A227", 0.07)}`,
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ textAlign: "center", mb: 9 }}>
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
            Simple Process
          </Typography>
          <Typography
            variant="h2"
            sx={{
              color: "primary.contrastText",
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              mt: 1,
            }}
          >
            How It Works
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {steps.map((step, i) => (
            <Grid size={{ xs: 12, md: 4 }} key={step.num}>
              <Box sx={{ textAlign: "center", position: "relative" }}>
                {i < steps.length - 1 && (
                  <Box
                    sx={{
                      display: { xs: "none", md: "block" },
                      position: "absolute",
                      top: 28,
                      left: "calc(50% + 36px)",
                      width: "calc(100% - 40px)",
                      height: 1,
                      bgcolor: alpha("#C9A227", 0.2),
                    }}
                  />
                )}
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    bgcolor: alpha("#C9A227", 0.15),
                    border: `1.5px solid ${alpha("#C9A227", 0.4)}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                  }}
                >
                  <Typography
                    sx={{
                      color: "secondary.main",
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 800,
                      fontSize: "0.8rem",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {step.num}
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: "primary.contrastText",
                    mb: 1.5,
                    fontSize: "1.3rem",
                  }}
                >
                  {step.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: alpha("#f5f7fa", 0.6),
                    maxWidth: 280,
                    mx: "auto",
                  }}
                >
                  {step.body}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: "center", mt: 8 }}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            href="#services"
            sx={{ px: 6, fontSize: "0.85rem" }}
          >
            Start Planning
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

function Testimonials() {
  return (
    <Box
      id="testimonials"
      sx={{ py: { xs: 10, md: 14 }, bgcolor: "background.default" }}
    >
      <Container maxWidth="lg">
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
            Stories
          </Typography>

          <Typography
            variant="h2"
            sx={{
              color: "primary.dark",
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              mt: 1,
            }}
          >
            What Families Say
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {testimonials.map((t) => (
            <Grid size={{ xs: 12, md: 4 }} key={t.name}>
              <Box
                sx={{
                  p: 4,
                  height: "100%",
                  border: "1px solid",
                  borderColor: alpha("#0B3D91", 0.12),
                  borderRadius: 3,
                  position: "relative",
                  bgcolor: "background.paper",
                  overflow: "hidden",
                  "&::before": {
                    content: '"“"',
                    position: "absolute",
                    top: 12,
                    left: 24,
                    fontSize: "6rem",
                    fontFamily: "'Cormorant Garamond', serif",
                    color: alpha("#0B3D91", 0.08),
                    lineHeight: 1,
                    zIndex: 0,
                  },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    color: "text.primary",
                    mt: 4,
                    mb: 3,
                    fontStyle: "italic",
                    lineHeight: 1.9,
                  }}
                >
                  {t.quote}
                </Typography>

                <Box
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    borderTop: "1px solid",
                    borderColor: alpha("#0B3D91", 0.1),
                    pt: 2,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: "primary.main",
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    {t.name}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontFamily: "'Lato', sans-serif",
                    }}
                  >
                    {t.event}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

function CTASection() {
  return (
    <Box
      id="contact"
      sx={{
        py: { xs: 10, md: 14 },
        bgcolor: "secondary.main",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 70% 50%, ${alpha("#F2D675", 0.35)} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <Container
        maxWidth="md"
        sx={{ position: "relative", zIndex: 1, textAlign: "center" }}
      >
        <Typography
          variant="h2"
          sx={{
            color: "secondary.contrastText",
            fontSize: { xs: "2.5rem", md: "4rem" },
            mb: 2,
          }}
        >
          Ready to Begin?
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: alpha("#111", 0.7),
            mb: 5,
            fontSize: "1.1rem",
            maxWidth: 520,
            mx: "auto",
          }}
        >
          Tell us about your event and we'll match you with the perfect team to
          make it unforgettable.
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
        >
          <Button
            variant="contained"
            color="primary"
            size="large"
            href="#services"
            sx={{ px: 6, fontSize: "0.85rem" }}
          >
            Book an Event
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{
              px: 6,
              fontSize: "0.85rem",
              color: "primary.dark",
              borderColor: "primary.dark",
              "&:hover": { bgcolor: alpha("#072a63", 0.08) },
            }}
          >
            Talk to Us
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}

export default function LandingPage() {
  return (
    <>
      <main>
        <Hero />
        <ServicesSection />
        <HowItWorks />
        <Testimonials />
        <CTASection />
      </main>
    </>
  );
}
