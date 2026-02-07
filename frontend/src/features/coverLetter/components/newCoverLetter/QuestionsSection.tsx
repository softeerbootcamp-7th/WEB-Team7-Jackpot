import { useState } from 'react';

import Question from '@/features/coverLetter/components/newCoverLetter/Question';
import { PlusIcon } from '@/features/coverLetter/icons/Plus';

const QuestionsSection = () => {
  const [questionNum, setQuestionNum] = useState(1);

  const questionList = Array.from({ length: questionNum });

  const addQuestion = () => {
    setQuestionNum((num) => num + 1);
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

      {questionList.map((_, idx) => {
        return <Question key={idx} id={idx} />;
      })}

      <button
        type='button'
        onClick={addQuestion}
        className='inline-flex cursor-pointer items-center justify-center gap-1.5 self-stretch rounded-lg py-3 pr-5 pl-4 outline outline-1 outline-offset-[-1px] outline-gray-100'
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
