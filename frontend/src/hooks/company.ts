import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  registerCompany,
  updateCompany,
  getCompanyById,
  getProviderCompanies,
  createLocation,
  getCompanyLocations,
  updateLocation,
  createWorkingHour,
  getCompanyWorkingHours,
  updateWorkingHour,
  updateCancellationPolicy,
  getCompanyCancellationPolicies,
  createCancellationPolicy,
  deleteCompanyLocation,
  deleteCompanyCancellationPolicy,
  deleteCompanyWorkingHour,
  getCompanyPreview,
  getProviderCompanyTinyList,
} from "@/services/provider/company";
import {
  CompanyLocation,
  CompanyWorkingHour,
  RegisterCompanyPayload,
  CompanyCancellationPolicy,
} from "@/components/provider/company/add/formTypes";
import { getPublicCompaniesTinyList } from "@/services/public/public";

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

export const useGetCompanyTinyList = () => {
  return useQuery({
    queryKey: ["company-tiny-list"],
    queryFn: getProviderCompanyTinyList,
    refetchOnWindowFocus: false,
  });
};

export const useGetPublicCompanyTinyList = () => {
  return useQuery({
    queryKey: ["public-company-tiny-list"],
    queryFn: getPublicCompaniesTinyList,
    refetchOnWindowFocus: false,
  });
};

export const useGetCompanyPreivew = (id: string) => {
  return useQuery({
    queryKey: ["company", id],
    queryFn: () => getCompanyPreview(id),
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

export const useDeleteCompanyWorkingHour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      workingHourId,
    }: {
      companyId: string;
      workingHourId: string;
    }) => deleteCompanyWorkingHour(companyId, workingHourId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["company-working-hours", variables.companyId],
      });
    },
  });
};

export const useDeleteCompanyCancellationPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      cancellationPolicyId,
    }: {
      companyId: string;
      cancellationPolicyId: string;
    }) => deleteCompanyCancellationPolicy(companyId, cancellationPolicyId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["company-cancellation-policies", variables.companyId],
      });
    },
  });
};
