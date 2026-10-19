import type {
  CompanyServices,
  GeneralListType,
  ServicePackage,
} from "../provider/services";
import axiosInstance from "@/api/axiosInstance";
import { ApiResponse } from "@/types/general";
import { CompanyTinyList } from "../provider/company";

export type PublicServicesPayload = {
  search?: string;
  company_id?: string;
  category_id?: string;
  max_capacity?: number;
  min_price?: number;
  max_price?: number;
};

export const getPublicServices = async (
  params: PublicServicesPayload = {},
): Promise<GeneralListType<CompanyServices>> => {
  const { data } = await axiosInstance.get<
    ApiResponse<GeneralListType<CompanyServices>>
  >("api/public/services/", { params });

  if (!data.success) {
    throw data;
  }

  return data.data as GeneralListType<CompanyServices>;
};

export const getPublicCompaniesTinyList = async (): Promise<
  CompanyTinyList[]
> => {
  const { data } = await axiosInstance.get<ApiResponse<CompanyTinyList[]>>(
    "api/public/companies/tiny-list/",
  );

  if (!data.success) {
    throw data;
  }

  return data.data as CompanyTinyList[];
};

export type PublicPackagesPayload = {
  search?: string;
  company_id?: string;
  category_id?: string;
};

export type PackagePriceCalculationPayload = {
  packageId: string;
  guest_count: number;
  addons: string[];
};

export type PackagePriceCalculation = {
  package_price: string;
  extra_guests: number;
  extra_guests_price: string;
  addons_price: string;
  total_price: string;
};

export const getPublicPackages = async (
  params: PublicPackagesPayload = {},
): Promise<GeneralListType<ServicePackage>> => {
  const { data } = await axiosInstance.get<
    ApiResponse<GeneralListType<ServicePackage>>
  >("api/public/packages/", { params });

  if (!data.success) {
    throw data;
  }

  return data.data as GeneralListType<ServicePackage>;
};

export const retrievePublicPackage = async (
  packageUuid: string,
): Promise<ServicePackage> => {
  const { data } = await axiosInstance.get<ApiResponse<ServicePackage>>(
    `api/public/packages/${packageUuid}/`,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as ServicePackage;
};

export const postPublicPackageCalculatePrice = async ({
  packageId,
  ...payload
}: PackagePriceCalculationPayload): Promise<PackagePriceCalculation> => {
  const { data } = await axiosInstance.post<
    ApiResponse<PackagePriceCalculation>
  >(`api/public/packages/${packageId}/calculate-price/`, payload);

  if (!data.success) {
    throw data;
  }

  return data.data as PackagePriceCalculation;
};

export const retrievePublicService = async (
  serviceUuid: string,
): Promise<CompanyServices> => {
  const { data } = await axiosInstance.get<ApiResponse<CompanyServices>>(
    `api/public/services/${serviceUuid}/`,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as CompanyServices;
};
