import { NotificationDropdownIcon as NI } from '@/features/notification/icons';
import type { NotificationType } from '@/features/notification/types/notification';

interface NotificationItemProps {
  data: NotificationType;
}

interface FeedbackNotificationHeaderProps {
  nickname: string;
}

const FeedbackNotificationHeader = ({
  nickname,
}: FeedbackNotificationHeaderProps) => {
  return (
    <div className='flex items-center gap-2'>
      <NI.ProfileIcon />
      <span className='text-caption-m text-purple-600'>
        <span className='font-bold'>{nickname}</span>님이 새로운 알림을
        보냈어요!
      </span>
    </div>
  );
};

const LabelingNotificationHeader = () => {
  return (
    <div className='flex items-center gap-2'>
      <NI.CardFileBoxIcon />
      <span className='text-caption-m text-purple-600'>
        요청하신 AI 라벨링이 완료되었어요!
      </span>
    </div>
  );
};

const NotificationItem = ({ data }: NotificationItemProps) => {
  return (
    <div
      className={`relative flex flex-col gap-2 px-4 py-3 ${data.isRead ? 'opacity-50' : 'opacity-100'}`}
    >
      {!data.isRead && (
        <div className='absolute top-3 right-3 h-2 w-2 rounded-full bg-red-500 ring-4 ring-purple-50/40' />
      )}
      {data.type === 'FEEDBACK' ? (
        <FeedbackNotificationHeader nickname={data.meta.sender.nickname} />
      ) : (
        <LabelingNotificationHeader />
      )}
      <div className='flex flex-col gap-1'>
        <span className='text-body-m font-bold text-gray-950'>
          {data.title}
        </span>
        <span className='text-caption-m text-gray-400'>{data.content}</span>
      </div>
    </div>
  );
};

export default NotificationItem;
