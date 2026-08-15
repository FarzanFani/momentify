"use client";

import { ServicePackage } from "@/services/provider/services";
import { formatPrice } from "@/utils/helperFunctions";
import {
  CalendarMonth,
  CheckCircle,
  Inventory2,
  Payments,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

type InfoItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
};

const primaryButtonSx = {
  borderRadius: 3,
  py: 1.2,
  fontWeight: 800,
  textTransform: "none",
  color: "#fff",
  background: "linear-gradient(135deg, #0B3D91 0%, #2F5FB3 65%, #C9A227 100%)",
  boxShadow: "0 8px 18px rgba(124, 77, 255, 0.3)",
  "&:hover": {
    background:
      "linear-gradient(135deg, #072a63 0%, #0B3D91 60%, #8C6A12 100%)",
  },
};

const stackLayerSx = (depth: number) => ({
  position: "absolute" as const,
  inset: 0,
  borderRadius: 4,
  transform: `translate(${depth * 8}px, ${depth * 4}px)`,
  zIndex: -depth,
  background:
    depth === 1
      ? "linear-gradient(180deg, #eef1fb 0%, #e4e9f8 100%)"
      : "linear-gradient(180deg, #e2e7f6 0%, #d7def2 100%)",
  border: "1px solid rgba(11, 61, 145, 0.10)",
  boxShadow: "0 10px 24px rgba(35, 25, 66, 0.08)",
});

const PRICING_METHOD_LABEL: Record<string, string> = {
  service_total: "Sum of services",
  fixed_price: "Fixed price",
  percentage_discount: "Percentage discount",
  fixed_discount: "Fixed discount",
};

function getPricingValueLabel(servicePackage: ServicePackage) {
  switch (servicePackage.pricing_method) {
    case "fixed_price":
      return servicePackage.fixed_price
        ? formatPrice(servicePackage.fixed_price)
        : "-";
    case "percentage_discount":
      return servicePackage.percentage_discount
        ? `${servicePackage.percentage_discount}% off`
        : "-";
    case "fixed_discount":
      return servicePackage.fixed_discount
        ? `${formatPrice(servicePackage.fixed_discount)} off`
        : "-";
    default:
      return "Sum of services";
  }
}

function getPaymentOptionsLabel(servicePackage: ServicePackage) {
  const options: string[] = [];
  if (servicePackage.allow_full_payment) options.push("Full payment");
  if (servicePackage.deposit_percentage) options.push("Deposit");
  if (servicePackage.installment_amount) options.push("Installments");
  return options.length > 0 ? options.join(", ") : "-";
}

export default function PackageCardView({
  servicePackage,
}: {
  servicePackage: ServicePackage;
}) {
  const router = useRouter();

  const serviceCount = servicePackage.services?.length ?? 0;
  const requiredCount =
    servicePackage.services?.filter((item) => item.required).length ?? 0;

  return (
    <Box sx={{ position: "relative", height: "100%", width: "100%" }}>
      <Box sx={stackLayerSx(2)} />
      <Box sx={stackLayerSx(1)} />

      <Card
        sx={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          width: "100%",
          borderRadius: 4,
          minHeight: 430,
          overflow: "hidden",
          background: "linear-gradient(180deg, #ffffff 0%, #faf7ff 100%)",
          boxShadow: "0 14px 40px rgba(35, 25, 66, 0.12)",
          border: "1px solid rgba(124, 77, 255, 0.12)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: "0 20px 55px rgba(35, 25, 66, 0.18)",
          },
        }}
      >
        <Box
          sx={{
            height: 110,
            background:
              "linear-gradient(135deg, #072a63 0%, #0B3D91 45%, #2F5FB3 72%, #C9A227 100%)",
            position: "relative",
          }}
        >
          <Chip
            label={
              PRICING_METHOD_LABEL[servicePackage.pricing_method] ??
              servicePackage.pricing_method
            }
            size="small"
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              color: "#fff",
              fontWeight: 700,
              backgroundColor: "rgba(255,255,255,0.22)",
            }}
          />

          <Chip
            label={`${serviceCount} service${serviceCount === 1 ? "" : "s"}`}
            size="small"
            sx={{
              position: "absolute",
              bottom: 16,
              left: 16,
              textTransform: "capitalize",
              fontWeight: 700,
              backgroundColor: "rgba(255,255,255,0.9)",
              color: "#5e35b1",
            }}
          />
        </Box>

        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack spacing={1.5}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: "#1f1b2d",
                lineHeight: 1.25,
              }}
            >
              {servicePackage.name}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                minHeight: 42,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {servicePackage.description}
            </Typography>

            <Divider />

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6 }}>
                <InfoItem
                  icon={<Inventory2 />}
                  label="Included services"
                  value={serviceCount}
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <InfoItem
                  icon={<CheckCircle />}
                  label="Required services"
                  value={requiredCount}
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <InfoItem
                  icon={<Payments />}
                  label="Payment options"
                  value={getPaymentOptionsLabel(servicePackage)}
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <InfoItem
                  icon={<CalendarMonth />}
                  label="Late scheduling"
                  value={
                    servicePackage.allow_scheduling_late
                      ? "Allowed"
                      : "Not allowed"
                  }
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                mt: 1,
                p: 2,
                borderRadius: 3,
                background:
                  "linear-gradient(135deg, rgba(11, 61, 145, 0.08) 0%, rgba(201, 162, 39, 0.14) 100%)",
                border: "1px solid rgba(11, 61, 145, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexDirection: "row-reverse",
              }}
            >
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 900,
                    color: "primary.main",
                  }}
                >
                  {getPricingValueLabel(servicePackage)}
                </Typography>
              </Stack>

              <Typography variant="caption" color="secondary.dark">
                package pricing
              </Typography>
            </Box>
          </Stack>
        </CardContent>

        <CardActions
          sx={{
            px: { xs: 2.5, sm: 3 },
            pb: 3,
            pt: 0,
          }}
        >
          <Button
            fullWidth
            variant="contained"
            sx={primaryButtonSx}
            onClick={() =>
              router.push(`/provider/packages/${servicePackage.id}/preview`)
            }
          >
            View Details
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <Box
      sx={{
        p: 1.4,
        borderRadius: 2.5,
        backgroundColor: "#fff",
        border: "1px solid rgba(0,0,0,0.06)",
        height: "100%",
      }}
    >
      <Stack spacing={0.7}>
        <Box
          sx={{
            color: "primary.main",
            display: "flex",
            "& svg": {
              fontSize: 20,
            },
          }}
        >
          {icon}
        </Box>

        <Typography
          variant="caption"
          color="secondary.dark"
          sx={{ lineHeight: 1 }}
        >
          {label}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            fontWeight: 800,
            color: "#1f1b2d",
          }}
        >
          {value}
        </Typography>
      </Stack>
    </Box>
  );
}
