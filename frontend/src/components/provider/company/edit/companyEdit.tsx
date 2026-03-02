"use client";

import { useEffect, useState } from "react";
import {
  useGetCompanyById,
  useGetCompanyLocations,
  useUpdateCompany,
  useCreateCompanyLocation,
  useUpdateCompanyLocation,
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
import { useFieldArray, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import RegisterForm from "@/components/provider/company/add/registerForm";
import LocationForm from "@/components/provider/company/add/locationForm";
import WorkingHoursForm from "@/components/provider/company/add/workingHoursForm";
import CancellationPolicyForm from "@/components/provider/company/add/cancellationPolicyForm";
import {
  AddCompanyFormValues,
  CompanyLocationPayload,
  RegisterCompanyPayload,
} from "@/components/provider/company/add/formTypes";

interface CompanyEditProps {
  companyId: string;
}

const steps = [
  "Company Info",
  "Location",
  "Working Hours",
  "Cancellation Policy",
];

export default function CompanyEdit({ companyId }: CompanyEditProps) {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { data: company, isLoading } = useGetCompanyById(companyId);
  const { data: locationsData } = useGetCompanyLocations(companyId);
  const locations = locationsData?.results;
  const { mutate: updateCompany, isPending: isUpdating } = useUpdateCompany();
  const { mutate: updateLocation, isPending: isUpdatingLocation } =
    useUpdateCompanyLocation();
  const { mutate: createLocation, isPending: isCreatingLocation } =
    useCreateCompanyLocation();

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
      locations: [
        { address: "", city: "", country: "", latitude: "", longitude: "" },
      ],
      work_start_time: "",
      work_end_time: "",
      working_days: "",
      cancellation_policy_text: "",
      auto_approve_booking: false,
    },
  });

  const locationFieldArray = useFieldArray({
    control,
    name: "locations",
  });

  useEffect(() => {
    if (!company) return;

    const locationsArr =
      locations && locations.length > 0
        ? locations.map((loc) => ({
            address: loc.address,
            city: loc.city,
            country: loc.country,
            latitude: loc.latitude,
            longitude: loc.longitude,
          }))
        : [{ address: "", city: "", country: "", latitude: "", longitude: "" }];

    reset({
      name: company.name,
      email: company.email,
      phone_number: company.phone_number,
      description: company.description,
      timezone: company.timezone,
      cancellation_policy_text: company.cancellation_policy_text,
      auto_approve_booking: company.auto_approve_booking,
      locations: locationsArr,
      work_start_time: "",
      work_end_time: "",
      working_days: "",
    });
  }, [company, locations, reset]);

  const stepFields: (keyof AddCompanyFormValues | "locations")[][] = [
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
    const isValid = await trigger(stepFields[activeStep] as any);
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

    if (activeStep === 1) {
      let successCount = 0;
      const locationsList = allValues.locations;

      locationsList.forEach((loc, index) => {
        const payload: CompanyLocationPayload = {
          ...loc,
          company: companyId,
        };
        const existingId = locations?.[index]?.id;

        if (existingId) {
          updateLocation(
            { id: existingId, payload },
            {
              onSuccess: () => {
                successCount++;
                if (successCount === locationsList.length) {
                  showSnackbar("Locations updated", "success");
                  setActiveStep((prev) => prev + 1);
                }
              },
              onError: (error) => {
                showSnackbar(
                  extractApiError(error, "Location update failed"),
                  "error",
                );
              },
            },
          );
        } else {
          createLocation(payload, {
            onSuccess: () => {
              successCount++;
              if (successCount === locationsList.length) {
                showSnackbar("Locations saved", "success");
                setActiveStep((prev) => prev + 1);
              }
            },
            onError: (error) => {
              showSnackbar(
                extractApiError(error, "Location creation failed"),
                "error",
              );
            },
          });
        }
      });
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

  if (isLoading) {
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
              sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
            >
              <Button
                variant="outlined"
                color="primary"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ textTransform: "none", px: 4, py: 1.2, borderRadius: 2 }}
              >
                Back
              </Button>

              {activeStep < steps.length - 1 ? (
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  disabled={isUpdating || isUpdatingLocation || isCreatingLocation}
                  sx={{
                    textTransform: "none",
                    px: 4,
                    py: 1.2,
                    borderRadius: 2,
                  }}
                >
                  {isCurrentStepDirty ? "Save & Next" : "Next"}
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
