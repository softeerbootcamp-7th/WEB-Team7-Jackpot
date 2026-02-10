export const NOTIFICATION_LIST = {
  notifications: [
    {
      id: 1,
      type: 'FEEDBACK',
      title: '토스 / 백엔드 개발자',
      content: '현대자동차의 혁신적인 미래 모빌리티...',
      isRead: false,
      createdAt: '2025-01-25T09:41:00Z',
      meta: {
        sender: {
          id: 'value',
          nickname: '피곤한 바다악어',
        },
      },
    },
    {
      id: 2,
      type: 'LABELING_COMPLETE',
      title:
        '총 3개의 자기소개서를 분석했어요 2개가 성공하고 1개가 실패했어요.',
      content: '',
      isRead: true,
      createdAt: '2025-01-25T09:41:00Z',
      meta: {
        coverLetters: [
          {
            coverLetterId: 1,
            questionIds: [1, 2, 3],
          },
          {
            coverLetterId: 2,
            questionIds: [4, 5, 6],
          },
        ],
      },
    },
  ],
  hasNext: true,
} as const;
