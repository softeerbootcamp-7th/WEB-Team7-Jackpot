export const NOTIFICATION_TYPE = {
  FEEDBACK: 'FEEDBACK',
  LABELING_COMPLETE: 'LABELING_COMPLETE',
} as const;

export const NOTIFICATION_API = {
  ENDPOINTS: {
    ALL: '/notification/all',
    COUNT: '/notification/count',
    READ_ALL: '/notification/all/read',
    READ_EACH: (id: number) => `/notification/${id}/read`,
    LABELED_QNA: (jobId: string) => `/upload/uploaded/${jobId}/qnas`,
  },
  PAGINATION: {
    DEFAULT_SIZE: 10,
  },
} as const;

export const NOTIFICATION_MESSAGES = {
  TITLE: '최근 도착한 알림',
  READ_ALL: '모두 읽음',
  EMPTY: {
    TITLE: '새로운 알림이 없습니다.',
    SUB: '새 소식이 도착하면 알려드릴게요!',
  },
  HEADER: {
    FEEDBACK: '님이 새로운 알림을 보냈어요!',
    LABELING: '요청하신 AI 라벨링이 완료되었어요!',
  },
  STATE: {
    LOADING: '로딩 중...',
    ERROR: '에러 발생',
  },
} as const;

export const NOTIFICATION_LIMITS = {
  MAX_DISPLAY_COUNT: 99,
  OVER_LIMIT_TEXT: '99+',
} as const;