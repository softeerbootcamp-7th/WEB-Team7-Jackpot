// UI에 필요한 데이터만 정의 (비즈니스 로직 분리)

import type { ReactNode } from 'react';

export interface DocumentProps {
  id: number;
  companyName: string;
  jobPosition: string;
  title: string; // 예: "2025년 상반기"
  questionCount: number;
  date: string; // 예: "2026.01.23" (부모에서 포맷팅해서 전달)
  isSelected?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}

const Document = ({
  companyName,
  jobPosition,
  title,
  questionCount,
  date,
  isSelected = false,
  onClick,
  children,
}: DocumentProps) => {
  return (
    <div
      className={`inline-flex cursor-pointer flex-col items-start justify-start self-stretch px-3 transition-opacity ${
        isSelected ? 'opacity-100' : 'opacity-100' // 선택 여부에 따른 스타일 필요 시 수정 (기존 코드는 opacity 조절이 있었음)
      }`}
      onClick={onClick}
    >
      <div className='flex flex-col items-start justify-start gap-1 self-stretch border-b border-gray-100 px-3 py-5'>
        {/* 상단: 기업명, 직무명 칩 + 아이콘 */}

        <div className='inline-flex items-center justify-between self-stretch pr-1'>
          <div className='flex flex-1 items-center justify-start gap-1'>
            <div className='flex items-center justify-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5'>
              <div className='justify-start text-xs leading-4 font-medium text-blue-600'>
                {companyName}
              </div>
            </div>

            <div className='flex items-center justify-center gap-1 rounded-xl bg-gray-50 px-3 py-1.5'>
              <div className='justify-start text-xs leading-4 font-medium text-gray-600'>
                {jobPosition}
              </div>
            </div>
          </div>

          {children}
        </div>

        {/* 하단: 제목 + 문항수 + 날짜 */}

        <div className='flex flex-col items-start justify-start gap-0.5 self-stretch'>
          <div className='line-clamp-1 justify-start self-stretch text-lg leading-7 font-bold text-gray-950'>
            {title}
          </div>

          <div className='inline-flex items-start justify-start gap-1'>
            <div className='text-Semantic-text-label-400 justify-start text-xs leading-5 font-normal'>
              총 {questionCount}문항 · {date}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Document;
