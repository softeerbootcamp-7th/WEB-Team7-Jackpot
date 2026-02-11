// 페이지네이션 경로 추후에 shared로 변경 필요
import CoverLetterPagination from '@/features/review/components/coverLetter/CoverLetterPagination';
import { MOCK_COVER_LETTER } from '@/features/upload/constants/uploadPage';
import useReviewState from '@/shared/hooks/useReviewState';

const CoverLetterContentArea = () => {
  const { currentPageIndex, handlePageChange } = useReviewState();
  const currentContent = MOCK_COVER_LETTER[currentPageIndex].content;

  return (
    <div className='flex flex-2 flex-col gap-6'>
      <div>
        <div className='flex items-center gap-3'>
          <div className='text-body-m flex h-9 w-9 items-center justify-center rounded-md bg-gray-50 font-bold text-gray-600 select-none'>
            {currentPageIndex + 1}
          </div>
          <div className='text-lg font-bold text-gray-950'>
            {MOCK_COVER_LETTER[currentPageIndex].title}
          </div>
        </div>
        <div className='flex flex-col gap-3 pl-13'>
          <div className='text-sm text-gray-400'>
            {`총 ${MOCK_COVER_LETTER[currentPageIndex].content.length.toLocaleString('ko-KR')}자`}
          </div>
          <div className='text-body-s fixed-scroll-bar h-96 overflow-y-auto whitespace-pre-wrap text-gray-600'>
            {currentContent.split('\n').map((paragraph, index) => (
              <p key={index} className='mb-2 min-h-[1rem] leading-relaxed'>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
      <CoverLetterPagination
        current={currentPageIndex}
        total={MOCK_COVER_LETTER.length}
        onChange={handlePageChange}
      />
    </div>
  );
};

export default CoverLetterContentArea;
