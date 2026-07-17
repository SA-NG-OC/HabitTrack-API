/**
 * Helper to calculate current and longest streaks from a list of check-in date strings.
 * Dates are assumed to be unique and in 'YYYY-MM-DD' format.
 */
export function calculateStreaks(
  dates: string[],
  today: string,
): { currentStreak: number; longestStreak: number; lastCheckInDate: string | null } {
  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastCheckInDate: null };
  }

  // Unique and sorted descending (newest first)
  const sorted = Array.from(new Set(dates)).sort((a, b) => b.localeCompare(a));
  const latestDate = sorted[0];

  // Helper to calculate difference in days between two YYYY-MM-DD strings using UTC to avoid timezone issues
  const getDiffDays = (dateStr1: string, dateStr2: string): number => {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
    return Math.round((utc1 - utc2) / (1000 * 60 * 60 * 24));
  };

  // Calculate current streak
  let currentStreak = 0;
  const diffFromToday = getDiffDays(today, latestDate);

  // A streak is active if the latest check-in was today (0 days diff) or yesterday (1 day diff)
  if (diffFromToday === 0 || diffFromToday === 1) {
    currentStreak = 1;
    for (let i = 0; i < sorted.length - 1; i++) {
      const diff = getDiffDays(sorted[i], sorted[i + 1]);
      if (diff === 1) {
        currentStreak++;
      } else if (diff > 1) {
        break; // Streak broken
      }
    }
  }

  // Calculate longest streak historically
  let longestStreak = 0;
  if (sorted.length > 0) {
    let tempStreak = 1;
    longestStreak = 1;
    for (let i = 0; i < sorted.length - 1; i++) {
      const diff = getDiffDays(sorted[i], sorted[i + 1]);
      if (diff === 1) {
        tempStreak++;
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  return {
    currentStreak,
    longestStreak,
    lastCheckInDate: latestDate,
  };
}
