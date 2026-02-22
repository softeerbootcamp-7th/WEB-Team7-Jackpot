// 개별 import
import CheckIcon from '@/features/landing/icons/CheckIcon';
import FirstCardIcon from '@/features/landing/icons/FirstCardIcon';
import RightArrowIcon from '@/features/landing/icons/RightArrowIcon';
import SecondCardIcon from '@/features/landing/icons/SecondCardIcon';
import ThirdCardIcon from '@/features/landing/icons/ThirdCardIcon';
import TypographyCursor from '@/features/landing/icons/TypographyCursor';

// 개별 export (tree-shaking 가능)
export { CheckIcon, FirstCardIcon, RightArrowIcon, SecondCardIcon, ThirdCardIcon, TypographyCursor };

// 네임스페이스 export (기존 호환성)
export const LandingPageIcon = {
  CheckIcon,
  FirstCardIcon,
  RightArrowIcon,
  SecondCardIcon,
  ThirdCardIcon,
  TypographyCursorIcon: TypographyCursor,
} as const;
