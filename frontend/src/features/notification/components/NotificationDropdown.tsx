import NotificationList from '@/features/notification/components/NotificationList';
import { NOTIFICATION_MESSAGES } from '@/features/notification/constants';
import {
  useGetNotificationCount,
  useReadAllNotification,
} from '@/features/notification/hooks/useNotification';
import * as NI from '@/features/notification/icons';

interface NotificationDropdownProps {
  handleDropdown: (isOpen: boolean) => void;
  isOpen: boolean;
}

const NotificationDropdown = ({
  handleDropdown,
  isOpen,
}: NotificationDropdownProps) => {
  const { data: unreadCount, isLoading, isError } = useGetNotificationCount();
  const { mutate: readAllNotification } = useReadAllNotification();
  if (isLoading) return <div>{NOTIFICATION_MESSAGES.STATE.LOADING}</div>;
  if (isError) return <div>{NOTIFICATION_MESSAGES.STATE.ERROR}</div>;
  const safeCount = unreadCount ?? 0;
  return (
    <div className='relative inline-block'>
      <button
        type='button'
        onClick={() => handleDropdown(!isOpen)}
        className={`relative cursor-pointer rounded-lg p-2 transition-colors duration-200 hover:bg-gray-100 ${isOpen ? 'z-20' : 'z-0'}`}
      >
        <NI.HeaderNotificationIcon />
        {safeCount > 0 && (
          <span
            key={safeCount}
            className='animate-badge-pop absolute top-0.5 right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-white'
          >
            {safeCount > 99 ? '99+' : safeCount}
          </span>
        )}
      </button>
      {isOpen && (
        <>
          <div
            className='fixed inset-0 z-10 cursor-default'
            onClick={() => handleDropdown(false)}
          />
          <div className='fixed-scroll-bar animate-dropdown absolute right-0 z-20 mt-2 flex max-h-100 w-90 flex-col gap-2 overflow-y-scroll rounded-lg bg-white py-6 shadow-[0_0_20px_rgba(0,0,0,0.1)] select-none'>
            <div className='flex items-center justify-between px-4'>
              <div className='flex items-center gap-2'>
                <NI.NotificationIcon />
                <span className='text-body-l font-bold text-gray-950'>
                  {NOTIFICATION_MESSAGES.TITLE}
                </span>
              </div>
              <button
                type='button'
                onClick={() => {
                  readAllNotification();
                  handleDropdown(false);
                }}
                className='text-caption-m flex cursor-pointer items-center justify-center rounded-md bg-gray-50 px-2 py-1 font-medium text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700 active:scale-95'
              >
                {NOTIFICATION_MESSAGES.READ_ALL}
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
