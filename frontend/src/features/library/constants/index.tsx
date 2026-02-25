import * as LII from '@/features/library/icons';
import type { LibraryView } from '@/features/library/types';
import type { TabContentType } from '@/shared/types/tab';

export const libraryHeaderText = {
  icon: () => <LII.LibraryIcon />,
  title: '라이브러리',
  content: '저장한 나의 경험들을 기업별, 문항별로 나누어 관리할 수 있어요',
};

export const emptyCaseText = {
  overview: {
    title: '아직 라이브러리에\n저장된 자기소개서가 없어요',
    content:
      '자료 업로드 탭에서 자기소개서를 업로드하시면\n나의 다양한 경험들을 기업/문항별로 관리할 수 있어요.',
  },
  error: {
    title: '라이브러리를 불러오는 데 실패했어요',
    content: '잠시 후 다시 시도해 주세요.',
  },
  notFound: {
    title: '저장된 자기소개서를 찾을 수 없어요',
    content: '해당 자기소개서가 삭제되었거나 존재하지 않는 것 같아요.',
  },
};

export const libraryContent: TabContentType<LibraryView>[] = [
  {
    name: 'COMPANY',
    label: '기업 라이브러리',
    icon: <LII.CompanyNameLibrary />,
    path: '/library/company',
  },
  {
    name: 'QUESTION',
    label: '문항 라이브러리',
    icon: <LII.QnALibrary />,
    path: '/library/qnA',
  },
];

export const SITE_MAP: Record<LibraryView, string> = {
  COMPANY: 'company',
  QUESTION: 'qna',
};
