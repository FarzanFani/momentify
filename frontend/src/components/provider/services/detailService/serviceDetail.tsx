"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {
  AccessTime,
  Business,
  Category,
  Edit,
  EventAvailable,
  Groups,
} from "@mui/icons-material";
import { formatDuration, formatPrice } from "@/utils/helperFunctions";
import { CompanyServices } from "@/services/provider/services";
import Breadcrumb from "@/components/common/breadcrumb/Breadcrumb";
import { getStatusChip } from "@/components/common/statusChip/statusChip";
import { useGetSingleProviderService } from "@/hooks/service";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { useRouter } from "next/navigation";

export default function ServiceDetailPage({ uuid }: { uuid: string }) {
  const { data: service, isLoading: isServiceLoading } =
    useGetSingleProviderService(uuid);

  return isServiceLoading ? (
    <ServiceDetailPageSkeleton />
  ) : service ? (
    <ServiceDetailMainView service={service} />
  ) : (
    <ServiceUnavailableView />
  );
}

function ServiceDetailMainView({ service }: { service: CompanyServices }) {
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();

  return (
    <>
      <Box
        sx={{
          width: "100%",
          minHeight: "100%",
          px: { xs: 2, sm: 3 },
          py: 3,
          background: "linear-gradient(180deg, #F7FAFF 0%, #ffffff 100%)",
        }}
      >
        <Box sx={{ width: "90%" }}>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            Preview Service
          </Typography>
        </Box>

        <Box sx={{ width: "90%" }}>
          <Breadcrumb
            items={[
              { label: "Services", href: "/provider/services" },
              { label: service.name },
            ]}
          />
        </Box>
        <Stack spacing={3}>
          <Card
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid rgba(11, 61, 145, 0.12)",
              boxShadow: "0 14px 40px rgba(7, 42, 99, 0.12)",
            }}
          >
            <Box
              sx={{
                minHeight: 190,
                p: { xs: 2.5, sm: 4 },
                background:
                  "linear-gradient(135deg, #072a63 0%, #0B3D91 45%, #2F5FB3 72%, #C9A227 100%)",
                color: "#fff",
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              <Stack spacing={2} sx={{ width: "100%" }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                >
                  {getStatusChip(service.is_active ? "ACTIVE" : "INACTIVE", {
                    sx: { fontWeight: 800 },
                  })}

                  <Chip
                    label={service.category_name}
                    size="small"
                    sx={{
                      textTransform: "capitalize",
                      fontWeight: 800,
                      color: "#111",
                      backgroundColor: "rgba(242, 214, 117, 0.95)",
                    }}
                  />
                </Stack>

                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 900,
                      lineHeight: 1.2,
                      fontSize: { xs: 28, sm: 36 },
                    }}
                  >
                    {service.name}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mt: 1, opacity: 0.95 }}
                  >
                    <Business sx={{ fontSize: 20 }} />
                    <Typography variant="body1">
                      {service.company_name}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </Box>

            <Box
              sx={{
                p: { xs: 2.5, sm: 3 },
                display: "flex",
                alignItems: { xs: "stretch", sm: "center" },
                justifyContent: "space-between",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
                background:
                  "linear-gradient(135deg, rgba(11, 61, 145, 0.06) 0%, rgba(201, 162, 39, 0.12) 100%)",
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "secondary.dark",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                  }}
                >
                  Starting price
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    color: "primary.main",
                    fontWeight: 900,
                    lineHeight: 1.1,
                  }}
                >
                  {formatPrice(service.price)}
                </Typography>
              </Box>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() =>
                    router.push(`/provider/services/${service.id}/edit`)
                  }
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1.2,
                    fontWeight: 800,
                    textTransform: "none",
                    color: "primary.main",
                    borderColor: "primary.main",
                    "&:hover": {
                      borderColor: "primary.dark",
                      backgroundColor: "rgba(11, 61, 145, 0.06)",
                    },
                  }}
                >
                  Edit Service
                </Button>
              </Stack>
            </Box>
          </Card>

          {/* Tabs */}
          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid rgba(11, 61, 145, 0.12)",
              boxShadow: "0 14px 40px rgba(7, 42, 99, 0.08)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                borderBottom: "1px solid rgba(11, 61, 145, 0.12)",
                px: { xs: 1, sm: 2 },
                backgroundColor: "#fff",
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(_, value) => setActiveTab(value)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 800,
                    minHeight: 64,
                  },
                  "& .Mui-selected": {
                    color: "primary.main",
                  },
                  "& .MuiTabs-indicator": {
                    height: 4,
                    borderRadius: 4,
                    background:
                      "linear-gradient(135deg, #0B3D91 0%, #C9A227 100%)",
                  },
                }}
              >
                <Tab label="Service Details" />
                <Tab label="Booking History" />
              </Tabs>
            </Box>

            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              {activeTab === 0 && <ServiceDetailsTab service={service} />}
              {activeTab === 1 && <BookingHistoryTab />}
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </>
  );
}

function ServiceDetailsTab({ service }: { service: CompanyServices }) {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 900,
            color: "primary.main",
            mb: 1,
          }}
        >
          About this service
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            lineHeight: 1.8,
          }}
        >
          {service.description || "No description available for this service."}
        </Typography>
      </Box>

      <Divider />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <DetailInfoCard
            icon={<AccessTime />}
            label="Duration"
            value={formatDuration(service.duration_minutes)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <DetailInfoCard
            icon={<Groups />}
            label="Maximum Capacity"
            value={`${service.max_capacity} guests`}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <DetailInfoCard
            icon={<Category />}
            label="Category"
            value={service.category}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <DetailInfoCard
            icon={<EventAvailable />}
            label="Buffer Before"
            value={`${service.buffer_before_minutes} minutes`}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <DetailInfoCard
            icon={<EventAvailable />}
            label="Buffer After"
            value={`${service.buffer_after_minutes} minutes`}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <DetailInfoCard
            icon={<Business />}
            label="Company"
            value={service.company}
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          p: 2.5,
          borderRadius: 3,
          background:
            "linear-gradient(135deg, rgba(11, 61, 145, 0.06) 0%, rgba(201, 162, 39, 0.12) 100%)",
          border: "1px solid rgba(11, 61, 145, 0.12)",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            color: "secondary.dark",
            fontWeight: 900,
            mb: 0.5,
          }}
        >
          Service ID
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            wordBreak: "break-all",
            fontFamily: "monospace",
          }}
        >
          {service.id}
        </Typography>
      </Box>
    </Stack>
  );
}

function DetailInfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Box
      sx={{
        height: "100%",
        p: 2,
        borderRadius: 3,
        backgroundColor: "#fff",
        border: "1px solid rgba(11, 61, 145, 0.1)",
        boxShadow: "0 8px 24px rgba(7, 42, 99, 0.06)",
      }}
    >
      <Stack spacing={1}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "primary.main",
            background:
              "linear-gradient(135deg, rgba(11, 61, 145, 0.08) 0%, rgba(201, 162, 39, 0.16) 100%)",
            "& svg": {
              fontSize: 22,
            },
          }}
        >
          {icon}
        </Box>

        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: 700,
          }}
        >
          {label}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "#1f2937",
            fontWeight: 900,
            textTransform: label === "Category" ? "capitalize" : "none",
          }}
        >
          {value}
        </Typography>
      </Stack>
    </Box>
  );
}

function BookingHistoryTab() {
  return (
    <Box
      sx={{
        minHeight: 260,
        borderRadius: 3,
        border: "1px dashed rgba(11, 61, 145, 0.25)",
        background:
          "linear-gradient(135deg, rgba(11, 61, 145, 0.04) 0%, rgba(201, 162, 39, 0.08) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 3,
      }}
    >
      <Stack spacing={1}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 900,
            color: "primary.main",
          }}
        >
          No booking history yet
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Booking history will appear here once customers start booking this
          service.
        </Typography>
      </Stack>
    </Box>
  );
}

function ServiceDetailPageSkeleton() {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        px: { xs: 2, sm: 3 },
        py: 3,
        background: "linear-gradient(180deg, #F7FAFF 0%, #ffffff 100%)",
      }}
    >
      <Box sx={{ width: "90%" }}>
        <Skeleton variant="text" width={260} height={48} sx={{ mb: 1 }} />
      </Box>

      <Box sx={{ width: "90%", mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Skeleton variant="text" width={80} height={24} />
          <Skeleton variant="text" width={12} height={24} />
          <Skeleton variant="text" width={160} height={24} />
        </Stack>
      </Box>

      <Stack spacing={3}>
        <Card
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid rgba(11, 61, 145, 0.12)",
            boxShadow: "0 14px 40px rgba(7, 42, 99, 0.12)",
          }}
        >
          <Box
            sx={{
              minHeight: 190,
              p: { xs: 2.5, sm: 4 },
              background:
                "linear-gradient(135deg, #072a63 0%, #0B3D91 45%, #2F5FB3 72%, #C9A227 100%)",
              display: "flex",
              alignItems: "flex-end",
            }}
          >
            <Stack spacing={2} sx={{ width: "100%" }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Skeleton
                  variant="rounded"
                  width={72}
                  height={28}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.35)",
                    borderRadius: 999,
                  }}
                />
                <Skeleton
                  variant="rounded"
                  width={112}
                  height={28}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.35)",
                    borderRadius: 999,
                  }}
                />
              </Stack>

              <Box>
                <Skeleton
                  variant="text"
                  width="55%"
                  height={52}
                  sx={{ bgcolor: "rgba(255,255,255,0.35)" }}
                />

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mt: 1 }}
                >
                  <Skeleton
                    variant="circular"
                    width={20}
                    height={20}
                    sx={{ bgcolor: "rgba(255,255,255,0.35)" }}
                  />
                  <Skeleton
                    variant="text"
                    width={180}
                    height={28}
                    sx={{ bgcolor: "rgba(255,255,255,0.35)" }}
                  />
                </Stack>
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              p: { xs: 2.5, sm: 3 },
              display: "flex",
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "space-between",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
              background:
                "linear-gradient(135deg, rgba(11, 61, 145, 0.06) 0%, rgba(201, 162, 39, 0.12) 100%)",
            }}
          >
            <Box>
              <Skeleton variant="text" width={120} height={22} />
              <Skeleton variant="text" width={150} height={48} />
            </Box>

            <Skeleton
              variant="rounded"
              width={140}
              height={46}
              sx={{ borderRadius: 3 }}
            />
          </Box>
        </Card>

        <Card
          sx={{
            borderRadius: 4,
            border: "1px solid rgba(11, 61, 145, 0.12)",
            boxShadow: "0 14px 40px rgba(7, 42, 99, 0.08)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              borderBottom: "1px solid rgba(11, 61, 145, 0.12)",
              px: { xs: 1, sm: 2 },
              backgroundColor: "#fff",
            }}
          >
            <Stack
              direction="row"
              spacing={3}
              sx={{ minHeight: 64, alignItems: "center" }}
            >
              <Skeleton variant="text" width={130} height={32} />
              <Skeleton variant="text" width={130} height={32} />
            </Stack>
          </Box>

          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack spacing={3}>
              <Box>
                <Skeleton variant="text" width={180} height={32} />
                <Skeleton variant="text" width="100%" height={26} />
                <Skeleton variant="text" width="92%" height={26} />
                <Skeleton variant="text" width="76%" height={26} />
              </Box>

              <Divider />

              <Grid container spacing={2}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Box
                      sx={{
                        height: "100%",
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: "#fff",
                        border: "1px solid rgba(11, 61, 145, 0.1)",
                        boxShadow: "0 8px 24px rgba(7, 42, 99, 0.06)",
                      }}
                    >
                      <Stack spacing={1}>
                        <Skeleton
                          variant="rounded"
                          width={42}
                          height={42}
                          sx={{ borderRadius: 2.5 }}
                        />
                        <Skeleton variant="text" width="45%" height={20} />
                        <Skeleton variant="text" width="65%" height={28} />
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg, rgba(11, 61, 145, 0.06) 0%, rgba(201, 162, 39, 0.12) 100%)",
                  border: "1px solid rgba(11, 61, 145, 0.12)",
                }}
              >
                <Skeleton variant="text" width={100} height={24} />
                <Skeleton variant="text" width="55%" height={24} />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

export function ServiceUnavailableView() {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3 },
        py: 4,
        background: "linear-gradient(180deg, #F7FAFF 0%, #ffffff 100%)",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 560,
          borderRadius: 4,
          border: "1px solid rgba(11, 61, 145, 0.12)",
          boxShadow: "0 14px 40px rgba(7, 42, 99, 0.12)",
          textAlign: "center",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Stack spacing={2.5} alignItems="center">
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, rgba(201, 162, 39, 0.18) 0%, rgba(11, 61, 145, 0.08) 100%)",
                color: "#C9A227",
              }}
            >
              <WarningAmberRoundedIcon sx={{ fontSize: 42 }} />
            </Box>

            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: "#072a63",
                  mb: 1,
                }}
              >
                Service is currently unavailable
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.7,
                }}
              >
                Please refresh the page in a few minutes. If the issue still
                exists, contact the administrator.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => window.location.reload()}
              sx={{
                mt: 1,
                borderRadius: 3,
                px: 3,
                py: 1.2,
                textTransform: "none",
                fontWeight: 700,
                backgroundColor: "#0B3D91",
                "&:hover": {
                  backgroundColor: "#072a63",
                },
              }}
            >
              Refresh page
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
