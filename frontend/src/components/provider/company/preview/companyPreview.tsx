"use client";

import { useGetCompanyById, useGetCompanyLocations } from "@/hooks/company";
import Breadcrumb from "@/components/common/breadcrumb/Breadcrumb";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import {
  Business,
  Edit,
  Email,
  Phone,
  Public,
  Policy,
  CheckCircle,
  Cancel,
  LocationOn,
} from "@mui/icons-material";

interface CompanyPreviewProps {
  companyId: string;
}

const verificationColor: Record<string, "warning" | "success" | "error"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
};

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 1 }}>
      <Box sx={{ color: "primary.main", mt: 0.3 }}>{icon}</Box>
      <Box>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
        <Typography variant="body1">{value}</Typography>
      </Box>
    </Box>
  );
}

export default function CompanyPreview({ companyId }: CompanyPreviewProps) {
  const router = useRouter();
  const { data: company, isLoading } = useGetCompanyById(companyId);
  const { data: locationsData } = useGetCompanyLocations(companyId);
  const locations = locationsData?.results;

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!company) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography color="text.secondary" fontWeight={600}>
          Company not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 3,
        gap: 2,
      }}
    >
      <Box sx={{ width: "90%", maxWidth: 900 }}>
        <Breadcrumb
          items={[
            { label: "Companies", href: "/provider/company" },
            { label: company.name },
          ]}
        />
      </Box>
      <Card sx={{ width: "90%", maxWidth: 900, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h4"
              fontWeight={700}
              color="primary.main"
            >
              {company.name}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Chip
                label={company.verification_status}
                color={verificationColor[company.verification_status] ?? "default"}
                size="medium"
                sx={{ fontWeight: 600 }}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<Edit />}
                onClick={() => router.push(`/provider/company/${companyId}/edit`)}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                Edit
              </Button>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <InfoRow
                icon={<Email fontSize="small" />}
                label="Email"
                value={company.email}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <InfoRow
                icon={<Phone fontSize="small" />}
                label="Phone Number"
                value={company.phone_number || "—"}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <InfoRow
                icon={<Public fontSize="small" />}
                label="Timezone"
                value={company.timezone}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <InfoRow
                icon={
                  company.auto_approve_booking ? (
                    <CheckCircle fontSize="small" />
                  ) : (
                    <Cancel fontSize="small" />
                  )
                }
                label="Auto-approve Bookings"
                value={company.auto_approve_booking ? "Yes" : "No"}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <InfoRow
                icon={<Business fontSize="small" />}
                label="Description"
                value={company.description || "—"}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <InfoRow
                icon={<Policy fontSize="small" />}
                label="Cancellation Policy"
                value={company.cancellation_policy_text || "—"}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3, borderColor: "black" }} />

          <Typography variant="h5" fontWeight={700} color="primary.main" mb={2}>
            Locations
          </Typography>

          {!locations || locations.length === 0 ? (
            <Typography color="text.secondary">
              No locations registered yet.
            </Typography>
          ) : (
            locations.map((location, index) => (
              <Box key={location.id}>
                {index > 0 && <Divider sx={{ my: 2, borderColor: "grey.300" }} />}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoRow
                      icon={<LocationOn fontSize="small" />}
                      label="Address"
                      value={location.address}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <InfoRow
                      icon={<Business fontSize="small" />}
                      label="City"
                      value={location.city}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <InfoRow
                      icon={<Public fontSize="small" />}
                      label="Country"
                      value={location.country}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoRow
                      icon={<LocationOn fontSize="small" />}
                      label="Latitude"
                      value={location.latitude}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoRow
                      icon={<LocationOn fontSize="small" />}
                      label="Longitude"
                      value={location.longitude}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
