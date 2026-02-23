import { Suspense } from 'react';

import SidebarCardDetail from '@/features/coverLetter/components/sidebar/SidebarCardDetail';
import type { ScrapItem } from '@/features/coverLetter/types/coverLetter';
import { useQnAListQueries } from '@/features/library/hooks/queries/useLibraryListQueries';
import { SidebarSkeleton } from '@/shared/components/SidebarSkeleton';
import * as SI from '@/shared/icons';

interface LibraryQnAListProps {
  libraryName: string;
  selectedItem: ScrapItem | null;
  onSelectItem: (item: ScrapItem) => void;
  onBackToLibraryList: () => void;
  onBack: () => void;
}

/**
 * LibraryQnAList 컴포넌트
 *
 * 역할: 선택된 문항 폴더 내의 문항들을 리스트로 표시
 * - 폴더명(libraryName)을 prop으로 받아 해당 문항들을 조회
 * - 문항 클릭 시 상세보기로 전환
 * - 상세보기에서 뒤로가기 → 폴더 리스트 복귀 (onBackToLibraryList)
 * - 폴더 리스트에서 뒤로가기 → 검색 결과 복귀 (onBack)
 */
const LibraryQnAList = ({
  libraryName,
  selectedItem,
  onSelectItem,
  onBackToLibraryList,
  onBack,
}: LibraryQnAListProps) => {
  const { data } = useQnAListQueries(libraryName);

  const questions =
    data?.pages.flatMap((page) =>
      page.qnAs.map((item) => {
        return {
          id: item.id,
          companyName: item.companyName,
          jobPosition: item.jobPosition,
          applySeason: item.applySeason,
          question: item.question,
          answer: item.answer,
          coverLetterId: item.coverLetterId,
        };
      }),
    ) ?? [];

  // 상세보기 상태
  if (selectedItem) {
    return (
      <SidebarCardDetail scrap={selectedItem} onBack={onBackToLibraryList} />
    );
  }

  return (
    <div className='flex h-full w-full flex-col items-center gap-3'>
      {/* 헤더 */}
      <div className='flex shrink-0 flex-col gap-5 self-stretch'>
        <div className='flex w-full flex-col gap-1'>
          <div className='inline-flex items-center gap-1 self-stretch px-3'>
            <button
              type='button'
              onClick={onBack}
              className='flex h-7 w-7 cursor-pointer items-center justify-center'
              aria-label='검색 결과로 돌아가기'
            >
              <SI.RightArrow className='rotate-180' />
            </button>
            <div className='flex flex-1 items-center gap-2'>
              <SI.FolderIcon />
              <div className='line-clamp-1 flex-1 text-lg leading-7 font-bold text-gray-950'>
                {libraryName}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 리스트 */}
      <div className='flex min-h-0 flex-1 flex-col self-stretch overflow-y-auto'>
        <Suspense fallback={<SidebarSkeleton len={5} />}>
          {questions.map((qna) => (
            <button
              key={qna.id}
              type='button'
              onClick={() =>
                onSelectItem({
                  id: qna.id,
                  companyName: qna.companyName,
                  jobPosition: qna.jobPosition,
                  applySeason: qna.applySeason || '',
                  question: qna.question,
                  answer: qna.answer || '',
                  coverLetterId: qna.coverLetterId,
                })
              }
              className='w-full cursor-pointer transition-colors hover:bg-gray-50'
            >
              <div className='inline-flex w-full flex-col items-start justify-start gap-3 border-b border-gray-100 px-3 py-5'>
                {/* 상단 태그 영역 */}
                <div className='inline-flex items-center justify-between self-stretch'>
                  <div className='flex flex-1 items-center justify-start gap-1'>
                    <div className='flex items-center justify-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5'>
                      <div className='justify-start text-xs leading-4 font-medium text-blue-600'>
                        {qna.companyName}
                      </div>
                    </div>
                    <div className='flex items-center justify-center gap-1 rounded-xl bg-gray-100 px-3 py-1.5'>
                      <div className='justify-start text-xs leading-4 font-medium text-gray-600'>
                        {qna.jobPosition}
                      </div>
                    </div>
                    {qna.applySeason && (
                      <div className='flex items-center justify-center gap-1 rounded-xl bg-gray-100 px-3 py-1.5'>
                        <div className='justify-start text-xs leading-4 font-medium text-gray-600'>
                          {qna.applySeason}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 하단 내용 영역 */}
                <div className='flex flex-col items-start justify-start gap-1 self-stretch'>
                  <div className='line-clamp-2 max-h-12 justify-start text-left text-lg leading-6 font-bold text-gray-950'>
                    {qna.question}
                  </div>
                  <div className='text-caption-l line-clamp-2 max-h-10 justify-start self-stretch text-left font-medium text-gray-600'>
                    {qna.answer}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </Suspense>
      </div>
    </div>
  );
};

export default LibraryQnAList;
