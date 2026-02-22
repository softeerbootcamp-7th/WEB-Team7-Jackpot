import { useCallback, useMemo, useState } from 'react';

import PaginationButton from '@/features/recruit/components/recruitForm/PaginationButton';
import RecruitDetail from '@/features/recruit/components/recruitForm/RecruitDetail';
import * as RCI from '@/features/recruit/icons';
import QuestionsSection from '@/shared/components/QuestionsSection';
import type { CreateCoverLetterRequest } from '@/shared/types/coverLetter';
import { isQuestionsValid } from '@/shared/utils/coverLetter';

interface Props {
  mode: 'CREATE' | 'EDIT';
  formData: CreateCoverLetterRequest;
  isSubmitting: boolean;
  onChange: <K extends keyof CreateCoverLetterRequest>(
    key: K,
    value: CreateCoverLetterRequest[K],
  ) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const RecruitFormView = ({
  mode,
  formData,
  isSubmitting,
  onChange,
  onSubmit,
  onClose,
}: Props) => {
  const [step, setStep] = useState(1);

  // 1. 유효성 검사 로직
  const isValid = useMemo(() => {
    if (step === 1) {
      const company = formData.companyName?.trim() || '';
      const job = formData.jobPosition?.trim() || '';
      const deadline = formData.deadline ? formData.deadline.trim() : '';
      return company.length > 0 && job.length > 0 && deadline.length > 0;
    } else {
      const questions = formData.questions ?? [];
      return isQuestionsValid(questions);
    }
  }, [
    step,
    formData.companyName,
    formData.jobPosition,
    formData.deadline,
    formData.questions,
  ]);

  const handlePrevStep = useCallback(() => {
    setStep((prev) => Math.max(1, prev - 1));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // 기본 제출 방지

    if (!isValid || isSubmitting) return;

    if (step === 1) {
      setStep(2);
      return;
    }

    // Step 2에서 제출 시 실행
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='inline-flex min-h-full w-full flex-col items-center justify-start gap-7 px-3 py-6'
    >
      {/* 헤더 영역 */}
      <div className='flex w-full flex-row items-center justify-between'>
        <div className='inline-flex flex-row items-center gap-2'>
          {mode === 'EDIT' ? <RCI.RecruitEditIcon /> : <RCI.NewRecruitIcon />}
          <h2 className='text-xl font-bold'>
            {mode === 'EDIT' ? '공고 수정' : '공고 등록'}
          </h2>
        </div>
        <button type='button' className='cursor-pointer' onClick={onClose}>
          <RCI.DeleteIcon />
        </button>
      </div>

      {/* Step 1: 상세 정보 입력 */}
      <div
        style={{ display: step === 1 ? 'block' : 'none', width: '100%' }}
        className='flex-1'
      >
        <RecruitDetail formData={formData} onUpdate={onChange} />
      </div>

      {/* Step 2: 질문 목록 입력 */}
      <div
        style={{ display: step === 2 ? 'block' : 'none', width: '100%' }}
        className='flex-1'
      >
        <QuestionsSection
          questions={formData.questions ?? []}
          onQuestionsChange={(newQuestions) =>
            onChange('questions', newQuestions)
          }
        />
      </div>

      {/* 하단 버튼 */}
      <div className='w-full'>
        <PaginationButton
          onClick={handlePrevStep}
          step={step}
          isSubmitting={isSubmitting}
          mode={mode}
          isValid={isValid}
        />
      </div>
    </form>
  );
};

export default RecruitFormView;
