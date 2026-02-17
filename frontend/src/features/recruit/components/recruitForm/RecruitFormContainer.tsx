import { useEffect } from 'react';

import RecruitFormView from '@/features/recruit/components/recruitForm/RecruitFormView';
import { DEFAULT_DATA } from '@/features/recruit/constants';
import {
  useCreateCoverLetter,
  useUpdateCoverLetter,
} from '@/features/recruit/hooks/queries/useCoverLetterMutation';
import { useRecruitForm } from '@/features/recruit/hooks/useRecruitForm';
import { mapServerDataToFormData } from '@/features/recruit/utils';
import { useCoverLetter } from '@/shared/hooks/useCoverLetterQueries';

interface Props {
  recruitId?: number | null; // RecruitPage의 state(number | null)와 타입 일치
  onClose: () => void;
}

const RecruitFormContainer = ({ recruitId, onClose }: Props) => {
  // 1. 상세 데이터 조회 (recruitId가 있을 때만 enabled)
  const { data, isLoading } = useCoverLetter(recruitId || 0);

  // 2. 뮤테이션 훅
  const { mutate: create, isPending: isCreating } = useCreateCoverLetter();
  const { mutate: update, isPending: isUpdating } = useUpdateCoverLetter();

  // 3. 폼 훅 초기화
  const { formData, handleChange, setFormData } = useRecruitForm(DEFAULT_DATA);

  // 4. 서버 데이터가 로드되면 폼 상태 동기화
  useEffect(() => {
    if (recruitId && data && data.coverLetterId === recruitId) {
      const mappedData = mapServerDataToFormData(data);
      setFormData(mappedData);
    } else if (!recruitId) {
      // 신규 등록 모드라면 초기값으로 리셋
      setFormData(DEFAULT_DATA);
    }
  }, [recruitId, data, setFormData]);

  // 5. 로딩 처리 (데이터 패칭 중일 때 깜빡임 방지용 로더)
  if (recruitId && isLoading) {
    return (
      <div className='flex h-full items-center justify-center text-gray-400'>
        불러오는 중...
      </div>
    );
  }

  // 6. 제출 핸들러
  const handleSubmit = () => {
    const options = {
      onSuccess: onClose,
      onError: (error: Error) => {
        console.error('공고 저장 실패:', error);
        // TODO: 토스트 메시지 등 사용자 피드백 추가
      },
    };

    if (recruitId) {
      update({ coverLetterId: recruitId, ...formData }, options);
    } else {
      create(formData, options);
    }
  };

  return (
    <RecruitFormView
      mode={recruitId ? 'EDIT' : 'CREATE'}
      formData={formData}
      isSubmitting={isCreating || isUpdating}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
};

export default RecruitFormContainer;
