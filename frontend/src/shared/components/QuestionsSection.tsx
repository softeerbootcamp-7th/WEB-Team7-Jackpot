import Question from '@/shared/components/Question';
import { PlusIcon } from '@/shared/icons/Plus';
import type { CoverLetterQuestion } from '@/shared/types/coverLetter';

interface Props {
  questions: CoverLetterQuestion[];
  onQuestionsChange: (newQuestions: CoverLetterQuestion[]) => void;
}

const QuestionsSection = ({ questions, onQuestionsChange }: Props) => {
  const addQuestion = () => {
    const newQuestion: CoverLetterQuestion = {
      question: '',
      category: '',
    };
    onQuestionsChange([...questions, newQuestion]);
  };

  const removeQuestion = (indexToRemove: number) => {
    const nextQuestions = questions.filter((_, idx) => idx !== indexToRemove);
    onQuestionsChange(nextQuestions);
  };

  // key의 타입을 keyof CoverLetterQuestion으로
  const updateQuestion = (
    index: number,
    key: keyof CoverLetterQuestion,
    value: string,
  ) => {
    const nextQuestions = [...questions];
    nextQuestions[index] = { ...nextQuestions[index], [key]: value };
    onQuestionsChange(nextQuestions);
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

      {questions.map((q, index) => (
        <Question
          key={index}
          displayIndex={index + 1}
          data={q}
          onRemove={() => removeQuestion(index)}
          onChange={(key: keyof CoverLetterQuestion, val: string) =>
            updateQuestion(index, key, val)
          }
        />
      ))}

      <button
        type='button'
        onClick={addQuestion}
        className='inline-flex cursor-pointer items-center justify-center gap-1.5 self-stretch rounded-lg py-3 pr-5 pl-4 outline outline-1 outline-offset-[-1px] outline-gray-100 transition-colors hover:bg-gray-50'
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
