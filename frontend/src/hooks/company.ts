import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ApiResponse } from "@/types/general";
import {
  Company,
  CompanyLocation,
  CompanyLocationListResponse,
  createCompanyLocation,
  registerCompany,
  updateCompany,
  getCompanyById,
  getCompanyLocations,
  getProviderCompanies,
  CompanyListResponse,
  updateCompanyLocation,
} from "@/services/provider/company";
import {
  CompanyLocationPayload,
  RegisterCompanyPayload,
} from "@/components/provider/company/add/formTypes";

export const useRegisterCompany = () => {
  return useMutation<
    Company,
    AxiosError<ApiResponse<null>>,
    RegisterCompanyPayload
  >({
    mutationFn: registerCompany,
  });
};

export const useCreateCompanyLocation = () => {
  return useMutation<
    CompanyLocation,
    AxiosError<ApiResponse<null>>,
    CompanyLocationPayload
  >({
    mutationFn: createCompanyLocation,
  });
};

export const useUpdateCompany = () => {
  return useMutation<
    Company,
    AxiosError<ApiResponse<null>>,
    { id: string; payload: Partial<RegisterCompanyPayload> }
  >({
    mutationFn: ({ id, payload }) => updateCompany(id, payload),
  });
};

export const useGetCompanyById = (id: string) => {
  return useQuery<Company, AxiosError<ApiResponse<null>>, Company>({
    queryKey: ["company", id],
    queryFn: () => getCompanyById(id),
    enabled: !!id,
  });
};

export const useGetCompanyLocations = (companyId: string) => {
  return useQuery<
    CompanyLocationListResponse,
    AxiosError<ApiResponse<null>>,
    CompanyLocationListResponse
  >({
    queryKey: ["company-locations", companyId],
    queryFn: () => getCompanyLocations(companyId),
    enabled: !!companyId,
  });
};

export const useGetProviderCompanies = (search: string) => {
  return useQuery<
    CompanyListResponse,
    AxiosError<ApiResponse<null>>,
    CompanyListResponse
  >({
    queryKey: ["provider-companies", search],
    queryFn: () => getProviderCompanies(search),
  });
};

export const useUpdateCompanyLocation = () => {
  return useMutation<
    CompanyLocation,
    AxiosError<ApiResponse<null>>,
    { id: string; payload: Partial<CompanyLocationPayload> }
  >({
    mutationFn: ({ id, payload }) => updateCompanyLocation(id, payload),
  });
};
