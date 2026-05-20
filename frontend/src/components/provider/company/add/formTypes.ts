import { Control, FieldErrors, UseFieldArrayReturn } from "react-hook-form";

export interface RegisterCompanyFormValues {
  name: string;
  email: string;
  phone_number: string;
  description: string;
  timezone: string;
  auto_approve_booking: boolean;
}

export interface CompanyLocationFormValues {
  address: string;
  city: string;
  country: string;
  latitude: string;
  longitude: string;
  name: string;
  id?: string;
}

export interface WorkingHourFormValues {
  weekday: string[];
  start_time: string;
  end_time: string;
  id?: string;
}

export interface WorkingHoursFormValues {
  working_hours: WorkingHourFormValues[];
}

export interface CancellationPolicyFormValues {
  rule_description: string;
  hours_before_event: string;
  refund_precentage: string;
  priority: string;
  is_active: boolean;
  id?: string;
}

export interface CancellationPoliciesFormValues {
  cancellation_policies: CancellationPolicyFormValues[];
}

export interface AddCompanyFormValues
  extends
    RegisterCompanyFormValues,
    WorkingHoursFormValues,
    CancellationPoliciesFormValues {
  locations: CompanyLocationFormValues[];
}

export type RegisterCompanyPayload = RegisterCompanyFormValues;

export interface CompanyLocationPayload extends CompanyLocationFormValues {
  company: string;
}

export interface CompanyLocation extends CompanyLocationPayload {
  id: string;
}

export interface CompanyWorkingHourPayload {
  company: string;
  weekday: string[];
  start_time: string;
  end_time: string;
  id?: string;
}

export interface CompanyWorkingHour {
  id: string;
  company: string;
  weekday: string[];
  start_time: string;
  end_time: string;
}

export interface CompanyCancellationPolicyPayload {
  company: string;
  rule_description: string;
  hours_before_event: string;
  refund_precentage: string;
  priority: string;
  is_active: boolean;
  id?: string;
}

export interface CompanyCancellationPolicy {
  id: string;
  company: string;
  rule_description: string;
  hours_before_event: string;
  refund_precentage: string;
  priority: string;
  is_active: boolean;
}

export type WorkingHoursPayload = CompanyWorkingHourPayload;
export type CancellationPolicyPayload = CompanyCancellationPolicyPayload;

export interface StepFormProps {
  control: Control<AddCompanyFormValues>;
  errors: FieldErrors<AddCompanyFormValues>;
}

export interface LocationFormProps extends StepFormProps {
  fieldArray: UseFieldArrayReturn<AddCompanyFormValues, "locations", "fieldId">;
  onSaveAddress?: (index: number) => void;
  isSavingAddress?: boolean;
}

export type RegisterFormProps = StepFormProps;

export interface WorkingHoursFormProps extends StepFormProps {
  fieldArray: UseFieldArrayReturn<
    AddCompanyFormValues,
    "working_hours",
    "fieldId"
  >;
  onSaveWorkingHour?: (index: number) => void;
  isSavingWorkingHour?: boolean;
}

export interface CancellationPolicyFormProps extends StepFormProps {
  fieldArray: UseFieldArrayReturn<
    AddCompanyFormValues,
    "cancellation_policies",
    "fieldId"
  >;
  onSaveCancellationPolicy?: (index: number) => void;
  isSavingCancellationPolicy?: boolean;
}
