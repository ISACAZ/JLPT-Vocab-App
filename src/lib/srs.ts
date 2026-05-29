export interface ReviewResult {
  quality: 0 | 1 | 2 | 3 | 4 | 5;
}

export interface SRSData {
  ease: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
}

export function calculateSRS(
  current: SRSData,
  result: ReviewResult
): SRSData {
  const { quality } = result;
  let { ease, interval, repetitions } = current;

  if (quality < 3) {
    repetitions = 0;
    interval = 0;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ease);
    }
    repetitions += 1;
  }

  ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return { ease, interval, repetitions, nextReviewDate };
}

export function getDueWords(words: SRSData[]): SRSData[] {
  const now = new Date();
  return words.filter((w) => new Date(w.nextReviewDate) <= now);
}
