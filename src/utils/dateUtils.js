function getCurrentDate(hoursToAdd = 0) {
  const currentDate = new Date();

  // Add the specified number of hours
  currentDate.setHours(currentDate.getHours() + hoursToAdd);

  const year = currentDate.getFullYear(); // Get the current year
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Get the current month (1-12) and pad with leading zero if necessary
  const day = currentDate.getDate().toString().padStart(2, "0"); // Get the current day of the month (1-31) and pad with leading zero if necessary

  return `${year}-${month}-${day}`;
}

export default { getCurrentDate };
