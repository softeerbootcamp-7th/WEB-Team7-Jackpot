// 개별 import
import AlarmIcon from '@/features/home/icons/AlarmClockIcon';
import BooksIcon from '@/features/home/icons/BooksIcon';
import CalendarIcon from '@/features/home/icons/CalendarIcon';
import PlusIcon from '@/features/home/icons/PlusIcon';
import ScrollIcon from '@/features/home/icons/ScrollIcon';
import ThoughtIcon from '@/features/home/icons/ThoughtIcon';

// 개별 export (tree-shaking 가능)
export { AlarmIcon, BooksIcon, CalendarIcon, PlusIcon, ScrollIcon, ThoughtIcon };

// 네임스페이스 export (기존 호환성)
export const HomePageIcons = {
  AlarmIcon,
  BooksIcon,
  CalendarIcon,
  PlusIcon,
  ScrollIcon,
  ThoughtIcon,
} as const;
