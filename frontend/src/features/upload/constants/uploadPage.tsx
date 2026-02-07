import { UploadPageIcons as I } from '@/features/upload/icons';
import type {
  StepInformationProps,
  TabDataType,
  UploadTabDataType,
} from '@/features/upload/types/upload';

export const STEP_DATA: Record<string, StepInformationProps> = {
  '1': {
    className: 'left-[4.6875rem]',
    Icon: I.UploadIcon,
    step: 'step 01',
    name: '자료 업로드',
    loadingTitle:
      '질문과 답변으로 구성된 자기소개서 파일 혹은 텍스트를 입력해주세요!',
    loadingSubTitle:
      'AI 라벨링을 거쳐 라이브러리에 저장되며, 언제든 다시 꺼내볼 수 있어요.',
  },
  '2': {
    className: 'left-[15.125rem]',
    Icon: I.AILabelingIcon,
    step: 'step 02',
    name: 'AI 라벨링',
    loadingTitle: '업로드해주신 자료를 분석하는 중이에요...',
    loadingSubTitle:
      '잠시만 기다려주세요.\nAI가 분석을 마치면 알림을 전송해드릴게요!',
  },
  '3': {
    className: 'left-[25.5rem]',
    Icon: I.CompleteSavedIcon,
    step: 'step 03',
    name: '저장 완료',
    loadingTitle: '저장이 완료되었어요!',
    loadingSubTitle: '총 3개의 문항이 라이브러리에 저장되었어요.',
  },
};

export const TAB_DATA: TabDataType[] = [
  { tabName: '자기소개서 01', tabNumber: 1 },
  { tabName: '자기소개서 02', tabNumber: 2 },
  { tabName: '자기소개서 03', tabNumber: 3 },
];

export const UPLOAD_TAB_DATA: UploadTabDataType[] = [
  {
    label: '파일 업로드하기',
    targetTab: 'file',
    icon: <I.FileUploadIcon />,
  },
  {
    label: '텍스트 붙여넣기',
    targetTab: 'text',
    icon: <I.TextUploadIcon />,
  },
];
