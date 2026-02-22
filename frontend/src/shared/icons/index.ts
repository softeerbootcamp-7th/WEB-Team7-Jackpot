// 개별 import
import { AlertIcon } from '@/shared/icons/Alert';
import { DeleteIcon } from '@/shared/icons/Delete';
import DropdownArrow from '@/shared/icons/DropdownArrow';
import MoreVertIcon from '@/shared/icons/MoreVertIcon';
import NotFoundIllustration from '@/shared/icons/NotFoundIllustration';
import { PaginationIcon } from '@/shared/icons/PaginationIcons';
import PaperChipIcon from '@/shared/icons/PaperChipIcon';
import PenToolIcon from '@/shared/icons/PenToolIcon';
import { PlusIcon } from '@/shared/icons/Plus';
import { ReviewMessageIcon } from '@/shared/icons/ReviewMessageIcon';
import RightArrow from '@/shared/icons/RightArrow';
import SaveCheckIcon from '@/shared/icons/SaveCheckIcon';
import { SearchIcon } from '@/shared/icons/Search';
import TitleLogo from '@/shared/icons/TitleLogo';
import UserAvatarIcon from '@/shared/icons/UserAvatarIcon';
import { WritingCoverLetterIcon } from '@/shared/icons/WritingCoverLetter';

// 개별 export (tree-shaking 가능)
export {
  AlertIcon,
  DeleteIcon,
  DropdownArrow,
  MoreVertIcon,
  NotFoundIllustration,
  PaginationIcon,
  PaperChipIcon,
  PenToolIcon,
  PlusIcon,
  ReviewMessageIcon,
  RightArrow,
  SaveCheckIcon,
  SearchIcon,
  TitleLogo,
  UserAvatarIcon,
  WritingCoverLetterIcon,
};

// 네임스페이스 export (기존 호환성)
export const SharedIcons = {
  AlertIcon,
  DeleteIcon,
  MoreVertIcon,
  NotFoundIllustrationIcon: NotFoundIllustration,
  PaginationIcon,
  PaperChipIcon,
  PenToolIcon,
  PlusIcon,
  ReviewMessageIcon,
  RightArrowIcon: RightArrow,
  SaveCheckIcon,
  SearchIcon,
  TitleLogoIcon: TitleLogo,
  UserAvatarIcon,
  WritingCoverLetterIcon,
  DropdownArrowIcon: DropdownArrow,
} as const;
