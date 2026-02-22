// 개별 import
import CardFileBoxIcon from '@/features/notification/icons/CardFileBoxIcon';
import HeaderNotificationIcon from '@/features/notification/icons/HeaderNotificationIcon';
import NotificationIcon from '@/features/notification/icons/NotificationIcon';
import ProfileIcon from '@/features/notification/icons/ProfileIcon';

// 개별 export (tree-shaking 가능)
export { CardFileBoxIcon, HeaderNotificationIcon, NotificationIcon, ProfileIcon };

// 네임스페이스 export (기존 호환성)
export const NotificationDropdownIcon = {
  CardFileBoxIcon,
  HeaderNotificationIcon,
  NotificationIcon,
  ProfileIcon,
} as const;
