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
