import { useEffect } from 'react';

import { useNavigate } from 'react-router';

import { getLabeledQnAListApi } from '@/features/notification/api/notificationApi';
import NotificationItem from '@/features/notification/components/NotificationItem';
import {
  NOTIFICATION_MESSAGES,
  NOTIFICATION_TYPE,
} from '@/features/notification/constants';
import { NOTIFICATION_QUERY_KEYS } from '@/features/notification/hooks/queries/notificationKeys';
import {
  useGetAllNotification,
  useReadEachNotification,
} from '@/features/notification/hooks/useNotification';
import { useScrollTouchEndObserver } from '@/features/notification/hooks/useScrollTouchEndObserver';
import type { NotificationType } from '@/features/notification/types/notification';
import { ApiError } from '@/shared/api/apiClient';
import { queryClient } from '@/shared/hooks/queries/queryClient';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';

interface NotificationListProps {
  handleDropdown: (isOpen: boolean) => void;
}

const NotificationList = ({ handleDropdown }: NotificationListProps) => {
  const {
    data: notificationListData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useGetAllNotification();
  const { showToast } = useToastMessageContext();
  const { mutateAsync: readEachNotification } = useReadEachNotification();
  const { targetRef } = useScrollTouchEndObserver({
    enabled: !!hasNextPage && !isFetchingNextPage,
    onIntersect: () => fetchNextPage(),
  });
  const navigate = useNavigate();

  useEffect(() => {});

  const handleNotificationClick = async (notification: NotificationType) => {
    const { id, type, meta } = notification;

    // 공통: 알림 읽음 처리
    readEachNotification(Number(id));

    // 피드백 타입 처리
    if (type === NOTIFICATION_TYPE.FEEDBACK) {
      navigate(`/cover-letter/edit/${meta.coverLetterId}?qnAId=${meta.qnAId}`);
      handleDropdown(false);
      return;
    }

    // 라벨링 완료 타입 처리
    try {
      // 404 발생 시 ApiError를 던짐
      await queryClient.fetchQuery({
        queryKey: NOTIFICATION_QUERY_KEYS.qna(meta.jobId),
        queryFn: () => getLabeledQnAListApi(meta.jobId),
      });

      navigate(`/upload/labeling/${meta.jobId}/0/0`);
      handleDropdown(false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        showToast(NOTIFICATION_MESSAGES.NOTIFICATION.ALREADY_SAVED, false);
      } else {
        showToast(NOTIFICATION_MESSAGES.NOTIFICATION.ERROR, false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className='flex h-40 items-center justify-center text-gray-400'>
        {NOTIFICATION_MESSAGES.STATE.LOADING}
      </div>
    );
  }

  if (!notificationListData) return null;

  const isEmpty = notificationListData.pages[0]?.notifications.length === 0;

  if (isEmpty) {
    return (
      <div className='flex h-60 w-full flex-col items-center justify-center gap-4 text-center'>
        <div className='flex flex-col gap-1'>
          <span className='text-body-m font-medium text-gray-600'>
            {NOTIFICATION_MESSAGES.EMPTY.TITLE}
          </span>
          <span className='text-caption-m text-gray-400'>
            {NOTIFICATION_MESSAGES.EMPTY.SUB}
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      {notificationListData.pages.map((page, pageIndex) => (
        <div key={pageIndex}>
          {page.notifications.map((each: NotificationType) => (
            <button
              type='button'
              onClick={() => handleNotificationClick(each)}
              key={each.id}
              className='w-full cursor-pointer rounded-md py-[0.875rem] text-left text-[0.813rem] font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50'
            >
              <NotificationItem data={each} />
            </button>
          ))}
        </div>
      ))}
      <div ref={targetRef} className='flex h-4 items-center justify-center'>
        {isFetchingNextPage && (
          <span>{NOTIFICATION_MESSAGES.STATE.LOADING}</span>
        )}
      </div>
    </>
  );
};

export default NotificationList;
