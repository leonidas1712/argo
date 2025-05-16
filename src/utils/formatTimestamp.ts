// Take ISO string and return user friendly formatted string
// example output: 16 May 2025 at 1:50 pm
export function formatTimestamp(isoString: string) {
  const date = new Date(isoString);

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
} 