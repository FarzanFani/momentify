"use client";

import { useState } from "react";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useFieldArray, useForm } from "react-hook-form";
import RegisterForm from "./registerForm";
import LocationForm from "./locationForm";
import WorkingHoursForm from "./workingHoursForm";
import CancellationPolicyForm from "./cancellationPolicyForm";
import {
  AddCompanyFormValues,
  CompanyLocationPayload,
  RegisterCompanyPayload,
} from "./formTypes";
import { useCreateCompanyLocation, useRegisterCompany } from "@/hooks/company";
import { extractApiError } from "@/utils/extractApiError";

const steps = [
  "Register Company",
  "Location",
  "Working Hours",
  "Cancellation Policy",
];

export default function AddCompany() {
  const { showSnackbar } = useSnackbar();

  const { mutate: registerCompany } = useRegisterCompany();
  const { mutate: createCompanyLocation } = useCreateCompanyLocation();

  const [companyId, setCompanyId] = useState<string>("");
  const [activeStep, setActiveStep] = useState(0);
  const [maxVisitedStep, setMaxVisitedStep] = useState(0);

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
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

  const onSubmit = async (values: AddCompanyFormValues) => {
    console.log("Add company payload:", values);
    showSnackbar("Company form submitted", "success");
    reset(values);
  };

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

  const advanceStep = () => {
    setActiveStep((prev) => {
      const next = prev + 1;
      setMaxVisitedStep((m) => Math.max(m, next));
      return next;
    });
  };

  const handleNext = async () => {
    const isValid = await trigger(stepFields[activeStep] as any);
    if (!isValid) return;

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
      registerCompany(payload, {
        onSuccess: (data) => {
          setCompanyId(data.id);
          showSnackbar("Company registered successfully", "success");
          advanceStep();
        },
        onError: (error) => {
          showSnackbar(
            extractApiError(error, "Company registration failed"),
            "error",
          );
        },
      });
      return;
    }

    if (activeStep === 1) {
      let successCount = 0;
      const locationsList = allValues.locations;

      locationsList.forEach((loc) => {
        const payload: CompanyLocationPayload = {
          ...loc,
          company: companyId,
        };
        createCompanyLocation(payload, {
          onSuccess: () => {
            successCount++;
            if (successCount === locationsList.length) {
              showSnackbar(
                `${successCount} location(s) created successfully`,
                "success",
              );
              advanceStep();
            }
          },
          onError: (error) => {
            showSnackbar(
              extractApiError(error, "Location creation failed"),
              "error",
            );
          },
        });
      });
      return;
    }

    advanceStep();
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
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
        minHeight: "calc(100% + 48px)",
      }}
    >
      <Box sx={{ width: "90%" }}>
        <Typography variant="h4" fontWeight={700} color="primary.main">
          Add Company
        </Typography>
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
                  onClick={() => {
                    if (index <= maxVisitedStep) setActiveStep(index);
                  }}
                  sx={{
                    color: activeStep === index ? "primary.main" : "grey.500",
                    fontWeight: activeStep === index ? 700 : 600,
                    cursor:
                      index <= maxVisitedStep && index !== activeStep
                        ? "pointer"
                        : index > maxVisitedStep
                          ? "not-allowed"
                          : "default",
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
            Complete this step and continue to the next one.
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
                  sx={{
                    textTransform: "none",
                    px: 4,
                    py: 1.2,
                    borderRadius: 2,
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  sx={{
                    textTransform: "none",
                    px: 4,
                    py: 1.2,
                    borderRadius: 2,
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Create Company"}
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
