import { useMemo } from 'react';

import NewCoverLetterDetail from '@/features/coverLetter/components/newCoverLetter/NewCoverLetterDetail';
import { NewCoverLetterIcon } from '@/features/coverLetter/icons/NewCoverLetter';
import QuestionsSection from '@/shared/components/QuestionsSection';
import type { CreateCoverLetterRequest } from '@/shared/types/coverLetter';
import { isQuestionsValid } from '@/shared/utils/coverLetter';

// [박소민] TODO: RecruitFormView와 유사한 구조로 변경 예정, 우선은 디자인 시안에 맞춰 단일 컴포넌트로 구현
// [박소민] TODO: 카테고리 유효성 검사 추가
interface Props {
  formData: CreateCoverLetterRequest;
  onChange: <K extends keyof CreateCoverLetterRequest>(
    key: K,
    value: CreateCoverLetterRequest[K],
  ) => void;
  onSubmit: () => void;
}

const NewCoverLetterView = ({ formData, onChange, onSubmit }: Props) => {
  // 1. 유효성 검사 로직
  const isValid = useMemo(() => {
    const company = formData.companyName?.trim() || '';
    const job = formData.jobPosition?.trim() || '';
    const deadline = formData.deadline?.trim() || ''; // deadline도 안전하게 trim 추가
    const questions = formData.questions ?? [];

    return (
      company.length > 0 &&
      job.length > 0 &&
      deadline.length > 0 &&
      isQuestionsValid(questions)
    );
  }, [
    formData.companyName,
    formData.jobPosition,
    formData.deadline,
    formData.questions,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // 기본 제출 방지

    if (!isValid) return;

    onSubmit();
  };

  return (
    <div className='mb-23.5 flex flex-col items-start gap-10 border-l border-gray-100 px-8'>
      <div className='flex items-center justify-between self-stretch'>
        <div className='flex items-center justify-start gap-2'>
          <div className='m-auto h-8 w-8 overflow-hidden'>
            <NewCoverLetterIcon />
          </div>
          <div className='text-title-m justify-start font-bold text-gray-950'>
            새 자기소개서 등록
          </div>
        </div>
        <button
          type='submit'
          form='cover-letter-form'
          disabled={!isValid}
          className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg ${!isValid ? 'bg-gray-50' : 'bg-gray-900'} px-5 py-3`}
        >
          <div
            className={`text-title-s justify-start text-center font-bold ${!isValid ? 'text-gray-400' : 'text-white'}`}
          >
            등록 완료
          </div>
        </button>
      </div>
      <form
        id='cover-letter-form'
        onSubmit={handleSubmit}
        className='inline-flex h-full w-96 w-full flex-col items-center justify-between gap-7 py-6'
      >
        <NewCoverLetterDetail formData={formData} onUpdate={onChange} />
        <QuestionsSection
          questions={formData.questions ?? []}
          onQuestionsChange={(newQuestions) =>
            onChange('questions', newQuestions)
          }
        />
      </form>
    </div>
  );
};

export default NewCoverLetterView;
