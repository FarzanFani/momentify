// export const mapApiResponseToDropdownOptions = (
//   list: [],
//   key: string,
//   label: string,
// ) => {};

export function mapApiResponseToDropdownOptions<T extends object>(
  list: T[],
  key: keyof T,
  label: keyof T,
) {
  return list.map((item) => ({
    label: String(item[label]),
    value: String(item[key]),
  }));
}

export const formatPrice = (price: number) => {
  return Number(price).toLocaleString("en-IN", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
};

export const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours && mins) return `${hours}h ${mins}m`;
  if (hours) return `${hours}h`;
  return `${mins}m`;
};

export function formatDate(date: string) {
  if (!date) return "Not provided";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatTime(time: string) {
  if (!time) return "Not selected";

  if (time.includes("T") || /^\d{4}-\d{2}-\d{2}/.test(time)) {
    const date = new Date(time);

    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    }
  }

  const [hours, minutes] = time.split(":");

  if (!hours || !minutes) return time;

  const date = new Date();
  date.setHours(Number(hours));
  date.setMinutes(Number(minutes));

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getDateInputValue(dateTime?: string | null) {
  if (!dateTime) return "";

  if (dateTime.includes("T")) {
    return dateTime.split("T")[0] ?? "";
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(dateTime)) {
    return dateTime.slice(0, 10);
  }

  return "";
}

export function getTimeInputValue(dateTime?: string | null) {
  if (!dateTime) return "";

  const timePart = dateTime.includes("T")
    ? dateTime.split("T")[1]
    : dateTime.includes(" ")
      ? dateTime.split(" ")[1]
      : dateTime;

  return timePart?.slice(0, 5) ?? "";
}

export function combineDateAndTime(date: string, time: string) {
  if (!date || !time) return "";

  return `${date}T${time}`;
}

export function formatDateTime(date: string) {
  if (!date) return "Not available";

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatStatus(status: string) {
  return status
    ?.replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatPaymentOption(option: string) {
  const paymentOptions: Record<string, string> = {
    REQUEST_BOOKING_FIRST: "Request booking first",
    PAY_DEPOSIT_LATER: "Pay deposit later",
    PAY_FULL_AMOUNT_LATER: "Pay full amount later",
    PAY_FULL_AMOUNT_NOW: "Pay full amount now",
    PAY_DEPOSIT_NOW: "Pay deposit now",
  };

  return paymentOptions[option] || formatStatus(option);
}

export function getStatusColor(status: string) {
  const normalizedStatus = status?.toLowerCase();

  if (normalizedStatus === "confirmed") return "#16a34a";
  if (normalizedStatus === "pending") return "#d97706";
  if (normalizedStatus === "cancelled") return "#dc2626";
  if (normalizedStatus === "completed") return "#0B3D91";

  return "#64748b";
}
