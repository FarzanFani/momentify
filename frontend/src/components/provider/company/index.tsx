"use client";

import { useGetProviderCompanies } from "@/hooks/company";
import { TableColumn, TableRowDataType } from "@/types/general";
import {
  Box,
  Button,
  MenuItem,
  IconButton,
  Typography,
  Menu,
  Chip,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Company } from "@/services/provider/company";
import TableComponent from "@/components/common/table/Table";
import { Add, MoreVert } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import SearchInput from "@/components/common/searchInput/SearchInput";

export default function ProviderCompaies() {
  const router = useRouter();

  const [companiesState, setCompaniesState] = useState<Company[]>([]);
  const [search, setSearch] = useState("");

  const { data: companies, isLoading } = useGetProviderCompanies(search);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (companies) {
      setCompaniesState(companies.results);
    }
  }, [companies]);

  const provierTableHeader: TableColumn[] = [
    { id: "name", label: "Name", minWidth: 100, align: "left" },
    { id: "email", label: "Email", minWidth: 100, align: "left" },
    { id: "phone_number", label: "Phone Number", minWidth: 100, align: "left" },
    {
      id: "verification_status",
      label: "Verification Status",
      minWidth: 100,
      align: "center",
    },
    {
      id: "auto_approve_booking",
      label: "Auto-approve Booking",
      minWidth: 100,
      align: "center",
    },
    {
      id: "action_items",
      label: "Action Items",
      minWidth: 500,
      align: "right",
    },
  ];

  const providerTableData: TableRowDataType[] | undefined = companiesState?.map(
    (company) => ({
      id: company.id,
      cells: {
        name: (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <Typography>{company.name}</Typography>
            {!company.is_profile_complete && (
              <Chip
                label="Not Complete"
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
          </Box>
        ),
        email: <Typography>{company.email}</Typography>,
        phone_number: <Typography>{company.phone_number}</Typography>,
        verification_status: (
          <Typography>{company.verification_status}</Typography>
        ),
        auto_approve_booking: (
          <Typography>{company.auto_approve_booking ? "Yes" : "No"}</Typography>
        ),
        action_items: (
          <Box display="flex" justifyContent="flex-end" alignItems="center">
            <IconButton
              aria-label="more"
              aria-controls={`company-menu-${company.id}`}
              aria-haspopup="true"
              onClick={(event) => {
                setAnchorEl(event.currentTarget);
                setSelectedCompanyId(company.id);
              }}
            >
              <MoreVert />
            </IconButton>
            {selectedCompanyId === company.id && (
              <Menu
                id={`company-menu-${company.id}`}
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => {
                  setAnchorEl(null);
                  setSelectedCompanyId(null);
                }}
              >
                <MenuItem
                  onClick={() => {
                    router.push(`/provider/company/${company.id}/preview`);
                    setAnchorEl(null);
                    setSelectedCompanyId(null);
                  }}
                >
                  Preview
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    router.push(`/provider/company/${company.id}/edit`);
                    setAnchorEl(null);
                    setSelectedCompanyId(null);
                  }}
                >
                  Edit
                </MenuItem>
              </Menu>
            )}
          </Box>
        ),
      },
    }),
  );

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  return (
    <Box>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        px={4}
      >
        <Box>
          <SearchInput
            fullWidth={false}
            width="300px"
            onSearch={handleSearch}
          />
        </Box>
        <Button
          variant="contained"
          color="primary"
          endIcon={<Add fontSize="medium" />}
          sx={{
            textTransform: "none",
            fontSize: "16px",
            fontWeight: 600,
            borderRadius: "15px",
            height: "50px",
            width: "160px",
          }}
          onClick={() => router.push("/provider/company/add")}
        >
          Add New
        </Button>
      </Box>
      <Box mt={4}>
        <TableComponent
          columns={provierTableHeader}
          data={providerTableData}
          isLoading={isLoading}
        />
      </Box>
    </Box>
  );
}
