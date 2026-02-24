import * as RCI from '@/features/recruit/icons';

export const recruitHeaderText = {
  icon: () => <RCI.RecruitIcon />,
  title: '나의 채용공고',
  content:
    '관심 있는 채용 공고를 등록하고, 캘린더에서 공고들을 한눈에 확인할 수 있어요.',
};

export const recruitEmptyText = {
  title: '선택한 날짜에\n저장된 공고가 없어요',
  content: '상단의 ‘새 공고 등록하기’ 버튼을 눌러서\n공고를 등록해 보세요.',
  icon: '/images/EmptyFolder.png',
};
