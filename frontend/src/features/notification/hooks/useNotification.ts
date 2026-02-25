import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { getAccessToken } from '@/features/auth/libs/tokenStore';
import {
  getAllNotificationsApi,
  getLabeledQnAListApi,
  getNotificationCountApi,
  readAllNotificationApi,
  readEachNotificationApi,
} from '@/features/notification/api/notificationApi';
import { NOTIFICATION_QUERY_KEYS } from '@/features/notification/hooks/queries/notificationKeys';
import type {
  NotificationResponse,
  NotificationType,
} from '@/features/notification/types/notification';

// 알림 목록을 조회하는 커스텀 훅
export const useGetAllNotification = () => {
  return useInfiniteQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.lists(),
    queryFn: getAllNotificationsApi,
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext) return undefined;
      const notifications = lastPage.notifications;
      return notifications.length > 0
        ? notifications[notifications.length - 1].id
        : undefined;
    },
    staleTime: 0,
    enabled: !!getAccessToken(),
  });
};

// 읽지 않은 알림 개수를 조회하는 커스텀 훅
export const useGetNotificationCount = () => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.count(),
    queryFn: getNotificationCountApi,
    staleTime: 0,
    enabled: !!getAccessToken(),
    select: (data) => data.unreadNotificationCount,
  });
};

// 단건 알림 읽음 처리 커스텀 훅
export const useReadEachNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: readEachNotificationApi,
    onSuccess: (_, notificationId) => {
      // 목록 데이터 캐시 업데이트
      queryClient.setQueryData<InfiniteData<NotificationResponse>>(
        NOTIFICATION_QUERY_KEYS.lists(),
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              notifications: page.notifications.map((n: NotificationType) =>
                n.id === notificationId ? { ...n, isRead: true } : n,
              ),
            })),
          };
        },
      );
      // 알림 개수 갱신
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.count(),
      });
    },
  });
};

// 모든 알림 읽음 처리 커스텀 훅
export const useReadAllNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: readAllNotificationApi,
    onSuccess: () => {
      // 모든 알림을 읽음 처리로 캐시 업데이트
      queryClient.setQueryData<InfiniteData<NotificationResponse>>(
        NOTIFICATION_QUERY_KEYS.lists(),
        (oldData) => {
          if (!oldData) return;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              notifications: page.notifications.map((n) => ({
                ...n,
                isRead: true,
              })),
            })),
          };
        },
      );
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.count(),
      });
    },
  });
};

// 라벨링 완료된 자기소개서로 리다이렉트 해주기 위한 사전 정보 수집 커스텀 훅
export const useLabeledQnAList = (uploadJobId: string) => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.qna(uploadJobId),
    queryFn: () => getLabeledQnAListApi(uploadJobId),
    enabled: !!uploadJobId,
  });
};
