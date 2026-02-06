export interface FirstContentAreaHeaderProps {
  uploadTab: 'file' | 'text';
  setUploadTab: (newValue: 'file' | 'text') => void;
  step?: string;
  nextStep?: (step: string) => void;
}

export interface CoverLetterTabProps {
  tabState: 1 | 2 | 3;
  setTabState: (newValue: 1 | 2 | 3) => void;
}

export interface PaginationButtonIconProps {
  color: string;
}

export interface StepInformationProps {
  className: string;
  Icon?: React.ComponentType<{ color: string }>;
  icon?: React.ReactNode;
  step: string;
  name: string;
  loadingTitle?: string;
  loadingSubTitle?: string;
}

export interface RecruitSeasonType {
  season: 'first' | 'second';
  label: string;
}

export interface ContentItemType {
  companyName: string;
  jobPosition: string;
  recruitPeriod: {
    year: number;
    season: 'first' | 'second';
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
  tabNumber: 1 | 2 | 3;
}

export interface UploadTabDataType {
  label: string;
  targetTab: 'file' | 'text';
  icon: React.ReactNode;
}