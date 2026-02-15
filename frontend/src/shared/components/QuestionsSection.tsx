import { useState } from 'react';

import Question from '@/features/coverLetter/components/newCoverLetter/Question';
import { PlusIcon } from '@/shared/icons/Plus';

const QuestionsSection = () => {
  // 단순 숫자가 아니라 ID 배열로 관리 (삭제나 순서 변경 대비)
  const [questionIds, setQuestionIds] = useState<number[]>([1]);

  const addQuestion = () => {
    setQuestionIds((prev) => {
      const nextId = prev.length > 0 ? Math.max(...prev) + 1 : 1;
      return [...prev, nextId];
    });
  };

  // (선택 사항) 삭제 기능이 필요하다면
  const removeQuestion = (idToRemove: number) => {
    setQuestionIds((prev) => prev.filter((id) => id !== idToRemove));
  };

  return (
    <div className='flex flex-col items-start justify-start gap-4 self-stretch'>
      <div className='flex flex-col items-start justify-start gap-3 self-stretch'>
        <div className='inline-flex items-start justify-start gap-3 self-stretch'>
          <div className='flex flex-1 items-center justify-start gap-0.5'>
            <div className='text-title-s justify-start font-bold text-gray-950'>
              자기소개서 질문
            </div>
            <div className='text-title-s justify-start font-bold text-red-600'>
              *
            </div>
          </div>
        </div>
      </div>

      {/* 배열을 순회하며 Question 렌더링 */}
      {questionIds.map((id, index) => (
        <Question
          key={id} // 리액트 내부 관리용 ID
          displayIndex={index + 1} // 화면에 보여질 번호 (1, 2, 3...)
          onRemove={() => removeQuestion(id)}
          // 에러가 사라져야 합니다.
        />
      ))}

      <button
        type='button'
        onClick={addQuestion}
        className='inline-flex cursor-pointer items-center justify-center gap-1.5 self-stretch rounded-lg py-3 pr-5 pl-4 outline outline-1 outline-offset-[-1px] outline-gray-100 hover:bg-gray-50'
      >
        <div className='relative h-6 w-6'>
          <PlusIcon className='text-gray-300' />
        </div>
        <div className='text-body-m justify-start text-center font-bold text-gray-300'>
          새 문항 등록하기
        </div>
      </button>
    </div>
  );
};

export default QuestionsSection;
