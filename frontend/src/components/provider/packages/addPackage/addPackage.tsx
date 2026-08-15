"use client";

import Breadcrumb from "@/components/common/breadcrumb/Breadcrumb";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useGetCompanyTinyList } from "@/hooks/company";
import { useGetCategoryTinyList, usePostPackage } from "@/hooks/service";
import { ServicePackagesPayload } from "@/services/provider/services";
import { extractApiError } from "@/utils/extractApiError";
import { mapApiResponseToDropdownOptions } from "@/utils/helperFunctions";
import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import PackageForm from "../packageForm/packageForm";

export default function AddPackageForm() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const { data: companyResponse } = useGetCompanyTinyList();
  const { data: categoryResponse } = useGetCategoryTinyList();
  const { mutate: createPackage } = usePostPackage();

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

  const { control, handleSubmit } = useForm<ServicePackagesPayload>({
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      category: "",
      company: "",
      pricing_method: "service_total",
      fixed_discount: undefined,
      percentage_discount: undefined,
      fixed_price: undefined,
      allow_full_payment: false,
      installment_amount: undefined,
      deposit_percentage: undefined,
      installment_interval: undefined,
      allow_scheduling_late: false,
      services: [
        { service: "", price: undefined, quantity: 1, required: true },
      ],
    },
  });

  const saveFormHandler = (data: ServicePackagesPayload) => {
    createPackage(data, {
      onSuccess() {
        showSnackbar("Package created successfully", "success");
        router.push("/provider/packages");
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
        companyOptions={companyOptions}
        categoryOptions={categoryOptions}
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
    </Box>
  );
}
