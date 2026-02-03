export interface FirstContentAreaHeaderProps {
  uploadTab: 'file' | 'text';
  setUploadTab: (newValue: 'file' | 'text') => void;
  step?: string;
  nextStep?: (step: string) => void;
}

export interface CoverLetterListProps {
  tabState: 1 | 2 | 3;
  setTabState: (newValue: 1 | 2 | 3) => void;
}

export interface PaginationButtonIconProps {
  color: string;
}