import ReviewLayout from '@/features/review/components/ReviewLayout';
import { reviewHeaderText } from '@/features/review/constants';
import ContentHeader from '@/shared/components/ContentHeader';

const ReviewPage = () => {
  // TODO: 페이지 진입시, 접근 제어 API
  // (1) 활성화된 첨삭 링크 상태인가?
  // (2) 사용자가 로그인 되어있는가?
  // (3) 사용자가 작성자인가?

  // TODO: 첨삭자의 SSE 연결
  // 수정된 자기소개서 정보 받기

  return (
    <div className='flex h-screen w-full flex-col overflow-hidden px-75 pb-30'>
      <ContentHeader {...reviewHeaderText} />
      <div className='flex min-h-0 w-full flex-1 flex-row overflow-hidden'>
        <ReviewLayout />
      </div>
    </div>
  );
};

export default ReviewPage;
