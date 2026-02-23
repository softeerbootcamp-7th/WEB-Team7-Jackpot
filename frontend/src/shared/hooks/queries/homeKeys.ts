export const homeKeys = {
  all: ['home'] as const,
  count: (date: string) => [...homeKeys.all, 'count', { date }] as const,
  calendar: (startDate: string, endDate: string) =>
    [...homeKeys.all, 'calendar', { startDate, endDate }] as const,
  upcomingDeadlines: (
    date: string,
    maxDeadLineSize: number,
    maxCoverLetterSizePerDeadLine: number,
  ) =>
    [
      ...homeKeys.all,
      'upcoming-deadlines',
      { date, maxDeadLineSize, maxCoverLetterSizePerDeadLine },
    ] as const,
};
