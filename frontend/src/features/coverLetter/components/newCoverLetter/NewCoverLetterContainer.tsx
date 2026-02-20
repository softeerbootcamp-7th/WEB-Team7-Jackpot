import { useNavigate } from 'react-router';

import NewCoverLetterView from '@/features/coverLetter/components/newCoverLetter/NewCoverLetterView';
import { useCreateCoverLetter } from '@/features/recruit/hooks/queries/useCoverLetterMutation';
import { DEFAULT_DATA } from '@/shared/constants/createCoverLetter';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';
import { useRecruitForm } from '@/shared/hooks/useRecruitForm';
import { setStoredToastMessage } from '@/shared/utils/toastMessageStorage';

const NewCoverLetterContainer = () => {
  const navigate = useNavigate();
  const { mutateAsync: create } = useCreateCoverLetter(); // [박소민] 자기소개서 등록 후 해당 페이지로 이동해야 하므로 비동기로 처리
  const { showToast } = useToastMessageContext();

  const { formData, handleChange } = useRecruitForm(DEFAULT_DATA);

  // [박소민] TODO: 등록 완료 되었지만 자기소개서 랜딩 페이지에 반영안되는 버그 해결

  const handleSubmit = async () => {
    try {
      const res = await create(formData);

      if (res?.coverLetterId) {
        // 성공 시: 페이지 이동이 있으므로 '스토리지'에 저장
        setStoredToastMessage({
          message: '자기소개서가 저장되었습니다.',
          status: true,
        });

        navigate(`/cover-letter/edit/${res.coverLetterId}`);
      }
    } catch (error) {
      console.error('공고 저장 실패:', error);

      // 실패 시: 페이지 이동 안 함.
      showToast('저장에 실패했습니다. 잠시 후 다시 시도해주세요.', false);
    }
  };

  return (
    <NewCoverLetterView
      formData={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
    />
  );
};

export default NewCoverLetterContainer;
