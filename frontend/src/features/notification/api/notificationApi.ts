import { NOTIFICATION_API } from '@/features/notification/constants';
import type {
  LabeledQnAListResponse,
  NotificationCountResponse,
  NotificationResponse,
} from '@/features/notification/types/notification';
import { apiClient } from '@/shared/api/apiClient';

export const getAllNotificationsApi = ({
  pageParam,
}: {
  pageParam: number | null;
}) =>
  apiClient.get<NotificationResponse>({
    endpoint: NOTIFICATION_API.ENDPOINTS.ALL,
    params: {
      size: 10,
      lastNotificationId: pageParam ?? undefined,
    },
  });

export const getNotificationCountApi = () =>
  apiClient.get<NotificationCountResponse>({
    endpoint: NOTIFICATION_API.ENDPOINTS.COUNT,
  });

export const readEachNotificationApi = (notificationId: number) =>
  apiClient.patch({
    endpoint: NOTIFICATION_API.ENDPOINTS.READ_EACH(notificationId),
  });

export const readAllNotificationApi = () =>
  apiClient.patch({ endpoint: NOTIFICATION_API.ENDPOINTS.READ_ALL });

export const getLabeledQnAListApi = (uploadJobId: string) =>
  apiClient.get<LabeledQnAListResponse>({
    endpoint: NOTIFICATION_API.ENDPOINTS.LABELED_QNA(uploadJobId),
  });
