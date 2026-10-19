"use client";

import type { ApiResponse } from "@/types/general";
import type { AxiosError } from "axios";
import Breadcrumb from "@/components/common/breadcrumb/Breadcrumb";
import InputField from "@/components/common/input/InputField";
import { PackageUnavailableView } from "@/components/provider/packages/packageDetail/packageDetail";
import {
  useGetSinglePublicPackage,
  usePostPackageCalculatePrice,
} from "@/hooks/service";
import type { ServicePackage } from "@/services/provider/services";
import { extractApiError } from "@/utils/extractApiError";
import { formatPrice } from "@/utils/helperFunctions";
import {
  getInstallmentLabel,
  getPricingValueLabel,
} from "@/utils/packagePricing";
import { Business, CheckCircle } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PublicPackagePreviewPage({ uuid }: { uuid: string }) {
  const { data: servicePackage, isLoading } = useGetSinglePublicPackage(uuid);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  return servicePackage ? (
    <PackagePreview servicePackage={servicePackage} />
  ) : (
    <PackageUnavailableView />
  );
}

function PackagePreview({ servicePackage }: { servicePackage: ServicePackage }) {
  const included = servicePackage.services.filter((item) => item.required);
  const addons = servicePackage.services.filter((item) => !item.required);
  const router = useRouter();
  const hasSavings = Number(servicePackage.savings) > 0;
  const installmentLabel = getInstallmentLabel(servicePackage);

  const [guestCount, setGuestCount] = useState<string>(
    String(servicePackage.included_guests),
  );
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const {
    mutate: calculatePrice,
    data: calculation,
    error,
    isPending,
  } = usePostPackageCalculatePrice();

  useEffect(() => {
    const guests = Number(guestCount);
    if (!Number.isInteger(guests) || guests < 1) return;

    const timeout = setTimeout(() => {
      calculatePrice({
        packageId: servicePackage.id,
        guest_count: guests,
        addons: selectedAddons,
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [guestCount, selectedAddons, servicePackage.id, calculatePrice]);

  const toggleAddon = (id: string, checked: boolean) =>
    setSelectedAddons((current) =>
      checked ? [...current, id] : current.filter((addon) => addon !== id),
    );

  const paymentOptions = [
    servicePackage.allow_full_payment && "Pay in full",
    servicePackage.deposit_percentage &&
      `${Number(servicePackage.deposit_percentage)}% deposit`,
    installmentLabel && `Installments: ${installmentLabel}`,
  ].filter(Boolean) as string[];

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      <Breadcrumb
        items={[
          { label: "Packages", href: "/packages" },
          { label: servicePackage.name },
        ]}
      />

      <Card
        sx={{
          mt: 2,
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid rgba(11, 61, 145, 0.12)",
        }}
      >
        <Box
          sx={{
            minHeight: servicePackage.cover_image ? 280 : 180,
            p: { xs: 2.5, sm: 4 },
            color: "#fff",
            display: "flex",
            alignItems: "flex-end",
            background: servicePackage.cover_image
              ? `linear-gradient(180deg, rgba(7, 42, 99, 0.1) 0%, rgba(7, 42, 99, 0.8) 100%), url(${servicePackage.cover_image}) center / cover`
              : "linear-gradient(135deg, #072a63 0%, #0B3D91 45%, #2F5FB3 72%, #C9A227 100%)",
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 900, fontSize: { xs: 28, sm: 36 } }}
            >
              {servicePackage.name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" mt={1}>
              <Business sx={{ fontSize: 20 }} />
              <Typography>{servicePackage.company_name}</Typography>
            </Stack>
          </Box>
        </Box>
      </Card>

      <Grid container spacing={3} mt={1}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" fontWeight={900} color="primary.main">
                About this package
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                {servicePackage.description}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="h6"
                fontWeight={900}
                color="primary.main"
                mb={1}
              >
                Included
              </Typography>
              <Stack spacing={1}>
                {included.map((item) => (
                  <Stack
                    key={item.id}
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                  >
                    <CheckCircle sx={{ color: "success.main" }} />
                    <Typography fontWeight={700}>
                      {item.quantity > 1
                        ? `${item.quantity} × ${item.service_name}`
                        : item.service_name}
                    </Typography>
                    {item.service_category_name && (
                      <Typography variant="body2" color="text.secondary">
                        {item.service_category_name}
                      </Typography>
                    )}
                  </Stack>
                ))}
              </Stack>
            </Box>

            {paymentOptions.length > 0 && (
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={900}
                  color="primary.main"
                  mb={1}
                >
                  Payment options
                </Typography>
                <Stack spacing={0.5}>
                  {paymentOptions.map((option) => (
                    <Typography key={option} color="text.secondary">
                      {`• ${option}`}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid rgba(11, 61, 145, 0.12)",
              boxShadow: "0 14px 40px rgba(7, 42, 99, 0.08)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="baseline">
                    <Typography
                      variant="h4"
                      fontWeight={900}
                      color="primary.main"
                    >
                      {formatPrice(Number(servicePackage.total_price))}
                    </Typography>
                    {hasSavings && (
                      <Typography
                        color="text.secondary"
                        sx={{ textDecoration: "line-through" }}
                      >
                        {formatPrice(Number(servicePackage.services_subtotal))}
                      </Typography>
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {`For up to ${servicePackage.included_guests} guest${servicePackage.included_guests === 1 ? "" : "s"}`}
                    {hasSavings &&
                      ` · ${getPricingValueLabel(servicePackage)}, save ${formatPrice(Number(servicePackage.savings))}`}
                  </Typography>
                </Box>

                <Divider />

                <InputField
                  label="Number of guests"
                  type="number"
                  value={guestCount}
                  onChange={(value) => setGuestCount(String(value ?? ""))}
                  helperText={[
                    Number(servicePackage.price_per_extra_guest) > 0
                      ? `${formatPrice(Number(servicePackage.price_per_extra_guest))} per guest above ${servicePackage.included_guests}`
                      : null,
                    servicePackage.max_guests
                      ? `max ${servicePackage.max_guests}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                />

                {addons.length > 0 && (
                  <Box>
                    <Typography fontWeight={800} mb={0.5}>
                      Optional add-ons
                    </Typography>
                    {addons.map((item) => (
                      <FormControlLabel
                        key={item.id}
                        sx={{ display: "flex" }}
                        control={
                          <Checkbox
                            checked={selectedAddons.includes(item.id)}
                            onChange={(_, checked) =>
                              toggleAddon(item.id, checked)
                            }
                          />
                        }
                        label={`${item.quantity > 1 ? `${item.quantity} × ` : ""}${item.service_name} (+${formatPrice(Number(item.line_total))})`}
                      />
                    ))}
                  </Box>
                )}

                <Divider />

                {error ? (
                  <Typography color="error.main" variant="body2">
                    {extractApiError(error as AxiosError<ApiResponse<null>>)}
                  </Typography>
                ) : (
                  <Stack spacing={0.75}>
                    <SummaryRow
                      label="Package"
                      value={formatPrice(Number(servicePackage.total_price))}
                    />
                    {calculation && calculation.extra_guests > 0 && (
                      <SummaryRow
                        label={`${calculation.extra_guests} extra guest${calculation.extra_guests === 1 ? "" : "s"}`}
                        value={`+ ${formatPrice(Number(calculation.extra_guests_price))}`}
                      />
                    )}
                    {calculation && Number(calculation.addons_price) > 0 && (
                      <SummaryRow
                        label="Add-ons"
                        value={`+ ${formatPrice(Number(calculation.addons_price))}`}
                      />
                    )}
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      pt={1}
                    >
                      <Typography fontWeight={900}>Total</Typography>
                      <Typography
                        variant="h5"
                        fontWeight={900}
                        color="primary.main"
                        sx={{ opacity: isPending ? 0.5 : 1 }}
                      >
                        {formatPrice(
                          Number(
                            calculation?.total_price ??
                              servicePackage.total_price,
                          ),
                        )}
                      </Typography>
                    </Box>
                  </Stack>
                )}

                <Button
                  variant="contained"
                  size="large"
                  disabled={Boolean(error)}
                  onClick={() => {
                    const params = new URLSearchParams({ guests: guestCount });
                    if (selectedAddons.length > 0) {
                      params.set("addons", selectedAddons.join(","));
                    }
                    router.push(
                      `/customer/package-checkout/${servicePackage.id}?${params}`,
                    );
                  }}
                  sx={{ textTransform: "none", fontWeight: 800, borderRadius: 3 }}
                >
                  Book this package
                </Button>
                {servicePackage.allow_scheduling_late && (
                  <Typography variant="caption" color="text.secondary">
                    {`You can pick the dates for each service now or within ${servicePackage.scheduling_deadline_days} days after booking.`}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Box display="flex" justifyContent="space-between">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700}>
        {value}
      </Typography>
    </Box>
  );
}
