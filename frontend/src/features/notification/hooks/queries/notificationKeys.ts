export const NOTIFICATION_QUERY_KEYS = {
  all: ['notification'] as const,
  lists: () => [...NOTIFICATION_QUERY_KEYS.all, 'list'] as const,
  count: () => [...NOTIFICATION_QUERY_KEYS.all, 'count'] as const,
  qna: (uploadJobId: string) => [...NOTIFICATION_QUERY_KEYS.all, 'qna', uploadJobId] as const,
};