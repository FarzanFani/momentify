import { postCalculatedPriceForBookingService } from "@/services/customer/booking";
import {
  CompanyServicesPayload,
  getProviderServicesList,
  getServicesCategoryTinyList,
  postProviderService,
  postProviderPackage,
  getProviderPackagesList,
  retrieveProviderPackage,
  putProviderPackage,
  retrieveProviderService,
  putProviderService,
  getProviderServicesTinyList,
} from "@/services/provider/services";
import {
  getPublicServices,
  retrievePublicService,
} from "@/services/public/public";
import type { PublicServicesPayload } from "@/services/public/public";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetProviderServices = (params: CompanyServicesPayload) => {
  return useQuery({
    queryKey: ["services", params],
    queryFn: () => getProviderServicesList(params),
    refetchOnWindowFocus: false,
  });
};

export const useGetProviderServicesTinyList = (
  company: string,
  categoryId: string,
) => {
  return useQuery({
    queryKey: ["services-tiny-list", company],
    queryFn: () => getProviderServicesTinyList(company, categoryId),
    enabled: company !== "" && categoryId !== "",
    refetchOnWindowFocus: false,
  });
};

export const useGetCategoryTinyList = () => {
  return useQuery({
    queryKey: ["category"],
    queryFn: getServicesCategoryTinyList,
    refetchOnWindowFocus: false,
  });
};

export const usePostService = () => {
  return useMutation({
    mutationFn: postProviderService,
  });
};

export const usePostPackage = () => {
  return useMutation({
    mutationFn: postProviderPackage,
  });
};

export const useGetProviderPackagesList = (companyId: string) => {
  return useQuery({
    queryKey: ["packages", companyId],
    queryFn: () => getProviderPackagesList(companyId),
    enabled: companyId !== "",
    refetchOnWindowFocus: false,
  });
};

export const useGetSingleProviderPackage = (packageUuid: string) => {
  return useQuery({
    queryKey: ["package", packageUuid],
    queryFn: () => retrieveProviderPackage(packageUuid),
  });
};

export const useEditPackage = () => {
  return useMutation({
    mutationFn: putProviderPackage,
  });
};

export const useGetSingleProviderService = (serviceUuid: string) => {
  return useQuery({
    queryKey: ["service", serviceUuid],
    queryFn: () => retrieveProviderService(serviceUuid),
  });
};

export const useGetSinglePublicService = (serviceUuid: string) => {
  return useQuery({
    queryKey: ["service", serviceUuid],
    queryFn: () => retrievePublicService(serviceUuid),
    refetchOnWindowFocus: false,
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
    refetchOnWindowFocus: false,
  });
};

export const usePostServiceCalculatePrice = () => {
  return useMutation({
    mutationFn: postCalculatedPriceForBookingService,
  });
};
