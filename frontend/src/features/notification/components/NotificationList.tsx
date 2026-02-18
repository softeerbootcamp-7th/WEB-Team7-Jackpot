import NotificationItem from '@/features/notification/components/NotificationItem';
import {
  useGetAllNotification,
  useReadEachNotification,
} from '@/features/notification/hooks/useNotification';
import { useScrollTouchEndObserver } from '@/features/notification/hooks/useScrollTouchEndObserver';
import type { NotificationType } from '@/features/notification/types/notification';

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
  const { mutateAsync: readEachNotification } = useReadEachNotification();
  const { targetRef } = useScrollTouchEndObserver({
    enabled: !!hasNextPage && !isFetchingNextPage,
    onIntersect: () => fetchNextPage(),
  });

  if (isLoading) {
    return (
      <div className='flex h-40 items-center justify-center text-gray-400'>
        로딩 중...
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
            새로운 알림이 없습니다.
          </span>
          <span className='text-caption-m text-gray-400'>
            새 소식이 도착하면 알려드릴게요!
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
              onClick={() => {
                readEachNotification(Number(each.id));
                handleDropdown(false);
              }}
              key={each.id}
              className='w-full cursor-pointer rounded-md py-[0.875rem] text-left text-[0.813rem] font-medium text-gray-700 hover:bg-gray-50'
            >
              <NotificationItem data={each} />
            </button>
          ))}
        </div>
      ))}
      <div ref={targetRef} className='flex h-4 items-center justify-center'>
        {isFetchingNextPage && <span>로딩 중...</span>}
      </div>
    </>
  );
};

export default NotificationList;
