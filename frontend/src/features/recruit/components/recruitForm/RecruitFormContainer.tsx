import { useEffect } from 'react';

import RecruitFormView from '@/features/recruit/components/recruitForm/RecruitFormView';
import { useUpdateRecruit } from '@/features/recruit/hooks/queries/useCalendarQuery';
import { useUpdateCoverLetter } from '@/features/recruit/hooks/queries/useCoverLetterMutation';
import { DEFAULT_DATA } from '@/shared/constants/createCoverLetter';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';
import { useCreateCoverLetter } from '@/shared/hooks/useCoverLetterQueries';
import { useRecruitForm } from '@/shared/hooks/useRecruitForm';

interface Props {
  recruitId?: number | null;
  onClose: () => void;
}

const RecruitFormContainer = ({ recruitId, onClose }: Props) => {
  const { data, isLoading } = useUpdateRecruit(recruitId ?? 0);
  const { showToast } = useToastMessageContext();
  const { formData, handleChange, setFormData } = useRecruitForm(DEFAULT_DATA);

  const { mutateAsync: createCoverLetter, isPending: isCreating } =
    useCreateCoverLetter();
  const { mutateAsync: updateCoverLetter, isPending: isUpdating } =
    useUpdateCoverLetter();

  useEffect(() => {
    if (recruitId && data) {
      setFormData(data);
    } else if (!recruitId) {
      setFormData(DEFAULT_DATA);
    }
  }, [recruitId, data, setFormData]);

  // 5. 로딩 처리 (데이터 패칭 중일 때 깜빡임 방지용 로더)
  if (recruitId && isLoading) {
    return (
      <div className='flex h-full w-full items-center justify-center text-gray-400'>
        불러오는 중...
      </div>
    );
  }

  // 6. 제출 핸들러
  const handleSubmit = async () => {
    try {
      if (recruitId) {
        // 수정 모드
        const coverLetter = {
          coverLetterId: recruitId,
          companyName: formData.companyName,
          jobPosition: formData.jobPosition,
          applyYear: formData.applyYear,
          applyHalf: formData.applyHalf,
          deadline: formData.deadline,
        };
        const questions = (formData.questions ?? []).map((question) =>
          question.qnAId === undefined
            ? { ...question, qnAId: null }
            : question,
        );

        await updateCoverLetter({
          coverLetter,
          questions,
        });
        showToast('성공적으로 수정되었습니다.', true);
      } else {
        // 생성 모드
        await createCoverLetter(formData);
        showToast('새 공고가 등록되었습니다.', true);
      }

      onClose();
    } catch {
      showToast('저장에 실패했습니다. 다시 시도해주세요.', false);
    }
  };

  return (
    <div className='h-full w-full overflow-y-auto'>
      <RecruitFormView
        mode={recruitId ? 'EDIT' : 'CREATE'}
        formData={formData}
        isSubmitting={isCreating || isUpdating}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={onClose}
      />
    </div>
  );
};

export default RecruitFormContainer;
