import { useNavigate, useParams } from 'react-router';

import LabelingResultHeader from '@/features/upload/components/LabelingResultHeader';
import LabelingResultItem from '@/features/upload/components/LabelingResultItem';

const LabelingResultSection = () => {
  const navigate = useNavigate();
  const { jobId, coverLetterIndex, qnAIndex } = useParams<{
    jobId: string;
    coverLetterIndex: string;
    qnAIndex: string;
  }>();

  // NaN || 0 -> 0 (비숫자 입력에 대한 방어 처리)
  const currentCoverLetterId: number = Number(coverLetterId) || 0;
  const currentQnAId: number = Number(qnAId) || 0;

  const handleNextStep = () => {
    navigate('/upload/complete', { replace: true });
  };

  const handleCoverLetterIdxChange = (newIdx: number) =>
    navigate(`/upload/labeling/${jobId}/${newIdx}/0`, { replace: true });

  const handleQnAIdxChange = (newIdx: number) =>
    navigate(`/upload/labeling/${jobId}/${currentCoverLetterIdx}/${newIdx}`, {
      replace: true,
    });

  return (
    <div className='flex flex-col gap-6'>
      <LabelingResultHeader nextStep={handleNextStep} />
      <LabelingResultItem
        tabState={currentCoverLetterId}
        setTabState={handleCoverLetterIdChange}
        qnAState={currentQnAId}
        setQnAState={handleQnAIdChange}
      />
    </div>
  );
};

export default LabelingResultSection;
