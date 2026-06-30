/**
 * Calculates the current streak of consecutive completed days up to today.
 *
 * @param {string[]} completedDates - Array of date strings in standard toDateString() format.
 * @returns {number} The current streak count.
 */
export const calculateStreak = (completedDates) => {
  if (!completedDates || completedDates.length === 0) return 0;

  // Normalize date strings into a Set for O(1) lookups
  const completedSet = new Set(completedDates);

  let streak = 0;
  const currentDate = new Date();
  
  // Normalize today's date
  currentDate.setHours(0, 0, 0, 0);
  const todayStr = currentDate.toDateString();
  
  const yesterday = new Date(currentDate);
  yesterday.setDate(currentDate.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  // If neither today nor yesterday is completed, the streak is broken (0)
  if (!completedSet.has(todayStr) && !completedSet.has(yesterdayStr)) {
    return 0;
  }

  // Start checking backwards from today (if completed) or yesterday (if completed but today is not)
  let checkDate = completedSet.has(todayStr) ? new Date(currentDate) : new Date(yesterday);

  while (true) {
    const checkStr = checkDate.toDateString();
    if (completedSet.has(checkStr)) {
      streak++;
      // Move check date back by 1 day
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};
