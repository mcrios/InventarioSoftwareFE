const dateTimeFormatter = new Intl.DateTimeFormat("es-SV", {
  dateStyle: "medium",
  timeStyle: "short",
});

const dateFormatter = new Intl.DateTimeFormat("es-SV", {
  dateStyle: "medium",
});

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";

  const date = parseDate(value);
  return date ? dateTimeFormatter.format(date) : value;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = parseDate(value);
  return date ? dateFormatter.format(date) : value;
}
