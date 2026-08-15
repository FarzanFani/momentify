"use client";

import Breadcrumb from "@/components/common/breadcrumb/Breadcrumb";
import { useGetSingleProviderPackage } from "@/hooks/service";
import { ServicePackage } from "@/services/provider/services";
import { formatPrice } from "@/utils/helperFunctions";
import {
  Business,
  Category,
  CalendarMonth,
  Edit,
  Inventory2,
  Payments,
} from "@mui/icons-material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
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
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

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

export default function PackageDetailPage({ uuid }: { uuid: string }) {
  const { data: servicePackage, isLoading: isPackageLoading } =
    useGetSingleProviderPackage(uuid);

  return isPackageLoading ? (
    <PackageDetailPageSkeleton />
  ) : servicePackage ? (
    <PackageDetailMainView servicePackage={servicePackage} />
  ) : (
    <PackageUnavailableView />
  );
}

function PackageDetailMainView({
  servicePackage,
}: {
  servicePackage: ServicePackage;
}) {
  const router = useRouter();

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
        <Typography variant="h4" fontWeight={700} color="primary.main">
          Preview Package
        </Typography>
      </Box>

      <Box sx={{ width: "90%" }}>
        <Breadcrumb
          items={[
            { label: "Packages", href: "/provider/packages" },
            { label: servicePackage.name },
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
                <Chip
                  label={
                    PRICING_METHOD_LABEL[servicePackage.pricing_method] ??
                    servicePackage.pricing_method
                  }
                  size="small"
                  sx={{
                    fontWeight: 800,
                    color: "#111",
                    backgroundColor: "rgba(242, 214, 117, 0.95)",
                  }}
                />

                <Chip
                  label={servicePackage.category_name}
                  size="small"
                  sx={{
                    textTransform: "capitalize",
                    fontWeight: 800,
                    color: "#fff",
                    backgroundColor: "rgba(255,255,255,0.22)",
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
                  {servicePackage.name}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mt: 1, opacity: 0.95 }}
                >
                  <Business sx={{ fontSize: 20 }} />
                  <Typography variant="body1">
                    {servicePackage.company_name}
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
                Package pricing
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  color: "primary.main",
                  fontWeight: 900,
                  lineHeight: 1.1,
                }}
              >
                {getPricingValueLabel(servicePackage)}
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() =>
                  router.push(`/provider/packages/${servicePackage.id}/edit`)
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
                Edit Package
              </Button>
            </Stack>
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
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 900, color: "primary.main", mb: 1 }}
                >
                  About this package
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ lineHeight: 1.8 }}
                >
                  {servicePackage.description ||
                    "No description available for this package."}
                </Typography>
              </Box>

              <Divider />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <DetailInfoCard
                    icon={<Payments />}
                    label="Full payment"
                    value={servicePackage.allow_full_payment ? "Allowed" : "Not allowed"}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <DetailInfoCard
                    icon={<Payments />}
                    label="Deposit"
                    value={
                      servicePackage.deposit_percentage
                        ? `${servicePackage.deposit_percentage}%`
                        : "Not available"
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <DetailInfoCard
                    icon={<Payments />}
                    label="Installment"
                    value={
                      servicePackage.installment_amount
                        ? `${formatPrice(servicePackage.installment_amount)} / ${servicePackage.installment_interval}`
                        : "Not available"
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <DetailInfoCard
                    icon={<CalendarMonth />}
                    label="Late scheduling"
                    value={
                      servicePackage.allow_scheduling_late
                        ? "Allowed"
                        : "Not allowed"
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <DetailInfoCard
                    icon={<Business />}
                    label="Company"
                    value={servicePackage.company_name}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <DetailInfoCard
                    icon={<Category />}
                    label="Category"
                    value={servicePackage.category_name}
                  />
                </Grid>
              </Grid>

              <Divider />

              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 900, color: "primary.main", mb: 2 }}
                >
                  Included services
                </Typography>

                <Stack spacing={1.5}>
                  {servicePackage.services.map((item, index) => (
                    <Box
                      key={`${item.service}-${index}`}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: "#fff",
                        border: "1px solid rgba(11, 61, 145, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Inventory2 sx={{ color: "primary.main" }} />
                        <Box>
                          <Typography sx={{ fontWeight: 800, color: "#1f2937" }}>
                            {item.service_name ?? item.service}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Quantity: {item.quantity}
                            {item.price ? ` · ${formatPrice(item.price)}` : ""}
                          </Typography>
                        </Box>
                      </Stack>

                      <Chip
                        label={item.required ? "Required" : "Optional"}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          backgroundColor: item.required
                            ? "rgba(11, 61, 145, 0.1)"
                            : "rgba(201, 162, 39, 0.18)",
                          color: item.required ? "primary.main" : "secondary.dark",
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>

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
                  sx={{ color: "secondary.dark", fontWeight: 900, mb: 0.5 }}
                >
                  Package ID
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    wordBreak: "break-all",
                    fontFamily: "monospace",
                  }}
                >
                  {servicePackage.id}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
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
            "& svg": { fontSize: 22 },
          }}
        >
          {icon}
        </Box>

        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
          {label}
        </Typography>

        <Typography variant="body1" sx={{ color: "#1f2937", fontWeight: 900 }}>
          {value}
        </Typography>
      </Stack>
    </Box>
  );
}

function PackageDetailPageSkeleton() {
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
                  width={100}
                  height={28}
                  sx={{ bgcolor: "rgba(255,255,255,0.35)", borderRadius: 999 }}
                />
                <Skeleton
                  variant="rounded"
                  width={112}
                  height={28}
                  sx={{ bgcolor: "rgba(255,255,255,0.35)", borderRadius: 999 }}
                />
              </Stack>

              <Box>
                <Skeleton
                  variant="text"
                  width="55%"
                  height={52}
                  sx={{ bgcolor: "rgba(255,255,255,0.35)" }}
                />

                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
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

            <Skeleton variant="rounded" width={160} height={46} sx={{ borderRadius: 3 }} />
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
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack spacing={3}>
              <Box>
                <Skeleton variant="text" width={180} height={32} />
                <Skeleton variant="text" width="100%" height={26} />
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
                        <Skeleton variant="rounded" width={42} height={42} sx={{ borderRadius: 2.5 }} />
                        <Skeleton variant="text" width="45%" height={20} />
                        <Skeleton variant="text" width="65%" height={28} />
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

export function PackageUnavailableView() {
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
                sx={{ fontWeight: 800, color: "#072a63", mb: 1 }}
              >
                Package is currently unavailable
              </Typography>

              <Typography
                variant="body1"
                sx={{ color: "text.secondary", lineHeight: 1.7 }}
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
                "&:hover": { backgroundColor: "#072a63" },
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
