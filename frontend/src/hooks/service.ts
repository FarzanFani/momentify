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
  deleteProviderPackage,
  uploadProviderPackageCover,
  deleteProviderPackageCover,
} from "@/services/provider/services";
import {
  getPublicPackages,
  getPublicServices,
  postPublicPackageCalculatePrice,
  retrievePublicPackage,
  retrievePublicService,
} from "@/services/public/public";
import type {
  PublicPackagesPayload,
  PublicServicesPayload,
} from "@/services/public/public";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const useGetProviderServices = (params: CompanyServicesPayload) => {
  return useInfiniteQuery({
    queryKey: ["services", params],
    queryFn: ({ pageParam }) =>
      getProviderServicesList({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length + 1 : undefined,
    refetchOnWindowFocus: false,
  });
};

export const useGetProviderServicesTinyList = (company: string) => {
  return useQuery({
    queryKey: ["services-tiny-list", company],
    queryFn: () => getProviderServicesTinyList(company),
    enabled: company !== "",
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
  return useInfiniteQuery({
    queryKey: ["packages", companyId],
    queryFn: ({ pageParam }) => getProviderPackagesList(companyId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length + 1 : undefined,
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

export const useDeletePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProviderPackage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["packages"] }),
  });
};

export const useUploadPackageCover = () => {
  return useMutation({
    mutationFn: uploadProviderPackageCover,
  });
};

export const useDeletePackageCover = () => {
  return useMutation({
    mutationFn: deleteProviderPackageCover,
  });
};

export const useGetPublicPackages = (params: PublicPackagesPayload = {}) => {
  return useQuery({
    queryKey: ["public-packages", params],
    queryFn: () => getPublicPackages(params),
    refetchOnWindowFocus: false,
  });
};

export const useGetSinglePublicPackage = (packageUuid: string) => {
  return useQuery({
    queryKey: ["public-package", packageUuid],
    queryFn: () => retrievePublicPackage(packageUuid),
    refetchOnWindowFocus: false,
  });
};

export const usePostPackageCalculatePrice = () => {
  return useMutation({
    mutationFn: postPublicPackageCalculatePrice,
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
