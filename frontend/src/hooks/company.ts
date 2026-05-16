import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ApiResponse } from "@/types/general";
import {
  Company,
  registerCompany,
  updateCompany,
  getCompanyById,
  getProviderCompanies,
  CompanyListResponse,
  createLocation,
  getCompanyLocations,
  AddressListResponse,
  updateLocation,
} from "@/services/provider/company";
import {
  CompanyLocation,
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

export const useCreateCompanyLocation = () => {
  return useMutation<
    CompanyLocation,
    AxiosError<ApiResponse<null>>,
    CompanyLocationPayload
  >({ mutationFn: createLocation });
};

export const useGetCompanyLocations = (id: string) => {
  return useQuery<
    AddressListResponse,
    AxiosError<ApiResponse<null>>,
    AddressListResponse
  >({
    queryKey: ["company-location", id],
    queryFn: () => getCompanyLocations(id),
    enabled: !!id,
  });
};

export const updateCompanyLocation = () => {
  return useMutation<
    CompanyLocation,
    AxiosError<ApiResponse<null>>,
    { companyId: string; payload: CompanyLocation }
  >({
    mutationFn: ({ companyId, payload }) => updateLocation(payload, companyId),
  });
};
