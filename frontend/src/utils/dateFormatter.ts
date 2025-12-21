/**
 * Formats a date string or Date object to dd/MM/yyyy format
 * @param dateInput - Date string, Date object, or null/undefined
 * @returns Formatted date string in dd/MM/yyyy format or 'N/A' if invalid
 */
export const formatDate = (dateInput?: string | Date | null): string => {
  if (!dateInput) return "N/A";

  try {
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;

    if (isNaN(date.getTime())) {
      return "N/A";
    }

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();

    return `${day}/${month}/${year}`;
  } catch (error) {
    return "N/A";
  }
};

/**
 * Formats a date string or Date object to dd/MM/yyyy HH:mm format
 * @param dateInput - Date string, Date object, or null/undefined
 * @returns Formatted datetime string in dd/MM/yyyy HH:mm format or 'N/A' if invalid
 */
export const formatDateTime = (dateInput?: string | Date | null): string => {
  if (!dateInput) return "N/A";

  try {
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;

    if (isNaN(date.getTime())) {
      return "N/A";
    }

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    return "N/A";
  }
};

/**
 * Formats current date for file downloads
 * @returns Current date in dd-MM-yyyy format for filenames
 */
export const formatDateForFilename = (): string => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear().toString();

  return `${day}-${month}-${year}`;
};
