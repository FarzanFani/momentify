"use client";

import { useEffect, useState } from "react";
import {
  updateCompanyCancellationPolicy,
  updateCompanyLocation,
  updateCompanyWorkingHour,
  useCreateCompanyCancellationPolicy,
  useCreateCompanyLocation,
  useCreateCompanyWorkingHour,
  useGetCompanyById,
  useGetCompanyCancellationPolicies,
  useGetCompanyLocations,
  useGetCompanyWorkingHours,
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
import RegisterForm from "@/components/provider/company/detailsForm/registerForm";
import WorkingHoursForm from "@/components/provider/company/detailsForm/workingHoursForm";
import CancellationPolicyForm from "@/components/provider/company/detailsForm/cancellationPolicyForm";
import {
  AddCompanyFormValues,
  CompanyCancellationPolicy,
  RegisterCompanyPayload,
} from "@/components/provider/company/add/formTypes";
import LocationForm from "../detailsForm/locationForm";

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

const emptyWorkingHour = {
  weekday: [],
  start_time: "",
  end_time: "",
};

const emptyCancellationPolicy = {
  rule_description: "",
  hours_before_event: "",
  refund_precentage: "",
  priority: "",
  is_active: true,
};

export default function CompanyEdit({ companyId }: CompanyEditProps) {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const { data: company, isLoading } = useGetCompanyById(companyId);

  const { data: locations, isLoading: isLocationLoading } =
    useGetCompanyLocations(companyId);

  const { data: workingHoursData, isLoading: isWorkingHoursLoading } =
    useGetCompanyWorkingHours(companyId);

  const {
    data: cancellationPoliciesData,
    isLoading: isCancellationPoliciesLoading,
  } = useGetCompanyCancellationPolicies(companyId);

  const { mutate: updateCompany, isPending: isUpdating } = useUpdateCompany();

  const { mutate: createCompanyLocation, isPending: isLocationCreating } =
    useCreateCompanyLocation();

  const { mutate: updateLocation, isPending: isLocationUpdating } =
    updateCompanyLocation();

  const { mutate: updateWorkingHour, isPending: isWorkingHourUpdating } =
    updateCompanyWorkingHour();

  const { mutate: createWorkingHour, isPending: isWorkingHourCreating } =
    useCreateCompanyWorkingHour();

  const {
    mutate: updateCancellationPolicy,
    isPending: isCancellationPolicyUpdating,
  } = updateCompanyCancellationPolicy();

  const {
    mutate: createCancellationPolicy,
    isPending: isCancellationPolicyCreating,
  } = useCreateCompanyCancellationPolicy();

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
      auto_approve_booking: false,
      working_hours: [emptyWorkingHour],
      cancellation_policies: [emptyCancellationPolicy],
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

  const { replace } = locationFieldArray;
  const { replace: replaceWorkingHours } = workingHoursFieldArray;
  const { replace: replaceCancellationPolicies } = cancellationPolicyFieldArray;

  useEffect(() => {
    if (!company) return;

    reset({
      name: company.name ?? "",
      email: company.email ?? "",
      phone_number: company.phone_number ?? "",
      description: company.description ?? "",
      timezone: company.timezone ?? "UTC",
      auto_approve_booking: company.auto_approve_booking ?? false,
      working_hours: getValues("working_hours"),
      cancellation_policies: getValues("cancellation_policies"),
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

  useEffect(() => {
    const workingHours = workingHoursData;

    if (!workingHours || workingHours.length === 0) {
      replaceWorkingHours([emptyWorkingHour]);
      return;
    }

    replaceWorkingHours(
      workingHours.map((workingHour) => ({
        id: workingHour.id,
        weekday: (workingHour.weekday ?? []).map(String),
        start_time: workingHour.start_time ?? "",
        end_time: workingHour.end_time ?? "",
      })),
    );
  }, [workingHoursData, replaceWorkingHours]);

  useEffect(() => {
    const cancellationPolicies = cancellationPoliciesData;

    if (!cancellationPolicies || cancellationPolicies.length === 0) {
      replaceCancellationPolicies([emptyCancellationPolicy]);
      return;
    }

    replaceCancellationPolicies(
      cancellationPolicies.map((policy) => ({
        id: policy.id,
        rule_description: policy.rule_description ?? "",
        hours_before_event: policy.hours_before_event?.toString() ?? "",
        refund_precentage: policy.refund_precentage?.toString() ?? "",
        priority: policy.priority?.toString() ?? "",
        is_active: policy.is_active ?? true,
      })),
    );
  }, [cancellationPoliciesData, replaceCancellationPolicies]);

  const stepFields: FieldPath<AddCompanyFormValues>[][] = [
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
        auto_approve_booking: allValues.auto_approve_booking,
      };

      updateCompany(
        { id: companyId, payload },
        {
          onSuccess: () => {
            showSnackbar("Company info updated", "success");
            setActiveStep((prev) => prev + 1);
          },
          onError: (error: any) => {
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
      auto_approve_booking: values.auto_approve_booking,
    };

    updateCompany(
      { id: companyId, payload },
      {
        onSuccess: () => {
          showSnackbar("Company updated successfully", "success");
          router.push(`/provider/company/${companyId}/preview`);
        },
        onError: (error: any) => {
          showSnackbar(extractApiError(error, "Update failed"), "error");
        },
      },
    );
  };

  const handleSaveAddress = async (index: number) => {
    const isValid = await trigger(
      `locations.${index}` as FieldPath<AddCompanyFormValues>,
    );
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
            id,
          },
        },
        {
          onSuccess: () => {
            showSnackbar("Location updated successfully", "success");
          },
          onError: (error: any) => {
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
        onError: (error: any) => {
          showSnackbar(
            extractApiError(error, "Location creation failed"),
            "error",
          );
        },
      },
    );
  };

  const handleSaveWorkingHour = async (index: number) => {
    const isValid = await trigger(
      `working_hours.${index}` as FieldPath<AddCompanyFormValues>,
    );
    if (!isValid) return;

    const workingHour = getValues(`working_hours.${index}`);

    const { id, ...workingHourPayload } = workingHour;

    if (id) {
      updateWorkingHour(
        {
          companyId,
          payload: {
            ...workingHourPayload,
            company: companyId,
            id,
          },
        },
        {
          onSuccess: () => {
            showSnackbar("Working hours updated successfully", "success");
          },
          onError: (error: any) => {
            showSnackbar(
              extractApiError(error, "Working hours update failed"),
              "error",
            );
          },
        },
      );

      return;
    }

    createWorkingHour(
      {
        ...workingHourPayload,
        company: companyId,
      },
      {
        onSuccess: () => {
          showSnackbar("Working hours created successfully", "success");
        },
        onError: (error: any) => {
          showSnackbar(
            extractApiError(error, "Working hours creation failed"),
            "error",
          );
        },
      },
    );
  };

  const handleSaveCancellationPolicy = async (index: number) => {
    const isValid = await trigger(
      `cancellation_policies.${index}` as FieldPath<AddCompanyFormValues>,
    );
    if (!isValid) return;

    const cancellationPolicy = getValues(`cancellation_policies.${index}`);

    const { id, ...cancellationPolicyPayload } = cancellationPolicy;

    if (id) {
      updateCancellationPolicy(
        {
          companyId,
          payload: {
            ...cancellationPolicyPayload,
            company: companyId,
            id,
          } as CompanyCancellationPolicy,
        },
        {
          onSuccess: () => {
            showSnackbar("Cancellation policy updated successfully", "success");
          },
          onError: (error: any) => {
            showSnackbar(
              extractApiError(error, "Cancellation policy update failed"),
              "error",
            );
          },
        },
      );

      return;
    }

    createCancellationPolicy(
      {
        ...cancellationPolicyPayload,
        company: companyId,
      },
      {
        onSuccess: () => {
          showSnackbar("Cancellation policy created successfully", "success");
        },
        onError: (error: any) => {
          showSnackbar(
            extractApiError(error, "Cancellation policy creation failed"),
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
        return (
          <WorkingHoursForm
            fieldArray={workingHoursFieldArray}
            control={control}
            errors={errors}
            onSaveWorkingHour={handleSaveWorkingHour}
            isSavingWorkingHour={isWorkingHourUpdating || isWorkingHourCreating}
          />
        );

      case 3:
        return (
          <CancellationPolicyForm
            control={control}
            errors={errors}
            fieldArray={cancellationPolicyFieldArray}
            onSaveCancellationPolicy={handleSaveCancellationPolicy}
            isSavingCancellationPolicy={
              isCancellationPolicyUpdating || isCancellationPolicyCreating
            }
          />
        );

      default:
        return null;
    }
  };

  if (
    isLoading ||
    isLocationLoading ||
    isWorkingHoursLoading ||
    isCancellationPoliciesLoading
  ) {
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
        <Typography variant="h4" fontWeight={700} color="primary.main">
          Edit Company
        </Typography>
      </Box>
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
