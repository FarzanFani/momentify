import {
  CompanyLocationPayload,
  RegisterCompanyPayload,
} from "@/components/provider/company/add/formTypes";
import axiosInstance from "@/api/axiosInstance";
import { ApiResponse } from "@/types/general";

export interface Company extends RegisterCompanyPayload {
  id: string;
  verification_status: string;
}
export interface CompanyLocation extends CompanyLocationPayload {
  id: string;
}

export interface CompanyListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Company[];
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

export const createCompanyLocation = async (
  payload: CompanyLocationPayload,
): Promise<CompanyLocation> => {
  const { data } = await axiosInstance.post<ApiResponse<CompanyLocation>>(
    "/api/company-locations/",
    payload,
  );

  if (!data.success) {
    throw data;
  }
  return data.data as CompanyLocation;
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

export interface CompanyLocationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CompanyLocation[];
}

export const getCompanyLocations = async (
  companyId: string,
): Promise<CompanyLocationListResponse> => {
  const { data } = await axiosInstance.get<
    ApiResponse<CompanyLocationListResponse>
  >("/api/company-locations/", { params: { company: companyId } });

  if (!data.success) {
    throw data;
  }
  return data.data as CompanyLocationListResponse;
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

export const updateCompanyLocation = async (
  id: string,
  payload: Partial<CompanyLocationPayload>,
): Promise<CompanyLocation> => {
  const { data } = await axiosInstance.patch<ApiResponse<CompanyLocation>>(
    `/api/company-locations/${id}/`,
    payload,
  );

  if (!data.success) {
    throw data;
  }
  return data.data as CompanyLocation;
};
