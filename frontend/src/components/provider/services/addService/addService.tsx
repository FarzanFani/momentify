"use client";

import Breadcrumb from "@/components/common/breadcrumb/Breadcrumb";
import SelectDropdown from "@/components/common/dropdown/Dropdown";
import InputField from "@/components/common/input/InputField";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useGetCompanyTinyList } from "@/hooks/company";
import { useGetCategoryTinyList, usePostService } from "@/hooks/service";
import { CompanyServicesFormValues } from "@/services/provider/services";
import { extractApiError } from "@/utils/extractApiError";
import { mapApiResponseToDropdownOptions } from "@/utils/helperFunctions";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Grid,
  Switch,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import ServiceForm from "../serviceForm/serviceFrom";

export default function AddServiceForm() {
  const { data: categoryResponse } = useGetCategoryTinyList();
  const { data: companyResponse } = useGetCompanyTinyList();
  const { mutate: createService } = usePostService();

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

  const { control, handleSubmit } = useForm<CompanyServicesFormValues>({
    mode: "onChange",
    defaultValues: {
      name: "",
      company: "",
      category: "",
      max_capacity: undefined,
      buffer_after_minutes: undefined,
      buffer_before_minutes: undefined,
      duration_minutes: undefined,
      price: undefined,
      is_active: true,
      description: "",
      price_per_guest: undefined,
      guest_count_policy: "variable",
      fixed_guest_count: undefined,
      minimum_billable_guest: undefined,
    },
  });

  const saveFormHandler = (data: CompanyServicesFormValues) => {
    createService(data, {
      onSuccess() {
        showSnackbar("Service Create Succefully", "success");
        router.push("/provider/services");
      },
      onError(error: any, variables, onMutateResult, context) {
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
          Add Service
        </Typography>
      </Box>

      <Box sx={{ width: "90%" }}>
        <Breadcrumb
          items={[
            { label: "Services", href: "/provider/services" },
            { label: "Add" },
          ]}
        />
      </Box>
      <ServiceForm
        control={control}
        companyOptions={companyOptions}
        categoryOptions={categoryOptions}
        inEdit={false}
      />
      <Box
        display={"flex"}
        width={"90%"}
        mt={1}
        justifyContent={{ xs: "center", sm: "end" }}
      >
        <Box display={"flex"} justifyContent={"end"} gap={4}>
          <Button
            variant="outlined"
            color="primary"
            sx={{
              textTransform: "none",
              px: 4,
              py: 1.2,
              borderRadius: 2,
            }}
            onClick={() => router.push("/provider/services")}
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
