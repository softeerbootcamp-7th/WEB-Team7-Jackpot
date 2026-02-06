import ReviewLayout from '@/features/review/components/ReviewLayout';
import { reviewHeaderText } from '@/features/review/constants';
import ContentHeader from '@/shared/components/ContentHeader';
import PageGlobalHeader from '@/shared/components/PageGlobalHeader';

const ReviewPage = () => {
  // TODO: 페이지 진입시, 접근 제어 API
  // (1) 활성화된 첨삭 링크 상태인가?
  // (2) 사용자가 로그인 되어있는가?
  // (3) 사용자가 작성자인가?

  // TODO: 첨삭자의 SSE 연결
  // 수정된 자기소개서 정보 받기

  return (
    <div className='flex h-screen w-full max-w-screen min-w-[1700px] flex-col overflow-hidden pb-30'>
      <PageGlobalHeader />
      <div className='flex flex-1 flex-col overflow-hidden px-75'>
        <div className='mb-7.5 flex-none'>
          <ContentHeader {...reviewHeaderText} />
        </div>
        <div className='flex w-full flex-1 overflow-hidden'>
          <ReviewLayout />
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
