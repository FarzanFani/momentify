"use client";

import Breadcrumb from "@/components/common/breadcrumb/Breadcrumb";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useGetCompanyTinyList } from "@/hooks/company";
import {
  useEditServices,
  useGetCategoryTinyList,
  useGetSingleProviderService,
} from "@/hooks/service";
import { CompanyServicesFormValues } from "@/services/provider/services";
import { extractApiError } from "@/utils/extractApiError";
import { mapApiResponseToDropdownOptions } from "@/utils/helperFunctions";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import ServiceForm from "../serviceForm/serviceFrom";
import { ServiceUnavailableView } from "../detailService/serviceDetail";
import { useEffect } from "react";

export default function EditServiceForm({ uuid }: { uuid: string }) {
  const { data: categoryResponse } = useGetCategoryTinyList();
  const { data: companyResponse } = useGetCompanyTinyList();
  const { mutate: editService } = useEditServices();

  const { data: serviceResponse, isLoading: isServiceLoading } =
    useGetSingleProviderService(uuid);

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

  const { control, handleSubmit, reset } = useForm<CompanyServicesFormValues>({
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
    },
  });

  useEffect(() => {
    if (serviceResponse) {
      reset({
        name: serviceResponse.name,
        company: serviceResponse.company,
        category: String(serviceResponse.category),
        max_capacity: serviceResponse.max_capacity,
        buffer_after_minutes: serviceResponse.buffer_after_minutes,
        buffer_before_minutes: serviceResponse.buffer_before_minutes,
        duration_minutes: serviceResponse.duration_minutes,
        price: serviceResponse.price,
        is_active: serviceResponse.is_active,
        description: serviceResponse.description,
      });
    }
  }, [serviceResponse]);

  const saveFormHandler = (data: CompanyServicesFormValues) => {
    editService(
      { id: uuid, service: data },
      {
        onSuccess() {
          showSnackbar("Service Updated Succefully", "success");
          router.push("/provider/services");
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
      {isServiceLoading ? (
        <CircularProgress />
      ) : serviceResponse ? (
        <>
          <Box sx={{ width: "90%" }}>
            <Typography variant="h4" fontWeight={700} color="primary.main">
              Edit Service
            </Typography>
          </Box>

          <Box sx={{ width: "90%" }}>
            <Breadcrumb
              items={[
                { label: "Services", href: "/provider/services" },
                {
                  label: serviceResponse.name ?? "",
                  href: `/provider/services/${serviceResponse.id}/preview`,
                },
                { label: "Edit" },
              ]}
            />
          </Box>
          <ServiceForm
            control={control}
            companyOptions={companyOptions}
            categoryOptions={categoryOptions}
            inEdit
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
        </>
      ) : (
        <ServiceUnavailableView />
      )}
    </Box>
  );
}
