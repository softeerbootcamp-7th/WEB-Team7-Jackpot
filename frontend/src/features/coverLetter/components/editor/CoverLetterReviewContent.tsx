import { Suspense, useEffect } from 'react';

import { useOutletContext, useParams } from 'react-router';

import CoverLetterSection from '@/features/coverLetter/components/editor/CoverLetterSection';
import { useSharedLink } from '@/shared/hooks/useCoverLetterQueries';
import type { OutletContext } from '@/features/coverLetter/types/outletContext';
import SectionError from '@/shared/components/SectionError';
import SkeletonCard from '@/shared/components/SkeletonCard';

const CoverLetterReviewContent = () => {
  const { isReviewActive, setIsReviewActive } =
    useOutletContext<OutletContext>();
  const { coverLetterId } = useParams();
  const id = Number(coverLetterId);
  const isValidId = !!coverLetterId && !Number.isNaN(id);

  const { data: sharedLink } = useSharedLink(id, isValidId);

  useEffect(() => {
    if (sharedLink?.active !== undefined) {
      setIsReviewActive(sharedLink.active);
    }
  }, [sharedLink?.active, setIsReviewActive]);

  if (!isValidId) {
    return <SectionError text='잘못된 자기소개서 ID입니다' />;
  }

  return (
    <Suspense fallback={<SkeletonCard />}>
      <CoverLetterSection
        id={id}
        isReviewActive={isReviewActive}
        setIsReviewActive={setIsReviewActive}
      />
    </Suspense>
  );
};

export default CoverLetterReviewContent;
