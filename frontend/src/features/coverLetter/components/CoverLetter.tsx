import { useEffect, useRef, useState } from 'react';

import CoverLetterMenu from '@/features/coverLetter/components/CoverLetterMenu';
import type { CoverLetter as CoverLetterType } from '@/features/library/types';
import Pagination from '@/shared/components/Pagination';
import MoreVertIcon from '@/shared/icons/MoreVertIcon';
import type { QnA } from '@/shared/types/qna';

const mockCoverLetterQnaIds: Record<number, number[]> = {
  1: [1, 2, 3, 4],
};

const mockCoverLetter: CoverLetterType = {
  id: 1,
  applySeason: '2025년 상반기',
  companyName: '삼성전자',
  jobPosition: '개발자',
  questionCount: 4,
  modifiedAt: '2026-01-23T09:41:00Z',
};

const mockQnaDetailMap: Record<number, QnA> = {
  1: {
    qnaId: 1,
    question: '질문 1입니다',
    answer: '답변 1입니다\n두 번째 문단입니다.',
    answerSize: 1345,
    modifiedAt: '2026-02-12T18:00:00',
  },
  2: {
    qnaId: 2,
    question: '질문 2입니다',
    answer: '답변 2입니다',
    answerSize: 980,
    modifiedAt: '2026-02-11T12:30:00',
  },
  3: {
    qnaId: 3,
    question: '질문 3입니다',
    answer: '답변 3입니다',
    answerSize: 760,
    modifiedAt: '2026-02-10T09:10:00',
  },
  4: {
    qnaId: 4,
    question: '질문 4입니다',
    answer: '답변 4입니다',
    answerSize: 512,
    modifiedAt: '2026-02-09T08:00:00',
  },
};

interface CoverLetterProps {
  documentId: number;
  openReview: (value: boolean) => void;
  isReviewOpen: boolean;
}

const CoverLetter = ({
  documentId,
  openReview,
  isReviewOpen,
}: CoverLetterProps) => {
  // TODO: 실제 데이터로 교체 필요 (review의 hooks 로직 재활용)
  // TODO: 리뷰가 달린 영역 클릭시 필터링
  // TODO: 리뷰 클릭시 모달 오픈 (review의 hooks 로직 재활용)
  // TODO: 삭제하기 기능 구현
  // TODO: 리뷰 적용하기 클릭시 답변 영역에 반영
  // TODO: 리뷰 삭제하기 기능 구현
  // TODO: 본문 수정하기 기능 구현

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const qnaIds = mockCoverLetterQnaIds[documentId] ?? [];
  const qnaList = qnaIds.map((id) => mockQnaDetailMap[id]).filter(Boolean);

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQna = qnaList[currentIndex];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  if (!currentQna) return null;

  return (
    <div className='inline-flex w-[874px] flex-col gap-5 border-l border-gray-100 px-8 py-7'>
      <div className='flex justify-between'>
        <div className='flex gap-1'>
          <div className='rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600'>
            {mockCoverLetter.companyName}
          </div>
          <div className='rounded-xl bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600'>
            {mockCoverLetter.jobPosition}
          </div>
        </div>
        <div className='relative'>
          <button
            ref={buttonRef}
            type='button'
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className='cursor-pointer rounded-lg p-1'
            aria-label='더보기'
          >
            <MoreVertIcon />
          </button>

          {isMenuOpen && (
            <div ref={menuRef} className='absolute top-full right-0 z-50 mt-2'>
              <CoverLetterMenu
                documentId={documentId}
                openReview={openReview}
                isReviewOpen={isReviewOpen}
              />
            </div>
          )}
        </div>
      </div>

      <div className='flex flex-col gap-0.5'>
        <div className='line-clamp-1 text-xl leading-9 font-bold'>
          {mockCoverLetter.applySeason}
        </div>
        <div className='flex gap-1 text-sm text-gray-400'>
          <span>총 {qnaList.length}문항</span>
          <span>·</span>
          <span>
            {new Date(mockCoverLetter.modifiedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className='flex flex-col gap-3.5'>
        <div className='flex gap-3'>
          <div className='flex w-9 items-center justify-center rounded-xl bg-gray-50 px-3 py-1.5'>
            <span className='text-base font-bold text-gray-600'>
              {currentIndex + 1}
            </span>
          </div>
          <div className='flex-1 pt-1 text-lg font-bold text-gray-950'>
            {currentQna.question}
          </div>
        </div>

        <div className='pr-8 pl-12 text-base leading-7 whitespace-pre-wrap text-gray-800'>
          {currentQna.answer}
        </div>
      </div>

      <div className='inline-flex h-8 items-center justify-between gap-5 py-0.5'>
        <div className='flex gap-0.5 pl-12 text-base text-gray-400'>
          <span>{currentQna.answerSize.toLocaleString()}</span>
          <span>자</span>
        </div>

        <Pagination
          current={currentIndex}
          total={qnaList.length}
          onChange={setCurrentIndex}
          ariaLabel='문항'
        />
      </div>
    </div>
  );
};

export default CoverLetter;
