import type { CompanyServices, GeneralListType } from "../provider/services";
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
