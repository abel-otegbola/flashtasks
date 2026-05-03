const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const THREE_WEEKS_MS = 3 * WEEK_MS;

type TimeDirection = "past" | "future";

function getOrdinal(day: number): string {
  const mod100 = day % 100;

  if (mod100 >= 11 && mod100 <= 13) {
    return "th";
  }

  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function formatLongDateWithOrdinal(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();

  return `${day}${getOrdinal(day)} ${month} ${year}`;
}

export function formatDeliveredTime(
  dateTime?: string | null,
  referenceTime?: number,
  direction: TimeDirection = "past",
): string {
  if (!dateTime) return "";

  const parsedDate = new Date(dateTime);
  if (Number.isNaN(parsedDate.getTime())) return "";

  const now = referenceTime ?? Date.now();
  const timestamp = parsedDate.getTime();
  const diff = Math.abs(now - timestamp);
  const isFuture = direction === "future";

  if (diff < MINUTE_MS) {
    if (isFuture) {
      return "soon";
    }

    return "just now";
  }

  if (diff < HOUR_MS) {
    const minutes = Math.floor(diff / MINUTE_MS);
    const unit = minutes === 1 ? "minute" : "minutes";
    return isFuture ? `in ${minutes} ${unit}` : `${minutes} ${unit} ago`;
  }

  if (diff < DAY_MS) {
    const hours = Math.floor(diff / HOUR_MS);
    const unit = hours === 1 ? "hour" : "hours";
    return isFuture ? `in ${hours} ${unit}` : `${hours} ${unit} ago`;
  }

  if (diff < WEEK_MS) {
    const days = Math.floor(diff / DAY_MS);
    const unit = days === 1 ? "day" : "days";
    return isFuture ? `in ${days} ${unit}` : `${days} ${unit} ago`;
  }

  if (diff <= THREE_WEEKS_MS) {
    const weeks = Math.floor(diff / WEEK_MS);
    const unit = weeks === 1 ? "week" : "weeks";
    return isFuture ? `in ${weeks} ${unit}` : `${weeks} ${unit} ago`;
  }

  const longDate = formatLongDateWithOrdinal(parsedDate);
  return isFuture ? `due ${longDate}` : longDate;
}