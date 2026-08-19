const BOX_INTERVAL_DAYS = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 };

export function nextBoxState(currentBox, correct) {
  const box = correct ? Math.min(currentBox + 1, 5) : 1;
  const intervalDays = BOX_INTERVAL_DAYS[box];
  const nextReviewDate = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);
  return { box, nextReviewDate };
}
