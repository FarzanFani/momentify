import type { CompanyServices, GeneralListType } from "../provider/services";
import axiosInstance from "@/api/axiosInstance";
import { ApiResponse } from "@/types/general";

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
  const { data } =
    await axiosInstance.get<ApiResponse<GeneralListType<CompanyServices>>>(
      "api/services/",
      { params },
    );

  if (!data.success) {
    throw data;
  }

  return data.data as GeneralListType<CompanyServices>;
};
