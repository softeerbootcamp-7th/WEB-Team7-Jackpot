import { NavLink } from 'react-router';

import * as LII from '@/features/library/icons';
import type { QnASearchResponse } from '@/features/library/types';

interface QnASearchResultProps {
  keyword: string;
  data: QnASearchResponse | null;
  isLoading: boolean;
  className?: string;
}

const QnASearchResult = ({
  keyword,
  data,
  isLoading,
  className,
}: QnASearchResultProps) => {
  // 로딩 상태
  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center pt-20 ${className ?? ''}`}
      >
        <span className='text-gray-400'>검색 중...</span>
      </div>
    );
  }

  // 검색어 없음
  if (!keyword) return null;

  // 데이터 없음
  if (!data || (data.libraryCount === 0 && data.qnACount === 0)) {
    return (
      <div className='flex flex-col items-center justify-center gap-2 pt-20 text-gray-400'>
        <span>검색 결과가 없습니다.</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {data.libraries.length > 0 && (
        <div className='flex w-full flex-col items-start justify-start gap-3 border-b border-gray-100 pb-3'>
          <div className='inline-flex h-7 w-full items-center justify-start px-3'>
            <div className='flex items-center justify-start gap-2 pl-3'>
              <div className='relative h-6 w-6 overflow-hidden'>
                <div className='absolute top-0 left-0 h-6 w-6'>
                  <LII.FolderIcon />
                </div>
              </div>
              <div className='flex items-center justify-start gap-1'>
                <div className='text-base leading-6 font-bold text-gray-900'>
                  문항 유형 검색 결과
                </div>
                <div className='text-xs leading-5 font-bold text-gray-400'>
                  ·
                </div>
                <div className='text-xs leading-5 font-bold text-gray-400'>
                  {data.libraryCount}개
                </div>
              </div>
            </div>
          </div>

          {/* 세로 스크롤 가능한? 폴더 리스트 영역 [박소민] TODO: 어떻게 스크롤 처리할지 결정 */}
          <div className='flex w-full flex-col items-start justify-start'>
            <div className='scrollbar-hide inline-flex w-full items-center justify-start overflow-y-auto px-3'>
              {data.libraries.map((libName) => (
                <NavLink
                  to={`/library/qna/${encodeURIComponent(libName)}`}
                  key={libName}
                  className='inline-flex w-28 shrink-0 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex-col items-center justify-center gap-2.5 px-3 pt-5 pb-4'
                >
                  <div className='relative flex flex-col items-center'>
                    <LII.LibraryFolder />
                  </div>
                  {/* 라이브러리 이름 */}
                  <div className='line-clamp-1 w-24 text-center text-xs leading-5 font-medium text-gray-900'>
                    {libName}
                  </div>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 단건 문항 검색 결과*/}
      {data.qnAs.length > 0 && (
        <div className='mt-4 flex w-full flex-col items-start justify-start gap-2'>
          <div className='inline-flex h-7 w-full items-center justify-start px-3'>
            <div className='flex items-center justify-start gap-2 pl-3'>
              <div className='relative h-6 w-6 overflow-hidden'>
                <LII.QnASearchResultIcon />
              </div>
              <div className='flex items-center justify-start gap-1'>
                <div className='text-base leading-6 font-bold text-gray-950'>
                  문항 검색 결과
                </div>
                <div className='text-xs leading-5 font-bold text-gray-400'>
                  ·
                </div>
                <div className='text-xs leading-5 font-bold text-gray-400'>
                  {data.qnACount}개
                </div>
              </div>
            </div>
          </div>

          <div className='flex w-full flex-col items-start justify-start px-3'>
            {data.qnAs.map((qna) => (
              <NavLink
                key={qna.qnAId}
                to={`/library/qna/${qna.questionCategoryType}/${qna.qnAId}`}
                className='flex w-full cursor-pointer flex-col items-start justify-start gap-3 rounded-lg border-b border-gray-200 px-3 py-5 text-left transition-colors duration-200 hover:bg-gray-50'
              >
                <div className='inline-flex w-full items-center justify-between'>
                  <div className='flex flex-1 items-center justify-start gap-1'>
                    <div className='flex items-center justify-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5'>
                      <div className='text-xs leading-4 font-medium text-blue-600'>
                        {qna.companyName}
                      </div>
                    </div>
                    <div className='flex items-center justify-center gap-1 rounded-xl bg-gray-100 px-3 py-1.5'>
                      <div className='text-xs leading-4 font-medium text-gray-500'>
                        {qna.jobPosition}
                      </div>
                    </div>

                    {qna.applySeason && (
                      <div className='flex items-center justify-center gap-1 rounded-xl bg-gray-100 px-3 py-1.5'>
                        <div className='text-xs leading-4 font-medium text-gray-500'>
                          {qna.applySeason}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className='flex w-full flex-col items-start justify-start gap-1'>
                  <div className='inline-flex w-full items-center justify-start gap-1'>
                    <div className='line-clamp-2 max-h-12 flex-1 justify-start text-lg leading-6 font-bold text-gray-900'>
                      {qna.question}
                    </div>
                  </div>
                  <div className='line-clamp-2 max-h-10 w-full justify-start text-xs leading-5 font-medium text-gray-500'>
                    {qna.answer}
                  </div>
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QnASearchResult;
