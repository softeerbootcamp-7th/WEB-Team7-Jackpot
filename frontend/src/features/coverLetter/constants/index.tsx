import { CoverLetterIcon } from '@/features/coverLetter/icons/CoverLetter';
import { NewCoverLetterTabIcon } from '@/features/coverLetter/icons/NewCoverLetterTab';
import { ReviewWithFriendIcon } from '@/features/coverLetter/icons/ReviewWithFriend';
import type { CoverLetterView } from '@/features/coverLetter/types';
import type { TabContentType } from '@/shared/types/tab';

export const coverLetterHeaderText = {
  icon: <CoverLetterIcon />,
  title: '자기소개서 작성',
  content: '자기소개서를 작성하고 링크를 공유해 지인들과 첨삭할 수 있어요',
};

export const emptyCaseText = {
  overview: {
    title: '잠시만요!\n아직 작성된 자기소개서가 없어요',
    content:
      '상단의 ‘자기소개서 추가하기’ 버튼을 눌러\n새로운 자기소개서를 작성할 수 있어요.',
  },
};

export const coverLetterContent: TabContentType<CoverLetterView>[] = [
  {
    name: 'COVERLETTER_WRITE',
    label: '자기소개서 작성',
    icon: <NewCoverLetterTabIcon />,
    path: '/cover-letter/edit',
  },
  {
    name: 'REVIEW_WITH_FRIEND',
    label: '친구와 함께 첨삭',
    icon: <ReviewWithFriendIcon />,
    path: '/cover-letter/qna-friends',
  },
];
