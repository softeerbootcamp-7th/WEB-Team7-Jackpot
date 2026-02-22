// [박소민] 재사용 가능한 리스트 뷰입니다.
// 나의 채용공고 페이지의 날짜를 클릭했을 때 보이는 리스트
// 라이브러리 페이지의 기업 폴더를 클릭했을 때 보이는 리스트

import type { ReactNode } from 'react';

import type { CoverLetterBase } from '@/shared/types/coverLetter';
import { getDate } from '@/shared/utils/dates';

export interface DocumentItemProps extends CoverLetterBase {
  // 데이터 Props
  applySeason?: string | null; // "2025 상반기"
  questionCount?: number;
  // 상태 및 이벤트 Props
  hasLink?: boolean; // 클릭 가능 여부 (기본값: true)
  isSelected?: boolean;
  onClick?: (coverLetterId: number) => void;

  // 슬롯 Props (수정/삭제 버튼 등)
  rightAction?: ReactNode;
}

const DocumentItem = ({
  coverLetterId,
  companyName,
  jobPosition,
  applySeason,
  deadline,
  questionCount,
  hasLink = true,
  isSelected = true, // 기본값 true (선택 안된 상태일 때만 흐리게 처리하기 위함)
  onClick,
  rightAction,
}: DocumentItemProps) => {
  return (
    <div
      onClick={() => onClick?.(coverLetterId)}
      role={hasLink ? 'button' : undefined}
      tabIndex={hasLink ? 0 : undefined}
      onKeyDown={
        hasLink
          ? // [박소민] TODO: 리팩토링
            (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick?.(coverLetterId);
            }
          : undefined
      }
      className={`w-full ${hasLink ? 'cursor-pointer hover:bg-gray-50' : ''} transition-opacity ${
        isSelected ? 'opacity-100' : 'opacity-30 hover:opacity-100'
      }`}
    >
      <div className='flex flex-col items-start justify-start gap-3 border-b border-gray-100 px-4 py-5'>
        {/* 상단 영역: 뱃지(기업명, 직무) + 우측 액션 버튼 */}
        <div className='flex w-full items-center justify-between'>
          {/* 왼쪽: 뱃지 리스트 */}
          <div className='flex items-center gap-2'>
            {/* 기업명 뱃지 (파란색) */}
            <span className='inline-flex items-center justify-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600'>
              {companyName}
            </span>

            {/* 채용시기 뱃지 (회색) */}
            {applySeason && (
              <span className='inline-flex items-center justify-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600'>
                {applySeason}
              </span>
            )}
          </div>

          {/* 오른쪽: 액션 버튼 (수정/삭제 등) */}
          {rightAction && (
            <div
              className='flex items-center'
              onClick={(e) => e.stopPropagation()} // 부모 클릭(페이지 이동) 방지
            >
              {rightAction}
            </div>
          )}
        </div>

        {/* 하단 영역: 제목 + 메타 정보 */}
        <div className='flex flex-col gap-1'>
          <h3 className='line-clamp-1 text-lg font-bold text-gray-950'>
            {companyName} - {jobPosition}
          </h3>

          <div className='flex items-center gap-1 text-xs text-gray-500'>
            {questionCount !== undefined && (
              <>
                <span>총 {questionCount}문항</span>
                <span>·</span>
              </>
            )}
            <span>{deadline ? getDate(deadline) : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentItem;
