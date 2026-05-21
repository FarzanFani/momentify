"use client";

import { useState } from "react";
import {
  Box,
  CircularProgress,
  Grid,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { TableColumn, TableRowDataType } from "@/types/general";

interface TableProps {
  columns: TableColumn[];
  data: TableRowDataType[];
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  isLoading?: boolean;
  emptyMessage?: string;
  inOneLineWhenCompact?: boolean;
  paginationPage: number;
  setPaginationPage: (page: number) => void;
  count: number;
  setPageSize: (pageSize: number) => void;
  pageSize: number;
}

const ACTION_COL_ID = "action_items";

export default function TableComponent({
  columns,
  data = [],
  rowsPerPageOptions = [5, 10, 25],
  defaultRowsPerPage = 10,
  isLoading = false,
  emptyMessage = "No result found",
  inOneLineWhenCompact = true,
  setPaginationPage,
  paginationPage,
  count,
  setPageSize,
  pageSize,
}: TableProps) {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("md")); // < 900px

  const headerColumns = columns.filter((col) => col.id !== ACTION_COL_ID);
  const hasActions = columns.some((col) => col.id === ACTION_COL_ID);
  const totalColumns = headerColumns.length + (hasActions ? 1 : 0);

  const desktopMinWidth = columns.reduce(
    (total, column) => total + (column.minWidth ?? 160),
    0,
  );

  const renderDesktopTable = () => (
    <TableContainer
      sx={{
        width: "100%",
        overflowX: "auto",
      }}
    >
      <Table sx={{ minWidth: desktopMinWidth }}>
        <TableHead sx={{ backgroundColor: "primary.dark" }}>
          <TableRow>
            {headerColumns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align ?? "left"}
                sx={{
                  color: "primary.contrastText",
                  minWidth: column.minWidth,
                  whiteSpace: "nowrap",
                }}
              >
                {column.label}
              </TableCell>
            ))}

            {hasActions && (
              <TableCell
                align="right"
                sx={{
                  width: "1%",
                  whiteSpace: "nowrap",
                  color: "primary.contrastText",
                }}
              />
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={totalColumns} align="center" sx={{ py: 8 }}>
                <CircularProgress color="primary" />
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={totalColumns} align="center" sx={{ py: 8 }}>
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={row.id}
                sx={{
                  backgroundColor: index % 2 === 0 ? "#f5f7fa" : "#f0f0f0",
                }}
              >
                {headerColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align ?? "left"}
                    sx={{ minWidth: column.minWidth }}
                  >
                    {row.cells[column.id] ?? "-"}
                  </TableCell>
                ))}

                {hasActions && (
                  <TableCell
                    align="right"
                    sx={{
                      width: "1%",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.cells[ACTION_COL_ID]}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderMobileCards = () => {
    if (isLoading) {
      return (
        <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
          <CircularProgress color="primary" />
        </Box>
      );
    }

    if (data.length === 0) {
      return (
        <Box sx={{ py: 8, textAlign: "center" }}>
          <Typography>{emptyMessage}</Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {data.map((row, index) => (
            <Box
              key={row.id}
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: "16px",
                backgroundColor: index % 2 === 0 ? "#f5f7fa" : "#f0f0f0",
                overflow: "hidden",
              }}
            >
              {headerColumns.map((column) => (
                <Box
                  key={column.id}
                  sx={{
                    p: 2,
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  <Grid
                    container
                    spacing={inOneLineWhenCompact ? 1 : 0}
                    alignItems="center"
                  >
                    <Grid size={{ xs: 12, sm: inOneLineWhenCompact ? 5 : 12 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          mb: inOneLineWhenCompact ? 0 : 0.75,
                          color: "primary.main",
                          fontWeight: 700,
                        }}
                      >
                        {column.label}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: inOneLineWhenCompact ? 7 : 12 }}>
                      <Box
                        sx={{
                          minWidth: 0,
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                          display: "flex",
                          color: "black",
                          justifyContent: "flex-start",
                          textAlign: {
                            xs: "left",
                            sm: column.align ?? "left",
                          },
                        }}
                      >
                        {row.cells[column.id] ?? "-"}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ))}

              {hasActions && (
                <Box
                  sx={{
                    p: 1,
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.03)",
                  }}
                >
                  {row.cells[ACTION_COL_ID]}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    );
  };
  function MyFirstPageIcon() {
    return <span style={{ fontSize: 18 }}>First</span>;
  }

  return (
    <Box
      sx={{
        borderRadius: "20px",
        overflow: "hidden",
        border: "1px solid gray",
        width: "100%",
      }}
    >
      {isCompact ? renderMobileCards() : renderDesktopTable()}

      <TablePagination
        component="div"
        count={count}
        page={paginationPage - 1}
        onPageChange={(_, page) => {
          setPaginationPage(page + 1);
        }}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => {
          setPageSize(parseInt(e.target.value, 10));
        }}
        rowsPerPageOptions={rowsPerPageOptions}
        labelRowsPerPage={"Available records"}
        showFirstButton
        showLastButton
        labelDisplayedRows={({ from, to, count }) => {
          return from === to
            ? `record ${from}`
            : `${from} to ${to} from ${count} records`;
        }}
        sx={{
          backgroundColor: "primary.dark",
          color: "primary.contrastText",

          "& .MuiTablePagination-toolbar": {
            flexWrap: "wrap",
            justifyContent: {
              xs: "center",
              sm: "flex-end",
            },
            gap: 1,
          },

          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            {
              margin: 0,
            },

          "& .MuiTablePagination-actions .MuiIconButton-root": {
            color: "primary.contrastText",
          },

          "& .MuiTablePagination-actions .Mui-disabled": {
            color: "rgba(255, 255, 255, 0.4)",
          },

          "& .MuiTablePagination-selectIcon": {
            color: "primary.contrastText",
          },
        }}
      />
    </Box>
  );
}
