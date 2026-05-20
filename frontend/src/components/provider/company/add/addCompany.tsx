"use client";

import { useState } from "react";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useFieldArray, useForm } from "react-hook-form";
import RegisterForm from "../detailsForm/registerForm";
import LocationForm from "../detailsForm/locationForm";
import WorkingHoursForm from "../detailsForm/workingHoursForm";
import CancellationPolicyForm from "../detailsForm/cancellationPolicyForm";
import {
  AddCompanyFormValues,
  CompanyCancellationPolicyPayload,
  CompanyLocationPayload,
  RegisterCompanyPayload,
} from "./formTypes";
import {
  useCreateCompanyCancellationPolicy,
  useCreateCompanyLocation,
  useCreateCompanyWorkingHour,
  useRegisterCompany,
} from "@/hooks/company";
import { extractApiError } from "@/utils/extractApiError";
import Breadcrumb from "@/components/common/breadcrumb/Breadcrumb";

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
  const { mutate: createWorkingHour } = useCreateCompanyWorkingHour();
  const { mutate: createCancellationPolicy } =
    useCreateCompanyCancellationPolicy();

  const [companyId, setCompanyId] = useState<string>("");
  const [activeStep, setActiveStep] = useState(0);
  const [maxVisitedStep, setMaxVisitedStep] = useState(0);
  const [isSavingCancellationPolicy, setIsSavingCancellationPolicy] =
    useState(false);

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
      auto_approve_booking: false,
      locations: [
        {
          address: "",
          city: "",
          country: "",
          latitude: "",
          longitude: "",
          name: "",
        },
      ],
      working_hours: [
        {
          weekday: [],
          start_time: "",
          end_time: "",
        },
      ],
      cancellation_policies: [
        {
          rule_description: "",
          hours_before_event: "",
          refund_precentage: "",
          priority: "",
          is_active: true,
        },
      ],
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

  const workingHoursFieldArray = useFieldArray<
    AddCompanyFormValues,
    "working_hours",
    "fieldId"
  >({
    control,
    name: "working_hours",
    keyName: "fieldId",
  });

  const cancellationPolicyFieldArray = useFieldArray<
    AddCompanyFormValues,
    "cancellation_policies",
    "fieldId"
  >({
    control,
    name: "cancellation_policies",
    keyName: "fieldId",
  });

  const onSubmit = async (values: AddCompanyFormValues) => {
    console.log("Add company payload:", values);
    showSnackbar("Company form submitted", "success");
    reset(values);
  };

  const stepFields: (keyof AddCompanyFormValues)[][] = [
    [
      "name",
      "email",
      "phone_number",
      "description",
      "timezone",
      "auto_approve_booking",
    ],
    ["locations"],
    ["working_hours"],
    ["cancellation_policies"],
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
        auto_approve_booking: allValues.auto_approve_booking,
      };

      registerCompany(payload, {
        onSuccess: (data) => {
          setCompanyId(data.id);
          showSnackbar("Company registered successfully", "success");
          advanceStep();
        },
        onError: (error: any) => {
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

      if (!companyId) {
        showSnackbar("Please register the company first", "error");
        return;
      }

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
          onError: (error: any) => {
            showSnackbar(
              extractApiError(error, "Location creation failed"),
              "error",
            );
          },
        });
      });

      return;
    }

    if (activeStep === 2) {
      let successCount = 0;
      const workingHoursList = allValues.working_hours;

      if (!companyId) {
        showSnackbar("Please register the company first", "error");
        return;
      }

      workingHoursList.forEach((workingHour) => {
        createWorkingHour(
          {
            company: companyId,
            weekday: workingHour.weekday,
            start_time: workingHour.start_time,
            end_time: workingHour.end_time,
          },
          {
            onSuccess: () => {
              successCount++;

              if (successCount === workingHoursList.length) {
                showSnackbar(
                  `${successCount} working hour(s) created successfully`,
                  "success",
                );
                advanceStep();
              }
            },
            onError: (error: any) => {
              showSnackbar(
                extractApiError(error, "Working hours creation failed"),
                "error",
              );
            },
          },
        );
      });

      return;
    }

    advanceStep();
  };

  const handleSaveAddress = async (index: number) => {
    const isValid = await trigger(`locations.${index}` as any);
    if (!isValid) return;

    const location = getValues(`locations.${index}`);

    if (!companyId) {
      showSnackbar("Please register the company first", "error");
      return;
    }

    const payload: CompanyLocationPayload = {
      ...location,
      company: companyId,
    };

    createCompanyLocation(payload, {
      onSuccess: () => {
        showSnackbar("Location created successfully", "success");
      },
      onError: (error: any) => {
        showSnackbar(
          extractApiError(error, "Location creation failed"),
          "error",
        );
      },
    });
  };

  const handleSaveCancellationPolicy = async (index: number) => {
    const isValid = await trigger(`cancellation_policies.${index}` as any);
    if (!isValid) return;

    const cancellationPolicy = getValues(`cancellation_policies.${index}`);

    if (!companyId) {
      showSnackbar("Please register the company first", "error");
      return;
    }

    const payload: CompanyCancellationPolicyPayload = {
      ...cancellationPolicy,
      company: companyId,
    };

    setIsSavingCancellationPolicy(true);

    createCancellationPolicy(payload, {
      onSuccess: () => {
        showSnackbar("Cancellation policy created successfully", "success");
        setIsSavingCancellationPolicy(false);
      },
      onError: (error: any) => {
        showSnackbar(
          extractApiError(error, "Cancellation policy creation failed"),
          "error",
        );
        setIsSavingCancellationPolicy(false);
      },
    });
  };

  const handleSaveAllCancellationPolicies = async () => {
    const isValid = await trigger("cancellation_policies");
    if (!isValid) return;

    const allValues = getValues();
    const cancellationPoliciesList = allValues.cancellation_policies;

    if (!companyId) {
      showSnackbar("Please register the company first", "error");
      return;
    }

    let successCount = 0;
    setIsSavingCancellationPolicy(true);

    cancellationPoliciesList.forEach((cancellationPolicy) => {
      const payload: CompanyCancellationPolicyPayload = {
        ...cancellationPolicy,
        company: companyId,
      };

      createCancellationPolicy(payload, {
        onSuccess: () => {
          successCount++;

          if (successCount === cancellationPoliciesList.length) {
            showSnackbar(
              `${successCount} cancellation policy(s) created successfully`,
              "success",
            );
            setIsSavingCancellationPolicy(false);
          }
        },
        onError: (error: any) => {
          showSnackbar(
            extractApiError(error, "Cancellation policy creation failed"),
            "error",
          );
          setIsSavingCancellationPolicy(false);
        },
      });
    });
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
            onSaveAddress={handleSaveAddress}
          />
        );
      case 2:
        return (
          <WorkingHoursForm
            control={control}
            fieldArray={workingHoursFieldArray}
            errors={errors}
          />
        );
      case 3:
        return (
          <CancellationPolicyForm
            control={control}
            errors={errors}
            fieldArray={cancellationPolicyFieldArray}
            onSaveCancellationPolicy={handleSaveCancellationPolicy}
            isSavingCancellationPolicy={isSavingCancellationPolicy}
          />
        );
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
      <Box sx={{ width: "90%" }}>
        <Breadcrumb
          items={[
            { label: "Companies", href: "/provider/company" },
            { label: "Add" },
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
                  type="button"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting || isSavingCancellationPolicy}
                  onClick={handleSaveAllCancellationPolicies}
                  sx={{
                    textTransform: "none",
                    px: 4,
                    py: 1.2,
                    borderRadius: 2,
                  }}
                >
                  {isSavingCancellationPolicy
                    ? "Saving..."
                    : "Save Cancellation Policies"}
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
