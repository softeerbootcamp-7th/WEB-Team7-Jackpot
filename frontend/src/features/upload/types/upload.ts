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

export interface ContentItemType {
  companyName: string;
  jobPosition: string;
  recruitPeriod: {
    year: number;
    season: 'FIRST_HALF' | 'SECOND_HALF';
  };
  questionType: string;
}

export interface ContentStateType {
  [key: number]: ContentItemType;
}

export interface DropdownStateType {
  companyNameDropdown: boolean;
  jobPositionDropdown: boolean;
  yearDropdown: boolean;
  questionTypeDropdown: boolean;
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
