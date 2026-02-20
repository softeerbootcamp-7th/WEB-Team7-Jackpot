import type { ApiApplyHalf } from '@/shared/types/coverLetter';

export interface PaginationButtonIconProps {
  color: string;
}

export interface StepDataType {
  className: string;
  Icon: React.ComponentType<{ color: string }>;
  step: string;
  name: string;
  loadingTitle: string;
  loadingSubTitle: string;
}

// [박소민] TODO: year 유효성 검사
export interface ContentItemType {
  companyName: string;
  jobPosition: string;
  recruitPeriod: {
    year: number;
    season: ApiApplyHalf;
  };
  questionType: string;
}

export interface ContentStateType {
  [key: number]: ContentItemType;
}

export interface TabDataType {
  tabName: string;
  tabNumber: number;
}

export interface UploadTabDataType {
  label: string;
  icon: React.ReactNode;
}

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';
