import { Control, FieldErrors, UseFieldArrayReturn } from "react-hook-form";

export interface RegisterCompanyFormValues {
  name: string;
  email: string;
  phone_number: string;
  description: string;
  timezone: string;
  cancellation_policy_text: string;
  auto_approve_booking: boolean;
}

export interface CompanyLocationFormValues {
  address: string;
  city: string;
  country: string;
  latitude: string;
  longitude: string;
}

export interface WorkingHoursFormValues {
  work_start_time: string;
  work_end_time: string;
  working_days: string;
}

export interface CancellationPolicyFormValues {
  cancellation_policy_text: string;
  auto_approve_booking: boolean;
}

export interface AddCompanyFormValues extends RegisterCompanyFormValues, WorkingHoursFormValues {
  locations: CompanyLocationFormValues[];
}

export type RegisterCompanyPayload = RegisterCompanyFormValues;
export interface CompanyLocationPayload extends CompanyLocationFormValues {
  company: string;
}
export type WorkingHoursPayload = WorkingHoursFormValues;
export type CancellationPolicyPayload = CancellationPolicyFormValues;

export interface StepFormProps {
  control: Control<AddCompanyFormValues>;
  errors: FieldErrors<AddCompanyFormValues>;
}

export interface LocationFormProps extends StepFormProps {
  fieldArray: UseFieldArrayReturn<AddCompanyFormValues, "locations">;
}

export type RegisterFormProps = StepFormProps;
export type WorkingHoursFormProps = StepFormProps;
export type CancellationPolicyFormProps = StepFormProps;
