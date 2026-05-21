import {
  CompanyLocation,
  CompanyLocationFormValues,
  CompanyLocationPayload,
  RegisterCompanyPayload,
  CompanyWorkingHour,
  CompanyWorkingHourPayload,
  WorkingHourFormValues,
  CompanyCancellationPolicy,
  CompanyCancellationPolicyPayload,
} from "@/components/provider/company/add/formTypes";
import axiosInstance from "@/api/axiosInstance";
import { ApiResponse } from "@/types/general";

export interface Company extends RegisterCompanyPayload {
  id: string;
  verification_status: string;
  is_profile_complete: boolean;
}

export interface CompanyListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Company[];
}

export interface AddressListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CompanyLocation[];
}

export interface WorkingHoursListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CompanyWorkingHour[];
}

export interface CancellationPolicyListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CompanyCancellationPolicy[];
}

export const registerCompany = async (
  payload: RegisterCompanyPayload,
): Promise<Company> => {
  const { data } = await axiosInstance.post<ApiResponse<Company>>(
    "/api/companies/",
    payload,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as Company;
};

export const updateCompany = async (
  id: string,
  payload: Partial<RegisterCompanyPayload>,
): Promise<Company> => {
  const { data } = await axiosInstance.patch<ApiResponse<Company>>(
    `/api/companies/${id}/`,
    payload,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as Company;
};

export const getCompanyById = async (id: string): Promise<Company> => {
  const { data } = await axiosInstance.get<ApiResponse<Company>>(
    `/api/companies/${id}/`,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as Company;
};

export const getProviderCompanies = async ({
  search,
  page,
  page_size,
}: {
  search?: string;
  page: number;
  page_size?: number;
}): Promise<CompanyListResponse> => {
  const { data } = await axiosInstance.get<ApiResponse<CompanyListResponse>>(
    "/api/companies/",
    { params: { search, page, page_size } },
  );

  if (!data.success) {
    throw data;
  }

  return data.data as CompanyListResponse;
};

export const createLocation = async (
  companyLocation: CompanyLocationPayload,
): Promise<CompanyLocation> => {
  const createdData: CompanyLocationFormValues = {
    address: companyLocation.address,
    city: companyLocation.city,
    country: companyLocation.country,
    latitude: companyLocation.latitude,
    longitude: companyLocation.longitude,
    name: companyLocation.name,
  };

  const { data } = await axiosInstance.post<ApiResponse<CompanyLocation>>(
    `/api/companies/${companyLocation.company}/locations/`,
    createdData,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as CompanyLocation;
};

export const getCompanyLocations = async (
  companyId: string,
): Promise<AddressListResponse> => {
  const { data } = await axiosInstance.get<ApiResponse<AddressListResponse>>(
    `/api/companies/${companyId}/locations/`,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as AddressListResponse;
};

export const updateLocation = async (
  location: CompanyLocation,
  companyId: string,
): Promise<CompanyLocation> => {
  const { data } = await axiosInstance.put<ApiResponse<CompanyLocation>>(
    `/api/companies/${companyId}/locations/${location.id}/`,
    location,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as CompanyLocation;
};

export const createWorkingHour = async (
  workingHour: CompanyWorkingHourPayload,
): Promise<CompanyWorkingHour> => {
  const createdData: WorkingHourFormValues = {
    weekday: workingHour.weekday,
    start_time: workingHour.start_time,
    end_time: workingHour.end_time,
  };

  const { data } = await axiosInstance.post<ApiResponse<CompanyWorkingHour>>(
    `/api/companies/${workingHour.company}/working-hours/`,
    createdData,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as CompanyWorkingHour;
};

export const getCompanyWorkingHours = async (
  companyId: string,
): Promise<CompanyWorkingHour[]> => {
  const { data } = await axiosInstance.get<
    ApiResponse<WorkingHoursListResponse | CompanyWorkingHour[]>
  >(`/api/companies/${companyId}/working-hours/`);

  if (!data.success) {
    throw data;
  }

  const responseData = data.data;

  if (Array.isArray(responseData)) {
    return responseData;
  }

  return responseData?.results ?? [];
};

export const updateWorkingHour = async (
  workingHour: CompanyWorkingHour,
  companyId: string,
): Promise<CompanyWorkingHour> => {
  const { data } = await axiosInstance.put<ApiResponse<CompanyWorkingHour>>(
    `/api/companies/${companyId}/working-hours/${workingHour.id}/`,
    workingHour,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as CompanyWorkingHour;
};

export const createCancellationPolicy = async (
  cancellationPolicy: CompanyCancellationPolicyPayload,
): Promise<CompanyCancellationPolicy> => {
  const createdData = {
    rule_description: cancellationPolicy.rule_description,
    hours_before_event: cancellationPolicy.hours_before_event,
    refund_precentage: cancellationPolicy.refund_precentage,
    priority: cancellationPolicy.priority,
    is_active: cancellationPolicy.is_active,
  };

  const { data } = await axiosInstance.post<
    ApiResponse<CompanyCancellationPolicy>
  >(
    `/api/companies/${cancellationPolicy.company}/cancellation-policy/`,
    createdData,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as CompanyCancellationPolicy;
};

export const getCompanyCancellationPolicies = async (
  companyId: string,
): Promise<CompanyCancellationPolicy[]> => {
  const { data } = await axiosInstance.get<
    ApiResponse<CancellationPolicyListResponse | CompanyCancellationPolicy[]>
  >(`/api/companies/${companyId}/cancellation-policy/`);

  if (!data.success) {
    throw data;
  }

  const responseData = data.data;

  if (Array.isArray(responseData)) {
    return responseData;
  }

  return responseData?.results ?? [];
};

export const updateCancellationPolicy = async (
  cancellationPolicy: CompanyCancellationPolicy,
  companyId: string,
): Promise<CompanyCancellationPolicy> => {
  const updatedData = {
    rule_description: cancellationPolicy.rule_description,
    hours_before_event: cancellationPolicy.hours_before_event,
    refund_precentage: cancellationPolicy.refund_precentage,
    priority: cancellationPolicy.priority,
    is_active: cancellationPolicy.is_active,
  };

  const { data } = await axiosInstance.put<
    ApiResponse<CompanyCancellationPolicy>
  >(
    `/api/companies/${companyId}/cancellation-policy/${cancellationPolicy.id}/`,
    updatedData,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as CompanyCancellationPolicy;
};

export const deleteCompanyLocation = async (
  companyId: string,
  locationId: string,
): Promise<void> => {
  const { data } = await axiosInstance.delete(
    `/api/companies/${companyId}/location/${locationId}/`,
  );

  if (!data.success) {
    throw data;
  }

  return data as void;
};
