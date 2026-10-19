"use client";

import type { ApiResponse } from "@/types/general";
import type { AxiosError } from "axios";
import Breadcrumb from "@/components/common/breadcrumb/Breadcrumb";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useGetCompanyTinyList } from "@/hooks/company";
import {
  useEditPackage,
  useGetCategoryTinyList,
  useGetSingleProviderPackage,
} from "@/hooks/service";
import { ServicePackagesPayload } from "@/services/provider/services";
import { extractApiError } from "@/utils/extractApiError";
import { mapApiResponseToDropdownOptions } from "@/utils/helperFunctions";
import { toPackagePayload } from "@/utils/packagePricing";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { PackageUnavailableView } from "../packageDetail/packageDetail";
import PackageForm from "../packageForm/packageForm";
import { useCoverImage } from "../packageForm/useCoverImage";

export default function EditPackageForm({ uuid }: { uuid: string }) {
  const { data: categoryResponse } = useGetCategoryTinyList();
  const { data: companyResponse } = useGetCompanyTinyList();
  const { mutate: editPackage, isPending } = useEditPackage();

  const { data: packageResponse, isLoading: isPackageLoading } =
    useGetSingleProviderPackage(uuid);
  const { preview, onCoverChange, saveCover } = useCoverImage(
    packageResponse?.cover_image ?? null,
  );

  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const categoryOptions = mapApiResponseToDropdownOptions(
    categoryResponse ?? [],
    "id",
    "name",
  );

  const companyOptions = mapApiResponseToDropdownOptions(
    companyResponse ?? [],
    "id",
    "name",
  );

  const { control, handleSubmit, reset, setValue } =
    useForm<ServicePackagesPayload>({
      mode: "onChange",
      defaultValues: {
        name: "",
        description: "",
        company: "",
        category: "",
        is_active: true,
        pricing_method: "service_total",
        fixed_discount: undefined,
        percentage_discount: undefined,
        fixed_price: undefined,
        included_guests: 1,
        price_per_extra_guest: 0,
        allow_full_payment: false,
        installment_count: undefined,
        deposit_percentage: undefined,
        installment_interval: "",
        allow_scheduling_late: false,
        scheduling_deadline_days: 30,
        services: [
          { service: "", price: undefined, quantity: 1, required: true },
        ],
      },
    });

  useEffect(() => {
    if (packageResponse) {
      reset({
        name: packageResponse.name,
        description: packageResponse.description,
        company: packageResponse.company,
        category: String(packageResponse.category),
        is_active: packageResponse.is_active,
        pricing_method: packageResponse.pricing_method,
        fixed_discount: packageResponse.fixed_discount ?? undefined,
        percentage_discount: packageResponse.percentage_discount ?? undefined,
        fixed_price: packageResponse.fixed_price ?? undefined,
        included_guests: packageResponse.included_guests,
        price_per_extra_guest: packageResponse.price_per_extra_guest,
        allow_full_payment: packageResponse.allow_full_payment,
        installment_count: packageResponse.installment_count ?? undefined,
        deposit_percentage: packageResponse.deposit_percentage ?? undefined,
        installment_interval: packageResponse.installment_interval ?? undefined,
        allow_scheduling_late: packageResponse.allow_scheduling_late,
        scheduling_deadline_days:
          packageResponse.scheduling_deadline_days ?? 30,
        services: packageResponse.services.map((item) => ({
          service: item.service,
          service_name: item.service_name,
          price: Number(item.price),
          quantity: item.quantity,
          required: item.required,
        })),
      });
    }
  }, [packageResponse]);

  const saveFormHandler = (data: ServicePackagesPayload) => {
    editPackage(
      { id: uuid, servicePackage: toPackagePayload(data) },
      {
        async onSuccess() {
          try {
            await saveCover(uuid, data.company);
            showSnackbar("Package updated successfully", "success");
          } catch (error) {
            showSnackbar(
              `Package saved, but the cover image failed: ${extractApiError(error as AxiosError<ApiResponse<null>>)}`,
              "error",
            );
          }
          router.push(`/provider/packages/${uuid}/preview`);
        },
        onError(error: any) {
          showSnackbar(extractApiError(error), "error");
        },
      },
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 3,
        gap: 2,
        ml: -3,
        mt: -3,
        mb: -3,
        mr: -3,
        minHeight: "calc(100% + 48px)",
      }}
    >
      {isPackageLoading ? (
        <CircularProgress />
      ) : packageResponse ? (
        <>
          <Box sx={{ width: "90%" }}>
            <Typography variant="h4" fontWeight={700} color="primary.main">
              Edit Package
            </Typography>
          </Box>

          <Box sx={{ width: "90%" }}>
            <Breadcrumb
              items={[
                { label: "Packages", href: "/provider/packages" },
                {
                  label: packageResponse.name ?? "",
                  href: `/provider/packages/${packageResponse.id}/preview`,
                },
                { label: "Edit" },
              ]}
            />
          </Box>

          <PackageForm
            control={control}
            setValue={setValue}
            coverPreview={preview}
            onCoverChange={onCoverChange}
            companyOptions={companyOptions}
            categoryOptions={categoryOptions}
            inEdit
            initialServiceOptions={packageResponse.services.map((item) => ({
              label: item.service_name ?? item.service,
              value: item.service,
            }))}
            initialDepositEnabled={Boolean(packageResponse.deposit_percentage)}
            initialInstallmentEnabled={Boolean(
              packageResponse.installment_count,
            )}
          />

          <Box
            display="flex"
            width="90%"
            mt={1}
            justifyContent={{ xs: "center", sm: "end" }}
          >
            <Box display="flex" justifyContent="end" gap={4}>
              <Button
                variant="outlined"
                color="primary"
                sx={{
                  textTransform: "none",
                  px: 4,
                  py: 1.2,
                  borderRadius: 2,
                }}
                onClick={() => router.push("/provider/packages")}
              >
                Back
              </Button>

              <Button
                type="button"
                variant="contained"
                color="primary"
                disabled={isPending}
                sx={{
                  textTransform: "none",
                  px: 4,
                  py: 1.2,
                  borderRadius: 2,
                }}
                onClick={handleSubmit(saveFormHandler)}
              >
                {isPending ? "Saving..." : "Save"}
              </Button>
            </Box>
          </Box>
        </>
      ) : (
        <PackageUnavailableView />
      )}
    </Box>
  );
}
