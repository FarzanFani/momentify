"use client";

import { useEffect, useState } from "react";
import {
  updateCompanyLocation,
  useCreateCompanyLocation,
  useGetCompanyById,
  useGetCompanyLocations,
  useUpdateCompany,
} from "@/hooks/company";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { extractApiError } from "@/utils/extractApiError";
import Breadcrumb from "@/components/common/breadcrumb/Breadcrumb";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import { FieldPath, useFieldArray, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import RegisterForm from "@/components/provider/company/add/registerForm";
import WorkingHoursForm from "@/components/provider/company/add/workingHoursForm";
import CancellationPolicyForm from "@/components/provider/company/add/cancellationPolicyForm";
import {
  AddCompanyFormValues,
  RegisterCompanyPayload,
} from "@/components/provider/company/add/formTypes";
import LocationForm from "../add/locationForm";

interface CompanyEditProps {
  companyId: string;
}

const steps = [
  "Company Info",
  "Location",
  "Working Hours",
  "Cancellation Policy",
];

const emptyLocation = {
  address: "",
  city: "",
  country: "",
  latitude: "",
  longitude: "",
  name: "",
};

export default function CompanyEdit({ companyId }: CompanyEditProps) {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const { data: company, isLoading } = useGetCompanyById(companyId);

  const { data: locations, isLoading: isLocationLoading } =
    useGetCompanyLocations(companyId);
  const { mutate: updateCompany, isPending: isUpdating } = useUpdateCompany();
  const { mutate: createCompanyLocation, isPending: isLocationCreating } =
    useCreateCompanyLocation();

  const { mutate: updateLocation, isPending: isLocationUpdating } =
    updateCompanyLocation();

  const [activeStep, setActiveStep] = useState(0);

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    getValues,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<AddCompanyFormValues>({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      description: "",
      timezone: "UTC",
      work_start_time: "",
      work_end_time: "",
      working_days: "",
      cancellation_policy_text: "",
      auto_approve_booking: false,
      locations: [emptyLocation],
    },
  });

  const locationFieldArray = useFieldArray<
    AddCompanyFormValues,
    "locations",
    "fieldId"
  >({
    control,
    name: "locations",
    keyName: "fieldId",
  });

  const { replace } = locationFieldArray;

  useEffect(() => {
    if (!company) return;

    reset({
      name: company.name ?? "",
      email: company.email ?? "",
      phone_number: company.phone_number ?? "",
      description: company.description ?? "",
      timezone: company.timezone ?? "UTC",
      cancellation_policy_text: company.cancellation_policy_text ?? "",
      auto_approve_booking: company.auto_approve_booking ?? false,
      work_start_time: "",
      work_end_time: "",
      working_days: "",
      locations: getValues("locations"),
    });
  }, [company, reset, getValues]);

  useEffect(() => {
    const backendLocations = locations?.results;

    if (!backendLocations) return;

    replace(
      backendLocations.length
        ? backendLocations.map((location) => ({
            address: location.address ?? "",
            city: location.city ?? "",
            country: location.country ?? "",
            latitude: location.latitude?.toString() ?? "",
            longitude: location.longitude?.toString() ?? "",
            name: location.name ?? "",
            id: location.id,
          }))
        : [emptyLocation],
    );
  }, [locations?.results, replace]);

  const stepFields: FieldPath<AddCompanyFormValues>[][] = [
    [
      "name",
      "email",
      "phone_number",
      "description",
      "timezone",
      "cancellation_policy_text",
      "auto_approve_booking",
    ],
    ["locations"],
    ["work_start_time", "work_end_time", "working_days"],
    ["cancellation_policy_text", "auto_approve_booking"],
  ];

  const isCurrentStepDirty = stepFields[activeStep]?.some(
    (field) => (dirtyFields as Record<string, unknown>)[field],
  );

  const handleNext = async () => {
    const isValid = await trigger(stepFields[activeStep]);
    if (!isValid) return;

    if (!isCurrentStepDirty) {
      setActiveStep((prev) => prev + 1);
      return;
    }

    const allValues = getValues();

    if (activeStep === 0) {
      const payload: RegisterCompanyPayload = {
        name: allValues.name,
        email: allValues.email,
        phone_number: allValues.phone_number,
        description: allValues.description,
        timezone: allValues.timezone,
        cancellation_policy_text: allValues.cancellation_policy_text,
        auto_approve_booking: allValues.auto_approve_booking,
      };

      updateCompany(
        { id: companyId, payload },
        {
          onSuccess: () => {
            showSnackbar("Company info updated", "success");
            setActiveStep((prev) => prev + 1);
          },
          onError: (error) => {
            showSnackbar(extractApiError(error, "Update failed"), "error");
          },
        },
      );

      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = async (values: AddCompanyFormValues) => {
    const payload: RegisterCompanyPayload = {
      name: values.name,
      email: values.email,
      phone_number: values.phone_number,
      description: values.description,
      timezone: values.timezone,
      cancellation_policy_text: values.cancellation_policy_text,
      auto_approve_booking: values.auto_approve_booking,
    };

    updateCompany(
      { id: companyId, payload },
      {
        onSuccess: () => {
          showSnackbar("Company updated successfully", "success");
          router.push(`/provider/company/${companyId}/preview`);
        },
        onError: (error) => {
          showSnackbar(extractApiError(error, "Update failed"), "error");
        },
      },
    );
  };

  const handleSaveAddress = async (index: number) => {
    console.log(index);

    const isValid = await trigger(`locations.${index}` as any);
    if (!isValid) return;

    const location = getValues(`locations.${index}`);

    const { id, ...locationPayload } = location;

    if (id) {
      updateLocation(
        {
          companyId,
          payload: {
            ...locationPayload,
            company: companyId,
            id: id,
          },
        },
        {
          onSuccess: () => {
            showSnackbar("Location updated successfully", "success");
          },
          onError: (error) => {
            showSnackbar(
              extractApiError(error, "Location update failed"),
              "error",
            );
          },
        },
      );

      return;
    }

    createCompanyLocation(
      {
        ...locationPayload,
        company: companyId,
      },
      {
        onSuccess: () => {
          showSnackbar("Location created successfully", "success");
        },
        onError: (error) => {
          showSnackbar(
            extractApiError(error, "Location creation failed"),
            "error",
          );
        },
      },
    );
  };

  const renderStepForm = () => {
    switch (activeStep) {
      case 0:
        return <RegisterForm control={control} errors={errors} />;

      case 1:
        return (
          <LocationForm
            control={control}
            errors={errors}
            fieldArray={locationFieldArray}
            onSaveAddress={handleSaveAddress}
            isSavingAddress={isLocationUpdating || isLocationCreating}
          />
        );

      case 2:
        return <WorkingHoursForm control={control} errors={errors} />;

      case 3:
        return <CancellationPolicyForm control={control} errors={errors} />;

      default:
        return null;
    }
  };

  if (isLoading || isLocationLoading) {
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
      <Box sx={{ width: "90%" }}>
        <Breadcrumb
          items={[
            { label: "Companies", href: "/provider/company" },
            {
              label: company.name,
              href: `/provider/company/${companyId}/preview`,
            },
            { label: "Edit" },
          ]}
        />
      </Box>

      <Card sx={{ width: "90%", borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            {steps.map((step, index) => (
              <Box
                key={step}
                sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
              >
                <Typography
                  onClick={() => setActiveStep(index)}
                  sx={{
                    color: activeStep === index ? "primary.main" : "grey.500",
                    fontWeight: activeStep === index ? 700 : 600,
                    cursor: activeStep === index ? "default" : "pointer",
                    userSelect: "none",
                  }}
                >
                  {step}
                </Typography>

                {index < steps.length - 1 && (
                  <Typography color="grey.500" fontWeight={700}>
                    &gt;
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ width: "90%", borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} color="primary.main" mb={1}>
            {steps[activeStep]}
          </Typography>

          <Typography color="text.secondary" mb={3}>
            Update this section and continue to the next one.
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {renderStepForm()}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 1,
              }}
            >
              <Button
                variant="outlined"
                color="primary"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{
                  textTransform: "none",
                  px: 4,
                  py: 1.2,
                  borderRadius: 2,
                }}
              >
                Back
              </Button>

              {activeStep < steps.length - 1 ? (
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  disabled={isUpdating}
                  sx={{
                    textTransform: "none",
                    px: 4,
                    py: 1.2,
                    borderRadius: 2,
                  }}
                >
                  {isCurrentStepDirty && activeStep === 0
                    ? "Save & Next"
                    : "Next"}
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting || isUpdating}
                  sx={{
                    textTransform: "none",
                    px: 4,
                    py: 1.2,
                    borderRadius: 2,
                  }}
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
