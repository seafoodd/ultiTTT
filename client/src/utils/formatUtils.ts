export const timeAgo = (date: string | Date) => {
  const inputDate = new Date(date);

  if (isNaN(inputDate.getTime())) {
    return "Invalid date";
  }

  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - inputDate.getTime()) / 1000,
  );

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
};

export const formatDate = (date: string | Date) => {
  const inputDate = new Date(date);

  if (isNaN(inputDate.getTime())) {
    return "Invalid date";
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return inputDate.toLocaleDateString("en-US", options);
};
