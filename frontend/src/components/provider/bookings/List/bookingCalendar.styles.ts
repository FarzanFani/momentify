import { alpha, type SxProps, type Theme } from "@mui/material";

export const bookingCalendarStyles: SxProps<Theme> = (theme) => ({
  p: { xs: 1.5, md: 2.5 },

  "& .fc": {
    fontFamily: "inherit",

    "--fc-button-bg-color": theme.palette.primary.main,
    "--fc-button-border-color": theme.palette.primary.main,
    "--fc-button-hover-bg-color": theme.palette.primary.dark,
    "--fc-button-hover-border-color": theme.palette.primary.dark,
    "--fc-button-active-bg-color": theme.palette.secondary.main,
    "--fc-button-active-border-color": theme.palette.secondary.main,
    "--fc-today-bg-color": alpha(theme.palette.primary.main, 0.12),
    "--fc-event-bg-color": "transparent",
    "--fc-event-border-color": "transparent",
    "--fc-event-text-color": "inherit",
  },

  "& .fc-toolbar-title": {
    color: theme.palette.primary.main,
    fontWeight: 900,
    fontSize: { xs: "1.1rem", md: "1.5rem" },
  },

  "& .fc-button": {
    backgroundColor: `${theme.palette.primary.light} !important`,
    borderColor: `${theme.palette.primary.light} !important`,
    color: `${theme.palette.common.white} !important`,
    textTransform: "capitalize",
    fontWeight: 700,
    boxShadow: "none !important",
  },

  "& .fc-button:hover": {
    backgroundColor: `${theme.palette.primary.dark} !important`,
    borderColor: `${theme.palette.primary.dark} !important`,
    color: `${theme.palette.common.white} !important`,
  },

  "& .fc-button-active": {
    backgroundColor: `${theme.palette.primary.dark} !important`,
    borderColor: `${theme.palette.primary.dark} !important`,
    color: `${theme.palette.common.white} !important`,
  },

  "& .fc-button:disabled": {
    backgroundColor: `${theme.palette.primary.main} !important`,
    borderColor: `${theme.palette.primary.main} !important`,
    color: `${theme.palette.common.white} !important`,
    opacity: 0.5,
  },

  "& .fc-daygrid-day-bottom": {
    display: "flex",
    justifyContent: "flex-end",
    paddingRight: "4px",
    paddingBottom: "none",
  },

  "& .fc-daygrid-more-link": {
    color: `${theme.palette.primary.dark} !important`,
    fontWeight: 700,
    fontSize: "0.8rem",
    textDecoration: "none !important",
  },

  "& .fc-daygrid-more-link:hover": {
    backgroundColor: "transparent !important",
    color: `${theme.palette.primary.dark} !important`,
    textDecoration: "underline !important",
  },

  "& .fc-popover": {
    border: "none !important",
    borderRadius: "10px !important",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.18) !important",
  },

  "& .fc-popover-header": {
    backgroundColor: `${theme.palette.primary.dark} !important`,
    color: `${theme.palette.common.white} !important`,
    fontWeight: 600,
    padding: "8px 10px !important",
  },

  "& .fc-popover-title": {
    color: `${theme.palette.common.white} !important`,
    fontWeight: 800,
  },

  "& .fc-popover-close": {
    color: `${theme.palette.common.white} !important`,
    opacity: "1 !important",
  },

  "& .fc-popover-close:hover": {
    color: `${theme.palette.common.white} !important`,
    backgroundColor: "transparent !important",
  },

  "& .fc-popover-body": {
    color: `${theme.palette.common.white} !important`,
    padding: "8px !important",
  },

  "& .fc-popover .fc-event": {
    backgroundColor: "transparent !important",
    borderColor: "transparent !important",
  },

  "& .fc-popover .fc-event-main": {
    color: `${theme.palette.common.white} !important`,
  },

  "& .fc-event": {
    backgroundColor: "transparent !important",
    borderColor: "transparent !important",
    border: "0 !important",
    boxShadow: "none !important",
    padding: "0 !important",
    cursor: "pointer",
  },

  "& .fc-event-main": {
    backgroundColor: "transparent !important",
    color: "inherit !important",
  },

  "& .fc-event-main-frame": {
    backgroundColor: "transparent !important",
  },

  "& .fc-daygrid-event": {
    backgroundColor: "transparent !important",
    borderColor: "transparent !important",
    whiteSpace: "normal",
    marginBottom: "4px",
  },

  "& .fc-timegrid-event": {
    backgroundColor: "transparent !important",
    borderColor: "transparent !important",
    overflow: "hidden",
  },

  "& .fc-timegrid-event .fc-event-main": {
    padding: "0 !important",
  },

  "& .fc-day-today": {
    backgroundColor: `${alpha(theme.palette.primary.main, 0.12)} !important`,
  },
});
