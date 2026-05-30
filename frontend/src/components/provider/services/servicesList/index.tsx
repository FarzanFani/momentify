"use client";

import { useGetProviderServices } from "@/hooks/service";
import {
  CompanyServices,
  CompanyServicesPayload,
} from "@/services/provider/services";
import { Box, Typography, Button, Grid, Divider } from "@mui/material";
import { useRouter } from "next/navigation";
import ServiceCardView from "../../../common/serviceCard/cardView";
import ServiceCardSkeleton from "../../../common/serviceCard/skeletonLoadingView";
import SearchInput from "@/components/common/searchInput/SearchInput";
import { useState, useCallback } from "react";
import Filter from "@/components/common/filter/Filter";
import { FilterOptions, FilterValueRecord } from "@/types/general";
import { useGetCategoryTinyList } from "@/hooks/service";
import { mapApiResponseToDropdownOptions } from "@/utils/helperFunctions";
import { useGetCompanyTinyList } from "@/hooks/company";

export default function ProviderServices() {
  const router = useRouter();
  const [params, setParams] = useState<CompanyServicesPayload>({});

  const { data, isPending: isServicesLoading } = useGetProviderServices(params);
  const { data: categories } = useGetCategoryTinyList();
  const { data: companies } = useGetCompanyTinyList();
  const [search, setSearch] = useState("");

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  const categoriesOptions = mapApiResponseToDropdownOptions(
    categories ?? [],
    "id",
    "name",
  );

  const companiesOptions = mapApiResponseToDropdownOptions(
    companies ?? [],
    "id",
    "name",
  );

  const filterOptions: FilterOptions[] = [
    {
      label: "Category",
      value: selectedCategories,
      onChange: setSelectedCategories,
      name: "multiSelectDropdown",
      optionKey: "category_id",
      options: categoriesOptions,
    },
    {
      label: "Company",
      value: selectedCompanies,
      onChange: setSelectedCompanies,
      name: "multiSelectDropdown",
      optionKey: "company_id",
      options: companiesOptions,
    },
  ];

  const handleApplyFilters = useCallback(
    (filterValues: FilterValueRecord[]) => {
      setParams((prev) => {
        const nextParams: CompanyServicesPayload = {
          ...prev,
        };

        filterValues.forEach((filter) => {
          Object.entries(filter).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              if (value.length > 0) {
                nextParams[key as keyof CompanyServicesPayload] = value.join(
                  ",",
                ) as never;
              } else {
                delete nextParams[key as keyof CompanyServicesPayload];
              }
            } else if (typeof value === "number") {
              nextParams[key as keyof CompanyServicesPayload] = value as never;
            } else if (typeof value === "string" && value.trim() !== "") {
              nextParams[key as keyof CompanyServicesPayload] = value as never;
            } else {
              delete nextParams[key as keyof CompanyServicesPayload];
            }
          });
        });

        return nextParams;
      });
    },
    [],
  );

  const handleReset = useCallback(() => {
    setParams((prev) => ({
      ...prev,
      company_id: undefined,
      category_id: undefined,
    }));
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);

    const trimmedSearch = value.trim();

    setParams((prev) => ({
      ...prev,
      search: trimmedSearch === "" ? undefined : trimmedSearch,
    }));
  }, []);

  const apiErrorResponse = (
    <Box
      border={"1px solid"}
      borderColor={"primary.main"}
      borderRadius={4}
      height={70}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      width={"95%"}
      maxWidth={"500px"}
      sx={{
        boxShadow: 2,
      }}
    >
      <Typography color="black">
        Something went wrong. please contact Administrators.
      </Typography>
    </Box>
  );

  const noServiceAvailable = (
    <Box
      border={"1px solid"}
      borderColor={"primary.main"}
      borderRadius={4}
      py={4}
      gap={2}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      flexDirection={"column"}
      width={"95%"}
      maxWidth={"500px"}
      sx={{
        boxShadow: 2,
      }}
    >
      <Typography color="primary.dark" align="center">
        No service available. You can add one.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{
          textTransform: "none",
          fontSize: "16px",
          fontWeight: 200,
          borderRadius: "10px",
          height: "45px",
        }}
        onClick={() => router.push("/provider/services/add")}
      >
        Add Service
      </Button>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 3,
        ml: -3,
        mt: -3,
        mb: -3,
        mr: -3,
        minHeight: "calc(100% + 48px)",
      }}
    >
      {data ? (
        data.count === 0 &&
        params.search === undefined &&
        params.company_id === undefined &&
        params.category_id === undefined ? (
          noServiceAvailable
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                width: "100%",
                px: 4,
                mb: 4,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexGrow: 1,
                  alignItems: "flex-end",
                }}
              >
                <SearchInput
                  placeholder="Search services"
                  onSearch={handleSearch}
                  maxWidth="500px"
                  onChange={setSearch}
                  value={search}
                />
                <Filter
                  filterOptions={filterOptions}
                  onApply={handleApplyFilters}
                  onReset={handleReset}
                />
              </Box>
              <Button
                variant="contained"
                color="primary"
                sx={{
                  textTransform: "none",
                  fontSize: "16px",
                  fontWeight: 200,
                  borderRadius: "10px",
                  height: "45px",
                }}
                onClick={() => router.push("/provider/services/add")}
              >
                Add Service
              </Button>
              <Divider />
            </Box>
            {data.count > 0 ? (
              <Grid container spacing={3} px={4} width={"100%"}>
                {data.results.map((service: CompanyServices) => (
                  <Grid key={service.id} size={{ xs: 12, sm: 6, xl: 4 }}>
                    <ServiceCardView service={service} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box flexGrow={1} display={"flex"} alignItems={"center"}>
                <Typography color="primary.main">No result found</Typography>
              </Box>
            )}
          </>
        )
      ) : isServicesLoading ? (
        <Grid container spacing={3} px={4}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
              <ServiceCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : (
        apiErrorResponse
      )}
    </Box>
  );
}
