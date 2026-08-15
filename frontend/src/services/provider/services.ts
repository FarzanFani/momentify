import axiosInstance from "@/api/axiosInstance";
import { ApiResponse } from "@/types/general";

export type GeneralListType<T, Extra = {}> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
} & Extra;

export type CategoryServices = {
  id: number;
  name: string;
  slug: string;
};

export type ServicesCategory = {
  id: number;
  name: string;
};

export type CompanyServicesFormValues = {
  company: string;
  name: string;
  description: string;
  category: string;
  duration_minutes: number;
  max_capacity: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  price: number;
  is_active: boolean;
  minimum_billable_guest: number;
  fixed_guest_count: number;
  guest_count_policy: "variable" | "fixed";
  price_per_guest: number;
};

export type CompanyServicesPayload = {
  company_id?: string;
  category_id?: string;
  search?: string;
};

export interface CompanyServices extends CompanyServicesFormValues {
  id: string;
  category_name: string;
  company_name: string;
}

export interface CompanyServicesTinyList {
  id: string;
  name: string;
  price: number;
}

export type ServiceTypeInPackagesPatyload = {
  service: string;
  service_name?: string;
  price?: number;
  quantity: number;
  required: boolean;
};

export type ServicePackagesPayload = {
  name: string;
  description: string;
  category: string;
  company: string;
  pricing_method: string;
  fixed_discount?: number;
  percentage_discount?: number;
  fixed_price?: number;
  allow_full_payment: boolean;
  installment_amount?: number;
  deposit_percentage?: number;
  installment_interval?: string;
  allow_scheduling_late: boolean;
  services: ServiceTypeInPackagesPatyload[];
};

export interface ServicePackage extends ServicePackagesPayload {
  id: string;
  company_name: string;
  category_name: string;
}

export const getProviderServicesList = async (
  params: CompanyServicesPayload,
): Promise<GeneralListType<CompanyServices>> => {
  const { data } = await axiosInstance.get<
    ApiResponse<GeneralListType<CompanyServices>>
  >("/api/provider/services/", { params });

  if (!data.success) {
    throw data;
  }

  return data.data as GeneralListType<CompanyServices>;
};

export const getProviderServicesTinyList = async (
  company_id: string,
  category_id: string,
) => {
  const { data } = await axiosInstance.get<
    ApiResponse<CompanyServicesTinyList[]>
  >(`/api/companies/${company_id}/services/tiny-list/`, {
    params: { category_id },
  });

  if (!data.success) {
    throw data;
  }

  return data.data as CompanyServicesTinyList[];
};

export const getServicesCategoryTinyList = async (): Promise<
  CategoryServices[]
> => {
  const { data } = await axiosInstance.get<ApiResponse<CategoryServices[]>>(
    "/api/services/categories/tiny-list/",
  );

  if (!data.success) {
    throw data;
  }

  return data.data as CategoryServices[];
};

export const postProviderService = async (
  payload: CompanyServicesFormValues,
): Promise<CompanyServices> => {
  const { data } = await axiosInstance.post<ApiResponse<CompanyServices>>(
    `/api/companies/${payload.company}/services/`,
    payload,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as CompanyServices;
};

export const putProviderService = async ({
  id,
  service,
}: {
  id: string;
  service: CompanyServicesFormValues;
}): Promise<CompanyServices> => {
  const { data } = await axiosInstance.put<ApiResponse<CompanyServices>>(
    `/api/companies/${service.company}/services/${id}/`,
    service,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as CompanyServices;
};

export const postProviderPackage = async (
  payload: ServicePackagesPayload,
): Promise<ServicePackage> => {
  const { data } = await axiosInstance.post<ApiResponse<ServicePackage>>(
    `/api/companies/${payload.company}/packages/`,
    payload,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as ServicePackage;
};

export const getProviderPackagesList = async (
  companyId: string,
): Promise<GeneralListType<ServicePackage>> => {
  const { data } = await axiosInstance.get<
    ApiResponse<GeneralListType<ServicePackage>>
  >(`/api/companies/${companyId}/packages/`);

  if (!data.success) {
    throw data;
  }

  return data.data as GeneralListType<ServicePackage>;
};

export const retrieveProviderPackage = async (
  packageUuid: string,
): Promise<ServicePackage> => {
  const { data } = await axiosInstance.get<ApiResponse<ServicePackage>>(
    `/api/provider/packages/${packageUuid}/`,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as ServicePackage;
};

export const putProviderPackage = async ({
  id,
  servicePackage,
}: {
  id: string;
  servicePackage: ServicePackagesPayload;
}): Promise<ServicePackage> => {
  const { data } = await axiosInstance.put<ApiResponse<ServicePackage>>(
    `/api/companies/${servicePackage.company}/packages/${id}/`,
    servicePackage,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as ServicePackage;
};

export const retrieveProviderService = async (
  serviceUuid: string,
): Promise<CompanyServices> => {
  const { data } = await axiosInstance.get<ApiResponse<CompanyServices>>(
    `/api/provider/services/${serviceUuid}`,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as CompanyServices;
};
