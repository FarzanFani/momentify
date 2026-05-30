import {
  CompanyServicesPayload,
  getProviderServicesList,
  getServicesCategoryTinyList,
  postProviderService,
  retrieveProviderService,
  putProviderService,
} from "@/services/provider/services";
import { getPublicServices } from "@/services/public/public";
import type { PublicServicesPayload } from "@/services/public/public";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetProviderServices = (params: CompanyServicesPayload) => {
  return useQuery({
    queryKey: ["services", params],
    queryFn: () => getProviderServicesList(params),
  });
};

export const useGetCategoryTinyList = () => {
  return useQuery({
    queryKey: ["category"],
    queryFn: getServicesCategoryTinyList,
  });
};

export const usePostService = () => {
  return useMutation({
    mutationFn: postProviderService,
  });
};

export const useGetSingleProviderService = (serviceUuid: string) => {
  return useQuery({
    queryKey: ["service", serviceUuid],
    queryFn: () => retrieveProviderService(serviceUuid),
  });
};

export const useEditServices = () => {
  return useMutation({
    mutationFn: putProviderService,
  });
};

export const useGetPublicServices = (params: PublicServicesPayload = {}) => {
  return useQuery({
    queryKey: ["public-services", params],
    queryFn: () => getPublicServices(params),
  });
};
