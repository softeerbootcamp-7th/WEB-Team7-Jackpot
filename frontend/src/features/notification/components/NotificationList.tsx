import NotificationItem from '@/features/notification/components/NotificationItem';
import type { NotificationType } from '@/features/notification/types/notification';

interface NotificationListProps {
  handleDropdown: (isOpen: boolean) => void;
  data: NotificationType[];
}

const NotificationList = ({ handleDropdown, data }: NotificationListProps) => {
  return (
    <>
      {data.map((each, index) => (
        <button
          type='button'
          onClick={() => {
            handleDropdown(false);
          }}
          key={index}
          className='w-full cursor-pointer rounded-md py-[0.875rem] text-left text-[0.813rem] font-medium text-gray-700 hover:bg-gray-50'
        >
          <NotificationItem data={each} />
        </button>
      ))}
    </>
  );
};

export default NotificationList;
