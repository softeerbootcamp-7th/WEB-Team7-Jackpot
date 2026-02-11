import { useOutletContext, useParams } from 'react-router';

import CoverLetterReviewContent from '@/features/coverLetter/components/CoverLetterReviewContent';

type OutletContext = {
  id: number;
  isReviewActive: boolean;
  setIsReviewActive: (v: boolean) => void;
};

const CoverLetterEditContent = () => {
  const { coverLetterId } = useParams();
  const { isReviewActive, setIsReviewActive } =
    useOutletContext<OutletContext>();
  const id = Number(coverLetterId);

  return (
    <CoverLetterReviewContent
      selectedDocumentId={id}
      isReviewActive={isReviewActive}
      setIsReviewActive={setIsReviewActive}
    />
  );
};

export default CoverLetterEditContent;
