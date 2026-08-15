"use client";

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
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { PackageUnavailableView } from "../packageDetail/packageDetail";
import PackageForm from "../packageForm/packageForm";

export default function EditPackageForm({ uuid }: { uuid: string }) {
  const { data: categoryResponse } = useGetCategoryTinyList();
  const { data: companyResponse } = useGetCompanyTinyList();
  const { mutate: editPackage } = useEditPackage();

  const { data: packageResponse, isLoading: isPackageLoading } =
    useGetSingleProviderPackage(uuid);

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

  const { control, handleSubmit, reset } = useForm<ServicePackagesPayload>({
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      company: "",
      category: "",
      pricing_method: "service_total",
      fixed_discount: undefined,
      percentage_discount: undefined,
      fixed_price: undefined,
      allow_full_payment: false,
      installment_amount: undefined,
      deposit_percentage: undefined,
      installment_interval: "",
      allow_scheduling_late: false,
      services: [{ service: "", price: undefined, quantity: 1, required: true }],
    },
  });

  useEffect(() => {
    if (packageResponse) {
      reset({
        name: packageResponse.name,
        description: packageResponse.description,
        company: packageResponse.company,
        category: String(packageResponse.category),
        pricing_method: packageResponse.pricing_method,
        fixed_discount: packageResponse.fixed_discount,
        percentage_discount: packageResponse.percentage_discount,
        fixed_price: packageResponse.fixed_price,
        allow_full_payment: packageResponse.allow_full_payment,
        installment_amount: packageResponse.installment_amount,
        deposit_percentage: packageResponse.deposit_percentage,
        installment_interval: packageResponse.installment_interval,
        allow_scheduling_late: packageResponse.allow_scheduling_late,
        services: packageResponse.services,
      });
    }
  }, [packageResponse]);

  const saveFormHandler = (data: ServicePackagesPayload) => {
    editPackage(
      { id: uuid, servicePackage: data },
      {
        onSuccess() {
          showSnackbar("Package updated successfully", "success");
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
            companyOptions={companyOptions}
            categoryOptions={categoryOptions}
            inEdit
            initialServiceOptions={packageResponse.services.map((item) => ({
              label: item.service_name ?? item.service,
              value: item.service,
            }))}
            initialDepositEnabled={Boolean(packageResponse.deposit_percentage)}
            initialInstallmentEnabled={Boolean(
              packageResponse.installment_amount,
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
                sx={{
                  textTransform: "none",
                  px: 4,
                  py: 1.2,
                  borderRadius: 2,
                }}
                onClick={handleSubmit(saveFormHandler)}
              >
                Save
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
