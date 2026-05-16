import {
  CompanyLocation,
  CompanyLocationFormValues,
  CompanyLocationPayload,
  RegisterCompanyPayload,
} from "@/components/provider/company/add/formTypes";
import axiosInstance from "@/api/axiosInstance";
import { ApiResponse } from "@/types/general";

export interface Company extends RegisterCompanyPayload {
  id: string;
  verification_status: string;
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

export const getProviderCompanies = async (
  search: string,
): Promise<CompanyListResponse> => {
  const { data } = await axiosInstance.get<ApiResponse<CompanyListResponse>>(
    "/api/companies/",
    { params: { search } },
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

  const { data } = await axiosInstance.post<
    ApiResponse<CompanyLocationPayload>
  >(`/api/companies/${companyLocation.company}/locations/`, createdData);

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
  console.log(location);

  const { data } = await axiosInstance.put<ApiResponse<CompanyLocation>>(
    `/api/companies/${companyId}/locations/${location.id}/`,
    location,
  );

  if (!data.success) {
    throw data;
  }
  return data.data as CompanyLocation;
};
