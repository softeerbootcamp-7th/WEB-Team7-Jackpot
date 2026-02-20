import type { ReactNode } from 'react';
import { NavLink, useParams } from 'react-router';

import type { QuestionItem } from '@/features/library/types';

interface Props {
  content: QuestionItem;
  rightAction?: ReactNode; // [로직 추가] 버튼을 받을 구멍
}

const QnADocument = ({ content, rightAction }: Props) => {
  const { qnAName, qnAId } = useParams<{ qnAName: string; qnAId?: string }>();
  const { id, companyName, jobPosition, applySeason, question, answer } =
    content;

  const isSelected = !qnAId || Number(qnAId) === id;

  return (
    <NavLink
      to={`/library/qna/${qnAName}/${id}`}
      // [변경 1] DocumentItem과 동일한 Hover 색상 및 투명도 인터랙션 적용
      // 기존 UI 구조(w-full 등)는 건드리지 않고, group과 hover 관련 클래스만 추가했습니다.
      className={`group w-full cursor-pointer transition-opacity hover:bg-gray-50 ${
        isSelected ? 'opacity-100' : 'opacity-30 hover:opacity-100'
      }`}
    >
      {/* [유지] 기존의 w-96 및 패딩 등 UI 구조 절대 변경 없음 */}
      <div className='inline-flex w-96 flex-col items-start justify-start gap-3 border-b border-gray-100 px-3 py-5'>
        {/* 상단 라인 */}
        <div className='inline-flex items-center justify-between self-stretch'>
          <div className='flex flex-1 items-center justify-start gap-1'>
            {/* 기업명 뱃지 (Blue) - 기존 유지 */}
            <div className='flex items-center justify-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5'>
              <div className='justify-start text-xs leading-4 font-medium text-blue-600'>
                {companyName}
              </div>
            </div>

            {/* [변경 2] 직무 뱃지 색상 통일 (bg-gray-50 -> bg-gray-100) */}
            <div className='flex items-center justify-center gap-1 rounded-xl bg-gray-100 px-3 py-1.5'>
              <div className='justify-start text-xs leading-4 font-medium text-gray-600'>
                {jobPosition}
              </div>
            </div>

            {/* [변경 3] 시즌 뱃지 색상 통일 (bg-gray-50 -> bg-gray-100) */}
            {applySeason && (
              <div className='flex items-center justify-center gap-1 rounded-xl bg-gray-100 px-3 py-1.5'>
                <div className='justify-start text-xs leading-4 font-medium text-gray-600'>
                  {applySeason}
                </div>
              </div>
            )}
          </div>

          {/* [로직 추가] rightAction이 들어오면 렌더링 (UI 구조에 영향 주지 않게 배치) */}
          {rightAction && (
            <div
              className='ml-2 flex flex-shrink-0 items-center'
              onClick={(e) => {
                e.stopPropagation(); // 버블링 방지
              }}
            >
              {rightAction}
            </div>
          )}
        </div>

        {/* 하단 내용 영역 (기존 UI 유지) */}
        <div className='flex flex-col items-start justify-start gap-1 self-stretch'>
          <div className='inline-flex items-center justify-start gap-1 self-stretch'>
            <div className='line-clamp-2 max-h-12 flex-1 justify-start text-lg leading-6 font-bold text-gray-950'>
              {question}
            </div>
          </div>
          <div className='text-caption-l line-clamp-2 max-h-10 justify-start self-stretch font-medium text-gray-600'>
            {answer}
          </div>
        </div>
      </div>
    </NavLink>
  );
};

export default QnADocument;
