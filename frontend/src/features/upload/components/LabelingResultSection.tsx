import { useNavigate, useParams } from 'react-router';

import LabelingResultHeader from '@/features/upload/components/LabelingResultHeader';
import LabelingResultItem from '@/features/upload/components/LabelingResultItem';

const LabelingResultSection = () => {
  const navigate = useNavigate();
  const { coverLetterId, qnAId } = useParams<{
    coverLetterId: string;
    qnAId: string;
  }>();
  const currentCoverLetterId: number = coverLetterId
    ? Number(coverLetterId)
    : 0;
  const currentQnAId: number = qnAId ? Number(qnAId) : 0;

  const hanldeNextStep = () => {
    navigate('/upload/complete', { replace: true });
  };

  const handleCoverLetterIdChange = (newId: number) =>
    navigate(`/upload/labeling/${newId}/0`, { replace: true });

  const handleQnAIdChange = (newId: number) =>
    navigate(`/upload/labeling/${currentCoverLetterId}/${newId}`, {
      replace: true,
    });

  return (
    <div className='flex flex-col gap-6'>
      <LabelingResultHeader nextStep={hanldeNextStep} />
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
