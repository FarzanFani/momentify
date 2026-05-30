import { FilterOptions } from "@/types/general";
import MultiSelectDropdown from "../multiSelectDropdown/MultiSelectDropdown";
import { Box, Grid } from "@mui/material";
import SelectDropdown from "../dropdown/Dropdown";
import RangeSlider from "../slider/RangeSlider";
import AutocompleteDropdown from "../autoComplete/autoComplete";
import InputField from "../input/InputField";

const renderComponent = (option: FilterOptions) => {
  switch (option.name) {
    case "multiSelectDropdown":
      return (
        <Box width="100%">
          <MultiSelectDropdown {...option} fullWidth={true} />
        </Box>
      );
    case "selectDropdown":
      return (
        <Box width="100%">
          <SelectDropdown {...option} fullWidth={true} />
        </Box>
      );
    case "number":
      return (
        <Box width="100%">
          <InputField
            {...option}
            onChange={(value) => {
              if (value === "" || value === null) {
                option.onChange(null);
                return;
              }

              const numberValue = Number(value);

              if (!Number.isNaN(numberValue)) {
                option.onChange(numberValue);
              }
            }}
          />
        </Box>
      );

    case "autocompleteDropdown":
      return (
        <Box width="100%">
          <AutocompleteDropdown {...option} fullWidth={true} />
        </Box>
      );
    case "rangeSlider":
      return (
        <Box width="100%">
          <RangeSlider {...option} fullWidth={true} />
        </Box>
      );

    default:
      return null;
  }
};

export default renderComponent;
