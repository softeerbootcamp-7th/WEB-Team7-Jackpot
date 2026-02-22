// 개별 import
import { DateIcon } from '@/features/recruit/icons/Date';
import { EditIcon } from '@/features/recruit/icons/Edit';
import { NewRecruitIcon } from '@/features/recruit/icons/NewRecruit';
import { RecruitIcon } from '@/features/recruit/icons/Recruit';
import { RecruitEditIcon } from '@/features/recruit/icons/RecruitEdit';
import { DeleteIcon } from '@/shared/icons';

// 개별 export (tree-shaking 가능)
export {
  DateIcon,
  DeleteIcon,
  EditIcon,
  NewRecruitIcon,
  RecruitEditIcon,
  RecruitIcon,
};

// 네임스페이스 export (기존 호환성)
export const RecruitIcons = {
  DateIcon,
  EditIcon,
  NewRecruitIcon,
  RecruitIcon,
  RecruitEditIcon,
  DeleteIcon,
} as const;
