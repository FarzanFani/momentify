import React, { useEffect, useRef, useState } from "react";
import { OutlinedInput, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { getSearchInputStyles } from "./style";

interface SearchBarProps {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
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
  value,
  onChange,
}: SearchBarProps) => {
  const [internalValue, setInternalValue] = useState("");
  const inputValue = value ?? internalValue;

  // Keep the latest callback in a ref so a new onSearch on every parent
  // render doesn't restart the debounce and search again in a loop.
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);
  const lastSearchedRef = useRef(inputValue);

  const search = (nextValue: string) => {
    lastSearchedRef.current = nextValue;
    onSearchRef.current?.(nextValue);
  };

  useEffect(() => {
    // Only search when the text actually changed since the last search.
    if (inputValue === lastSearchedRef.current) {
      return;
    }
    const handler = setTimeout(() => {
      lastSearchedRef.current = inputValue;
      onSearchRef.current?.(inputValue);
    }, debounce);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, debounce]);

  const handleChange = (nextValue: string) => {
    setInternalValue(nextValue);
    onChange?.(nextValue);
  };

  const handleClear = () => {
    handleChange("");
    search("");
  };

  const handleSearch = () => {
    search(inputValue);
  };

  return (
    <OutlinedInput
      value={inputValue}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        handleChange(e.target.value)
      }
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          handleSearch();
        }
      }}
      placeholder={placeholder}
      size="small"
      fullWidth={fullWidth}
      sx={{ ...getSearchInputStyles(Boolean(inputValue)), width, maxWidth }}
      endAdornment={
        inputValue && (
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
