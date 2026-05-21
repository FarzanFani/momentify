// SearchBar.jsx
import React, { useState, useEffect } from "react";
import { OutlinedInput, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { searchInputStyles } from "./style";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  debounce?: number;
  fullWidth?: boolean;
  width?: string;
  maxWidth?: string;
}

const SearchBar = ({
  placeholder = "Search...",
  onSearch,
  debounce = 300,
  fullWidth = true,
  width = "100%",
  maxWidth,
}: SearchBarProps) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      if (onSearch) {
        onSearch(value);
      }
    }, debounce);

    return () => {
      clearTimeout(handler);
    };
  }, [value, debounce, onSearch]);

  const handleClear = () => {
    setValue("");
    if (onSearch) onSearch("");
  };

  const handleSearch = () => {
    if (onSearch) onSearch(value);
  };

  return (
    <OutlinedInput
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        setValue(e.target.value)
      }
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          handleSearch();
        }
      }}
      placeholder={placeholder}
      size="small"
      fullWidth={fullWidth}
      sx={{ ...searchInputStyles, width, maxWidth }}
      endAdornment={
        value && (
          <InputAdornment position="end">
            <IconButton onClick={handleClear} size="small">
              <ClearIcon color="primary" />
            </IconButton>
          </InputAdornment>
        )
      }
      startAdornment={
        <InputAdornment position="start">
          <SearchIcon color="primary" />
        </InputAdornment>
      }
    />
  );
};

export default SearchBar;
