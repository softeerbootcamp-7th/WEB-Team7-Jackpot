import * as CI from '@/features/coverLetter/icons';

export const coverLetterHeaderText = {
  icon: () => <CI.CoverLetterIcon />,
  title: '자기소개서 작성',
  content: '자기소개서를 작성하고 링크를 공유해 지인들과 첨삭할 수 있어요',
};

export const emptyCaseText = {
  overview: {
    title: '잠시만요!\n아직 작성된 자기소개서가 없어요',
    content: `상단의 '자기소개서 추가하기' 버튼을 눌러\n새로운 자기소개서를 작성할 수 있어요.`,
  },
  search: {
    title: '검색 결과가 없어요',
    content: '키워드를 변경하거나 검색어를 줄여 다시 시도해보세요.',
  },
};
