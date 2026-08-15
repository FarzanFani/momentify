"use client";

import SelectDropdown from "@/components/common/dropdown/Dropdown";
import PackageCardView from "./cardView";
import PackageCardSkeleton from "./skeletonLoadingView";
import { useGetCompanyTinyList } from "@/hooks/company";
import { useGetProviderPackagesList } from "@/hooks/service";
import { ServicePackage } from "@/services/provider/services";
import { mapApiResponseToDropdownOptions } from "@/utils/helperFunctions";
import { Box, Button, Grid, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProviderPackages() {
  const router = useRouter();
  const [selectedCompany, setSelectedCompany] = useState("");

  const { data: companies, isPending: isCompaniesLoading } =
    useGetCompanyTinyList();

  const companyOptions = mapApiResponseToDropdownOptions(
    companies ?? [],
    "id",
    "name",
  );

  const company = selectedCompany || companies?.[0]?.id || "";

  const {
    data,
    isPending: isPackagesLoading,
    isError,
  } = useGetProviderPackagesList(company);

  const addPackageButton = (
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
      onClick={() => router.push("/provider/packages/add")}
    >
      Add Package
    </Button>
  );

  const noCompanyAvailable = (
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
      sx={{ boxShadow: 2 }}
    >
      <Typography color="primary.dark" align="center">
        You need a company before you can create packages.
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
        onClick={() => router.push("/provider/company/add")}
      >
        Add Company
      </Button>
    </Box>
  );

  const noPackagesAvailable = (
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
      sx={{ boxShadow: 2 }}
    >
      <Typography color="primary.dark" align="center">
        No packages yet. Bundle your services together with their own
        pricing and payment options.
      </Typography>
      {addPackageButton}
    </Box>
  );

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
      sx={{ boxShadow: 2 }}
    >
      <Typography color="black">
        Something went wrong. please contact Administrators.
      </Typography>
    </Box>
  );

  const centeredMessage = (content: React.ReactNode) => (
    <Box
      sx={{
        flex: 1,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {content}
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        py: 3,
        ml: -3,
        mt: -3,
        mb: -3,
        mr: -3,
        minHeight: "calc(100% + 48px)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          width: "100%",
          px: 4,
          mb: 4,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            Packages
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
          <Box sx={{ minWidth: 220 }}>
            <SelectDropdown
              label="Company"
              placeholder={
                isCompaniesLoading ? "Loading companies..." : "Choose a company"
              }
              value={company}
              onChange={setSelectedCompany}
              options={companyOptions}
              disable={isCompaniesLoading || companyOptions.length === 0}
            />
          </Box>

          {addPackageButton}
        </Box>
      </Box>

      {isCompaniesLoading ? (
        <Grid container spacing={3} px={4}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
              <PackageCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : !company ? (
        centeredMessage(noCompanyAvailable)
      ) : data ? (
        data.count === 0 ? (
          centeredMessage(noPackagesAvailable)
        ) : (
          <Grid container spacing={3} px={4} width={"100%"}>
            {data.results.map((servicePackage: ServicePackage) => (
              <Grid key={servicePackage.id} size={{ xs: 12, sm: 6, xl: 4 }}>
                <PackageCardView servicePackage={servicePackage} />
              </Grid>
            ))}
          </Grid>
        )
      ) : isPackagesLoading ? (
        <Grid container spacing={3} px={4}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
              <PackageCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : isError ? (
        centeredMessage(apiErrorResponse)
      ) : null}
    </Box>
  );
}
