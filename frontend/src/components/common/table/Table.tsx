"use client";

import { useState } from "react";
import {
  CircularProgress,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
} from "@mui/material";
import { TableColumn, TableRowDataType } from "@/types/general";

interface TableProps {
  columns: TableColumn[];
  data: TableRowDataType[];
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function TableCompontnt({
  columns,
  data,
  rowsPerPageOptions = [5, 10, 25],
  defaultRowsPerPage = 10,
  isLoading = false,
  emptyMessage = "No result found",
}: TableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  const paginatedData = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <TableContainer
      sx={{
        borderRadius: "20px",
        border: "1px solid #e0e0e0",
        overflow: "hidden",
      }}
    >
      <Table>
        <TableHead sx={{ backgroundColor: "primary.dark" }}>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.id} sx={{ color: "primary.contrastText" }}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                <CircularProgress color="primary" />
              </TableCell>
            </TableRow>
          ) : paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((row, index) => (
              <TableRow
                key={row.id}
                sx={{
                  backgroundColor: index % 2 === 0 ? "#f5f7fa" : "#f0f0f0",
                }}
              >
                {columns.map((column) => (
                  <TableCell key={column.id}>{row.cells[column.id]}</TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={data.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={rowsPerPageOptions}
        sx={{
          backgroundColor: "primary.dark",
          color: "primary.contrastText",
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
    </TableContainer>
  );
}
