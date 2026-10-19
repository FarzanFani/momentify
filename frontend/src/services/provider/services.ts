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
  max_capacity: number;
  category_name: string | null;
}

export type ServiceTypeInPackagesPatyload = {
  service: string;
  service_name?: string;
  price?: number | string;
  quantity: number | string;
  required: boolean;
};

export type PackagePricingMethod =
  | "service_total"
  | "fixed_price"
  | "percentage_discount"
  | "fixed_discount";

export type ServicePackagesPayload = {
  name: string;
  description: string;
  category: string;
  company: string;
  is_active: boolean;
  pricing_method: PackagePricingMethod;
  fixed_discount?: number | string | null;
  percentage_discount?: number | string | null;
  fixed_price?: number | string | null;
  included_guests: number | string;
  price_per_extra_guest: number | string;
  allow_full_payment: boolean;
  installment_count?: number | string | null;
  deposit_percentage?: number | string | null;
  installment_interval?: string | null;
  allow_scheduling_late: boolean;
  scheduling_deadline_days?: number | string | null;
  services: ServiceTypeInPackagesPatyload[];
};

export type ServicePackageItem = Omit<
  ServiceTypeInPackagesPatyload,
  "price" | "quantity"
> & {
  id: string;
  quantity: number;
  service_name: string;
  service_price: string;
  service_category_name: string | null;
  price: string;
  line_total: string;
};

export interface ServicePackage
  extends Omit<ServicePackagesPayload, "services"> {
  id: string;
  company_name: string;
  category_name: string;
  cover_image: string | null;
  services: ServicePackageItem[];
  services_subtotal: string;
  addons_subtotal: string;
  total_price: string;
  savings: string;
  installment_amount: string | null;
  max_guests: number | null;
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

export const getProviderServicesTinyList = async (company_id: string) => {
  const { data } = await axiosInstance.get<
    ApiResponse<CompanyServicesTinyList[]>
  >(`/api/companies/${company_id}/services/tiny-list/`);

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

export const deleteProviderPackage = async ({
  id,
  companyId,
}: {
  id: string;
  companyId: string;
}) => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(
    `/api/companies/${companyId}/packages/${id}/`,
  );

  // 204 responses have no body.
  if (data && !data.success) {
    throw data;
  }
};

export const uploadProviderPackageCover = async ({
  id,
  companyId,
  file,
}: {
  id: string;
  companyId: string;
  file: File;
}): Promise<ServicePackage> => {
  const formData = new FormData();
  formData.append("cover_image", file);

  const { data } = await axiosInstance.post<ApiResponse<ServicePackage>>(
    `/api/companies/${companyId}/packages/${id}/cover-image/`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  if (!data.success) {
    throw data;
  }

  return data.data as ServicePackage;
};

export const deleteProviderPackageCover = async ({
  id,
  companyId,
}: {
  id: string;
  companyId: string;
}): Promise<ServicePackage> => {
  const { data } = await axiosInstance.delete<ApiResponse<ServicePackage>>(
    `/api/companies/${companyId}/packages/${id}/cover-image/`,
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
