import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { getAccessToken } from '@/features/auth/libs/tokenStore';
import type {
  NotificationCountResponse,
  NotificationResponse,
  NotificationType,
} from '@/features/notification/types/notification';
import { apiClient } from '@/shared/api/apiClient';

// 알림 목록을 조회하는 커스텀 훅
export const useGetAllNotification = () => {
  return useInfiniteQuery({
    queryKey: ['notificationList'],
    queryFn: ({ pageParam }: { pageParam: number | null }) =>
      apiClient.get<NotificationResponse>({
        endpoint: '/notification/all',
        params: {
          size: 10,
          lastNotificationId: pageParam ?? undefined,
        },
      }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext) return undefined;
      const notificationList = lastPage.notifications;
      return notificationList.length > 0
        ? notificationList[notificationList.length - 1].id
        : undefined;
    },
    staleTime: 0,
    enabled: !!getAccessToken(),
  });
};

// 읽지 않은 알림 개수를 조회하는 커스텀 훅
export const useGetNotificationCount = () => {
  return useQuery({
    queryKey: ['notificationCount'],
    queryFn: () =>
      apiClient.get<NotificationCountResponse>({
        endpoint: '/notification/count',
      }),
    staleTime: 0,
    enabled: !!getAccessToken(),
    select: (data: NotificationCountResponse) => data.unreadNotificationCount,
  });
};

// 단건 알림 읽음 처리 커스텀 훅
export const useReadEachNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: number) =>
      apiClient.patch({ endpoint: `/notification/${notificationId}/read` }),
    onSuccess: (_, notificationId) => {
      queryClient.setQueryData<InfiniteData<NotificationResponse>>(
        ['notificationList'],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              notifications: page.notifications.map(
                (notification: NotificationType) =>
                  notification.id === notificationId
                    ? { ...notification, isRead: true }
                    : notification,
              ),
            })),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
    },
    // [윤종근] - TODO: 토스트 메시지로 수정 필요
    onError: (error) => console.error('에러입니다.', error),
  });
};

// 모든 알림 읽음 처리 커스텀 훅
export const useReadAllNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.patch({ endpoint: '/notification/all/read' }),
    onSuccess: () => {
      // UI 즉시 반영을 위해 낙관적 업데이트 적용
      queryClient.setQueryData<InfiniteData<NotificationResponse>>(
        ['notificationList'],
        (oldData) => {
          if (!oldData) return;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              notifications: page.notifications.map((notification) => ({
                ...notification,
                isRead: true,
              })),
            })),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ['notificationList'] });
      queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
    },
    // [윤종근] - TODO: 토스트 메시지로 수정 필요
    onError: (error) => console.error('에러입니다.', error),
  });
};
