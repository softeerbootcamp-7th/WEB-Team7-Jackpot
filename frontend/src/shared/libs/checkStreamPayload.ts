import type { NotificationSSEPayload } from '@/shared/types/sse';

// 스트림으로 들어온 데이터가 알림 페이로드인지 확인하는 함수 (타입 가드)
export const isNotificationPayload = (data: unknown): data is NotificationSSEPayload => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'notification' in data &&
    'unreadNotificationCount' in data
  );
};