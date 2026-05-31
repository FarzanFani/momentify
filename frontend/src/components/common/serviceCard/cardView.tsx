"use client";

import { CompanyServices } from "@/services/provider/services";
import { formatDuration, formatPrice } from "@/utils/helperFunctions";
import {
  AccessTime,
  Business,
  EventAvailable,
  Groups,
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

const secondaryButtonSx = {
  borderRadius: 3,
  py: 1.2,
  fontWeight: 800,
  textTransform: "none",
  color: "#0B3D91",
  borderColor: "rgba(11, 61, 145, 0.28)",
  backgroundColor: "rgba(11, 61, 145, 0.04)",
  "&:hover": {
    borderColor: "#0B3D91",
    backgroundColor: "rgba(11, 61, 145, 0.08)",
  },
};

export default function ServiceCardView({
  service,
  isPublic = true,
}: {
  service: CompanyServices;
  isPublic: boolean;
}) {
  const router = useRouter();

  const hasBookNow = isPublic;

  return (
    <Card
      sx={{
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
          label={service.is_active ? "Active" : "Inactive"}
          size="small"
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color: "#fff",
            fontWeight: 700,
            backgroundColor: service.is_active
              ? "rgba(46, 204, 113, 0.95)"
              : "rgba(158, 158, 158, 0.95)",
          }}
        />

        <Chip
          label={service.category_name}
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
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: "#1f1b2d",
                lineHeight: 1.25,
                mb: 0.5,
              }}
            >
              {service.name}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <Business sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                {service.company_name}
              </Typography>
            </Stack>
          </Box>

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
            {service.description}
          </Typography>

          <Divider />

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6 }}>
              <InfoItem
                icon={<AccessTime />}
                label="Duration"
                value={formatDuration(service.duration_minutes)}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <InfoItem
                icon={<Groups />}
                label="Capacity"
                value={`${service.max_capacity} guests`}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <InfoItem
                icon={<EventAvailable />}
                label="Before Buffer"
                value={`${service.buffer_before_minutes} min`}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <InfoItem
                icon={<EventAvailable />}
                label="After Buffer"
                value={`${service.buffer_after_minutes} min`}
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
                {formatPrice(service.price)}
              </Typography>
            </Stack>

            <Typography variant="caption" color="secondary.dark">
              starting price
            </Typography>
          </Box>
        </Stack>
      </CardContent>

      <CardActions
        sx={{
          px: { xs: 2.5, sm: 3 },
          pb: 3,
          pt: 0,
          gap: 1.5,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          sx={hasBookNow ? secondaryButtonSx : primaryButtonSx}
          onClick={() =>
            router.push(
              !isPublic
                ? `/provider/services/${service.id}/preview`
                : `/services/${service.id}/preview`,
            )
          }
        >
          View Details
        </Button>

        {isPublic && (
          <Button
            fullWidth
            variant="contained"
            sx={primaryButtonSx}
            // onClick={() =>
            //   router.push(
            //     "/provider/services/62ecf176-42f4-4775-a149-0057d54ecbda/preview",
            //   )
            // }
          >
            Book Now
          </Button>
        )}
      </CardActions>
    </Card>
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
