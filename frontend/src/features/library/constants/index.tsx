import { LibraryIcons as LII } from '@/features/library/icons';
import type { LibraryView } from '@/features/library/types';
import type { TabContentType } from '@/shared/types/tab';

export const libraryHeaderText = {
  icon: <LII.LibraryIcon />,
  title: '라이브러리',
  content: '저장한 나의 경험들을 기업별, 문항별로 나누어 관리할 수 있어요',
};

export const emptyCaseText = {
  overview: {
    title: '아직 라이브러리에\n저장된 자기소개서가 없어요',
    content:
      '자료 업로드 탭에서 자기소개서를 업로드하시면\n나의 다양한 경험들을 기업/문항별로 관리할 수 있어요.',
  },
};

export const libraryContent: TabContentType<LibraryView>[] = [
  {
    name: 'COMPANY',
    label: '기업 라이브러리',
    icon: <LII.CompanyNameLibraryIcon />,
    path: '/library/company',
  },
  {
    name: 'QUESTION',
    label: '문항 라이브러리',
    icon: <LII.QnALibraryIcon />,
    path: '/library/qnA',
  },
];

export const SITE_MAP: Record<LibraryView, string> = {
  COMPANY: 'company',
  QUESTION: 'qna',
};
