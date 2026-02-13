import { CompanyNameLibrary } from '@/features/library/icons/CompanyNameLibrary';
import { LibraryIcon } from '@/features/library/icons/Library';
import { QnALibrary } from '@/features/library/icons/QnALibrary';
import type { LibraryView } from '@/features/library/types';
import type { TabContentType } from '@/shared/types/tab';

export const libraryHeaderText = {
  icon: <LibraryIcon />,
  title: '라이브러리',
  content: '저장한 나의 경험들을 기업별, 문항별로 나누어 관리할 수 있어요',
};

export const emptyCaseText = {
  overview: {
    title: '아직 라이브러리에\n저장된 자기소개서가 없어요',
    content:
      '자료 업로드 탭에서 자기소개서를 업로드하시면\n나의 다양한 경험들을 기업/문항별로 관리할 수 있어요.',
  },
  folder: {
    title: '라이브러리 내에서\n조회할 항목을 선택해주세요',
    content:
      '좌측 패널의 자기소개서 목록에서\n조회하고 싶은 자기소개서를 선택해주세요.',
  },
};

export const libraryContent: TabContentType<LibraryView>[] = [
  {
    name: 'COMPANY',
    label: '기업 라이브러리',
    icon: <CompanyNameLibrary />,
    path: '/library/company',
  },
  {
    name: 'QUESTION',
    label: '문항 라이브러리',
    icon: <QnALibrary />,
    path: '/library/qnA',
  },
];

export const SITE_MAP: Record<LibraryView, string> = {
  COMPANY: 'company',
  QUESTION: 'qna',
};
