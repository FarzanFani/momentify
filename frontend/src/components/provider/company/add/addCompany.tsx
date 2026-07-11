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
import { useRouter } from "next/navigation";

const steps = [
  "Register Company",
  "Location",
  "Working Hours",
  "Cancellation Policy",
];

export default function AddCompany() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const { mutateAsync: registerCompanyAsync, isPending: isRegisterCompany } =
    useRegisterCompany();

  const {
    mutateAsync: createCompanyLocationAsync,
    isPending: isCreateLocation,
  } = useCreateCompanyLocation();

  const {
    mutateAsync: createWorkingHourAsync,
    isPending: isCreateWorkingHours,
  } = useCreateCompanyWorkingHour();

  const {
    mutateAsync: createCancellationPolicyAsync,
    isPending: isCreateCancellationPolicy,
  } = useCreateCompanyCancellationPolicy();

  const [companyId, setCompanyId] = useState<string>("");
  const [activeStep, setActiveStep] = useState(0);
  const [maxVisitedStep, setMaxVisitedStep] = useState(0);

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    getValues,
    formState: { errors },
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

      try {
        const data = await registerCompanyAsync(payload);

        setCompanyId(data.id);
        showSnackbar("Company registered successfully", "success");
        advanceStep();
      } catch (error: any) {
        showSnackbar(
          extractApiError(error, "Company registration failed"),
          "error",
        );
      }

      return;
    }

    if (activeStep === 1) {
      const locationsList = allValues.locations;

      if (!companyId) {
        showSnackbar("Please register the company first", "error");
        return;
      }

      try {
        await Promise.all(
          locationsList.map((loc) => {
            const payload: CompanyLocationPayload = {
              ...loc,
              company: companyId,
            };

            return createCompanyLocationAsync(payload);
          }),
        );

        showSnackbar(
          `${locationsList.length} location(s) created successfully`,
          "success",
        );

        advanceStep();
      } catch (error: any) {
        showSnackbar(
          extractApiError(error, "Location creation failed"),
          "error",
        );
      }

      return;
    }

    if (activeStep === 2) {
      const workingHoursList = allValues.working_hours;

      if (!companyId) {
        showSnackbar("Please register the company first", "error");
        return;
      }

      try {
        await Promise.all(
          workingHoursList.map((workingHour) =>
            createWorkingHourAsync({
              company: companyId,
              weekday: workingHour.weekday,
              start_time: workingHour.start_time,
              end_time: workingHour.end_time,
            }),
          ),
        );

        showSnackbar(
          `${workingHoursList.length} working hour(s) created successfully`,
          "success",
        );

        advanceStep();
      } catch (error: any) {
        showSnackbar(
          extractApiError(error, "Working hours creation failed"),
          "error",
        );
      }

      return;
    }

    if (activeStep === 3) {
      const cancellationPoliciesList = allValues.cancellation_policies;

      if (!companyId) {
        showSnackbar("Please register the company first", "error");
        return;
      }

      try {
        await Promise.all(
          cancellationPoliciesList.map((cancellationPolicy) => {
            const payload: CompanyCancellationPolicyPayload = {
              ...cancellationPolicy,
              company: companyId,
            };

            return createCancellationPolicyAsync(payload);
          }),
        );

        showSnackbar(
          `${cancellationPoliciesList.length} cancellation policy(s) created successfully`,
          "success",
        );

        router.push("/provider/company/");
      } catch (error: any) {
        showSnackbar(
          extractApiError(error, "Cancellation policy creation failed"),
          "error",
        );
      }

      return;
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const renderStepForm = () => {
    switch (activeStep) {
      case 0:
        return <RegisterForm control={control} errors={errors} isAddPage />;

      case 1:
        return (
          <LocationForm
            control={control}
            errors={errors}
            fieldArray={locationFieldArray}
            isAddPage
          />
        );

      case 2:
        return (
          <WorkingHoursForm
            control={control}
            fieldArray={workingHoursFieldArray}
            errors={errors}
            isAddPage
          />
        );

      case 3:
        return (
          <CancellationPolicyForm
            control={control}
            errors={errors}
            fieldArray={cancellationPolicyFieldArray}
            isAddPage
          />
        );

      default:
        return null;
    }
  };

  const isLoading =
    isRegisterCompany ||
    isCreateLocation ||
    isCreateWorkingHours ||
    isCreateCancellationPolicy;

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
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Typography
                    onClick={() => {
                      if (index <= maxVisitedStep) setActiveStep(index);
                    }}
                    sx={{
                      color:
                        activeStep === index
                          ? "primary.main"
                          : activeStep > index
                            ? "green"
                            : "grey.500",
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
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 1,
              }}
            >
              <Button
                variant="outlined"
                color="primary"
                disabled={activeStep === 0 || isLoading}
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

              <Button
                type="button"
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={isLoading}
                sx={{
                  textTransform: "none",
                  px: 4,
                  py: 1.2,
                  borderRadius: 2,
                }}
              >
                {isLoading ? "Saving..." : activeStep === 3 ? "Done" : "Next"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
