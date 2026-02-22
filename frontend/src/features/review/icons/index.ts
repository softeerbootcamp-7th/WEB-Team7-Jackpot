// 개별 import
import ChevronIcon from '@/features/review/icons/ChevronIcon';
import PenIcon from '@/features/review/icons/PenIcon';
import TrashCanIcon from '@/features/review/icons/TrashCanIcon';

// 개별 export (tree-shaking 가능)
export { ChevronIcon, PenIcon, TrashCanIcon };

// 네임스페이스 export (기존 호환성)
export const ReviewPageIcons = {
  ChevronIcon,
  PenIcon,
  TrashCanIcon,
} as const;
