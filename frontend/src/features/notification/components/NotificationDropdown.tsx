import NotificationList from '@/features/notification/components/NotificationList';
import {
  useGetNotificationCount,
  useReadAllNotification,
} from '@/features/notification/hooks/useNotification';
import { NotificationDropdownIcon as I } from '@/features/notification/icons';

interface NotificationDropdownProps {
  handleDropdown: (isOpen: boolean) => void;
  isOpen: boolean;
}

const NotificationDropdown = ({
  handleDropdown,
  isOpen,
}: NotificationDropdownProps) => {
  const { data: unreadCount, isLoading, isError } = useGetNotificationCount();
  const { mutateAsync: readAllNotification } = useReadAllNotification();
  if (isLoading) return <div>로딩 중...</div>;
  if (isError) return <div>에러 발생</div>;

  return (
    <div className='relative inline-block'>
      <button
        type='button'
        onClick={() => handleDropdown(!isOpen)}
        className={`relative cursor-pointer p-1 ${isOpen ? 'z-20' : 'z-0'}`}
      >
        <I.HeaderNotificationIcon />
        {unreadCount > 0 && (
          <span className='absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-white'>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <>
          <div
            className='fixed inset-0 z-10 cursor-default'
            onClick={() => handleDropdown(false)}
          />
          {/* [윤종근] - 추후 PR 이후 커스텀 스크롤 (스크롤 영역 고정) 클래스 추가 필요 */}
          <div className='absolute right-0 z-20 mt-2 flex max-h-100 w-90 flex-col gap-2 overflow-y-scroll rounded-lg bg-white py-6 shadow-[0_0_20px_rgba(0,0,0,0.1)] select-none'>
            <div className='flex items-center justify-between px-4'>
              <div className='flex items-center gap-2'>
                <I.NotificationIcon />
                <span className='text-body-l font-bold text-gray-950'>
                  최근 도착한 알림
                </span>
              </div>
              <button
                type='button'
                onClick={() => readAllNotification()}
                className='text-caption-m flex items-center justify-center rounded-md bg-gray-50 px-2 py-1 font-medium text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700 active:scale-95'
              >
                모두 읽음
              </button>
            </div>
            <div className='flex flex-col gap-1 p-1'>
              <NotificationList handleDropdown={handleDropdown} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
