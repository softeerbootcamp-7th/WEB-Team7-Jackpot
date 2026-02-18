import type { NotificationType } from '@/features/notification/types/notification';

export interface NotificationSSEPayload {
  unreadNotificationCount: number;
  notification: NotificationType;
}

// 현재는 알림만 SSE를 활용하지만 추후에 다른 타입이 필요하다면 유니온으로 추가하여 사용
export type SSEPayload = NotificationType;
