import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  createWorkingHour,
  getCompanyWorkingHours,
  WorkingHoursListResponse,
  updateWorkingHour,
  updateCancellationPolicy,
  getCompanyCancellationPolicies,
  createCancellationPolicy,
  deleteCompanyLocation,
} from "@/services/provider/company";
import {
  CompanyLocation,
  CompanyLocationPayload,
  CompanyWorkingHour,
  CompanyWorkingHourPayload,
  RegisterCompanyPayload,
  CompanyCancellationPolicyPayload,
  CompanyCancellationPolicy,
} from "@/components/provider/company/add/formTypes";

export const useRegisterCompany = () => {
  return useMutation({
    mutationFn: registerCompany,
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<RegisterCompanyPayload>;
    }) => updateCompany(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["company", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};

export const useGetCompanyById = (id: string) => {
  return useQuery({
    queryKey: ["company", id],
    queryFn: () => getCompanyById(id),
    enabled: !!id,
  });
};

export const useGetProviderCompanies = (
  page: number,
  search?: string,
  page_size?: number,
) => {
  return useQuery({
    queryKey: ["companies", search, page, page_size],
    queryFn: () => getProviderCompanies({ search, page, page_size }),
  });
};

export const useCreateCompanyLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLocation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["company-locations", variables.company],
      });
    },
  });
};

export const useGetCompanyLocations = (companyId: string) => {
  return useQuery({
    queryKey: ["company-locations", companyId],
    queryFn: () => getCompanyLocations(companyId),
    enabled: !!companyId,
  });
};

export const updateCompanyLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      payload,
    }: {
      companyId: string;
      payload: CompanyLocation;
    }) => updateLocation(payload, companyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["company-locations", variables.companyId],
      });
    },
  });
};

export const useCreateCompanyWorkingHour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkingHour,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["company-working-hours", variables.company],
      });
    },
  });
};

export const useGetCompanyWorkingHours = (companyId: string) => {
  return useQuery({
    queryKey: ["company-working-hours", companyId],
    queryFn: () => getCompanyWorkingHours(companyId),
    enabled: !!companyId,
  });
};

export const updateCompanyWorkingHour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      payload,
    }: {
      companyId: string;
      payload: CompanyWorkingHour;
    }) => updateWorkingHour(payload, companyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["company-working-hours", variables.companyId],
      });
    },
  });
};

export const useCreateCompanyCancellationPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCancellationPolicy,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["company-cancellation-policies", variables.company],
      });
    },
  });
};

export const useGetCompanyCancellationPolicies = (companyId: string) => {
  return useQuery({
    queryKey: ["company-cancellation-policies", companyId],
    queryFn: () => getCompanyCancellationPolicies(companyId),
    enabled: !!companyId,
  });
};

export const updateCompanyCancellationPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      payload,
    }: {
      companyId: string;
      payload: CompanyCancellationPolicy;
    }) => updateCancellationPolicy(payload, companyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["company-cancellation-policies", variables.companyId],
      });
    },
  });
};

export const useDeleteCompanyLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      locationId,
    }: {
      companyId: string;
      locationId: string;
    }) => deleteCompanyLocation(companyId, locationId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["company-locations", variables.companyId],
      });
    },
  });
};
