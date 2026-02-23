import { useInfiniteCoverLetterFilter } from '@/features/coverLetter/hooks/useCoverLetterFilter';
import CoverLetterOverview from '@/shared/components/CoverLetterOverview';
import EmptyCase from '@/shared/components/EmptyCase';

const SharedCoverLetterResult = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteCoverLetterFilter({
      startDate: '2000-01-01', // 넉넉한 범위로 설정
      endDate: '2100-12-31',
      isShared: true,
      size: 9,
    });

  // 무한 스크롤의 2차원 배열 데이터를 1차원 배열로 평탄화
  const coverLetters = data.pages.flatMap((page) => page.coverLetters || []);

  if (coverLetters.length === 0) {
    return (
      <EmptyCase
        title='친구와 함께 첨삭할 수 있는 자소서가 없습니다.'
        content='공유된 자소서를 먼저 확인해보세요.'
      />
    );
  }

  return (
    <div className='flex h-full w-full flex-col'>
      <CoverLetterOverview
        coverLetters={coverLetters}
        isCoverLetter={true}
        currentPage={0}
        totalPage={1} // 무한 스크롤이므로 페이지네이션 무력화
        onPageChange={() => {}} // 동작 안함
      />
      {/* 무한 스크롤 더보기 버튼 */}
      {hasNextPage && (
        <button
          type='button'
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className='mx-auto mt-6 mb-10 rounded-full border px-6 py-2 text-sm font-medium hover:bg-gray-50'
        >
          {isFetchingNextPage ? '불러오는 중...' : '더보기'}
        </button>
      )}
    </div>
  );
};

export default SharedCoverLetterResult;
