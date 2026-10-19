"use client";

import type { ApiResponse } from "@/types/general";
import type { AxiosError } from "axios";
import Breadcrumb from "@/components/common/breadcrumb/Breadcrumb";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useGetCompanyTinyList } from "@/hooks/company";
import { useGetCategoryTinyList, usePostPackage } from "@/hooks/service";
import { ServicePackagesPayload } from "@/services/provider/services";
import { extractApiError } from "@/utils/extractApiError";
import { mapApiResponseToDropdownOptions } from "@/utils/helperFunctions";
import { toPackagePayload } from "@/utils/packagePricing";
import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import PackageForm from "../packageForm/packageForm";
import { useCoverImage } from "../packageForm/useCoverImage";

export default function AddPackageForm() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const { data: companyResponse } = useGetCompanyTinyList();
  const { data: categoryResponse } = useGetCategoryTinyList();
  const { mutate: createPackage, isPending } = usePostPackage();
  const { preview, onCoverChange, saveCover } = useCoverImage();

  const companyOptions = mapApiResponseToDropdownOptions(
    companyResponse ?? [],
    "id",
    "name",
  );

  const categoryOptions = mapApiResponseToDropdownOptions(
    categoryResponse ?? [],
    "id",
    "name",
  );

  const { control, handleSubmit, setValue } = useForm<ServicePackagesPayload>({
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      category: "",
      company: "",
      is_active: true,
      pricing_method: "service_total",
      fixed_discount: undefined,
      percentage_discount: undefined,
      fixed_price: undefined,
      included_guests: 1,
      price_per_extra_guest: 0,
      allow_full_payment: true,
      installment_count: undefined,
      deposit_percentage: undefined,
      installment_interval: undefined,
      allow_scheduling_late: false,
      scheduling_deadline_days: 30,
      services: [
        { service: "", price: undefined, quantity: 1, required: true },
      ],
    },
  });

  const saveFormHandler = (data: ServicePackagesPayload) => {
    createPackage(toPackagePayload(data), {
      async onSuccess(created) {
        try {
          await saveCover(created.id, data.company);
          showSnackbar("Package created successfully", "success");
        } catch (error) {
          showSnackbar(
            `Package created, but the cover image failed: ${extractApiError(error as AxiosError<ApiResponse<null>>)}`,
            "error",
          );
        }
        router.push(`/provider/packages/${created.id}/preview`);
      },
      onError(error: any) {
        showSnackbar(extractApiError(error), "error");
      },
    });
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
      <Box sx={{ width: "90%" }}>
        <Typography variant="h4" fontWeight={700} color="primary.main">
          Add new package
        </Typography>
      </Box>

      <Box sx={{ width: "90%" }}>
        <Breadcrumb
          items={[
            { label: "Packages", href: "/provider/packages" },
            { label: "Add" },
          ]}
        />
      </Box>

      <PackageForm
        control={control}
        setValue={setValue}
        companyOptions={companyOptions}
        categoryOptions={categoryOptions}
        coverPreview={preview}
        onCoverChange={onCoverChange}
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
    </Box>
  );
}
