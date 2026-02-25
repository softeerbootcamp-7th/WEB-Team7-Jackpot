import { QUESTION_TYPE_LIST } from '@/features/upload/constants/uploadPage';
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

export interface ContentItemType {
  companyName: string;
  jobPosition: string;
  recruitPeriod: {
    year: number;
    season: ApiApplyHalf;
  };
  deadline: string;
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

// 1단계: 타입 정의 & API 함수 구성
// 1-1. 타입 정의

export interface PresignedUrlRequest {
  clientFileId: number;
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface PresignedUrlResponse {
  clientFileId: number;
  fileName: string;
  presignedUrl: string;
  fileKey: string;
  requiredHeaders: {
    'Content-Type': string;
    'x-amz-meta-fileid': string;
  };
}

export interface SaveCoverLetterResponse {
  savedCoverLetterCount: number;
}

export interface FileUploadRequest {
  presignedUrl: string;
  file: File;
  contentType: string;
}

export interface FileState {
  clientFileId: number;
  file: File | null;
  status: UploadStatus;
  presignedUrl?: string;
  fileKey?: string;
}

export interface StartLabelingRequest {
  files: Array<{
    presignedUrl: string;
    fileKey: string;
  }>;
}

interface BeforeLabelingFileType {
  presignedUrl: string;
  fileKey: string;
}
export interface StartAiLabelingRequest {
  files: BeforeLabelingFileType[];
}

// 배열 요소 하나에 대한 타입
export type QuestionCategoryType = (typeof QUESTION_TYPE_LIST)[number];

export type QuestionCategoryValue = QuestionCategoryType['value'];

interface QnAInSaveCoverLetter {
  question: string;
  answer: string;
  questionCategory?: QuestionCategoryValue;
}

interface EachCoverLetterInSaveCoverLetter {
  companyName: string;
  jobPosition: string;
  applyYear: number;
  applyHalf: ApiApplyHalf;
  deadline: string;
}

interface CoverLetterInSaveCoverLetter {
  coverLetter: EachCoverLetterInSaveCoverLetter;
  qnAs: QnAInSaveCoverLetter[];
}
export interface SaveCoverLetterRequest {
  uploadJobId: string;
  coverLetters: CoverLetterInSaveCoverLetter[];
}
