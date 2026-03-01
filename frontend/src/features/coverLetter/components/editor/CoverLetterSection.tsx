import CoverLetterApiMode from '@/features/coverLetter/components/editor/CoverLetterApiMode';
import CoverLetterLiveMode from '@/features/coverLetter/components/editor/CoverLetterLiveMode';
import {
  useCoverLetterWithQnAIds,
  useSharedLink,
} from '@/shared/hooks/useCoverLetterQueries';

interface CoverLetterSectionProps {
  id: number;
  isReviewActive: boolean;
  setIsReviewActive: (v: boolean) => void;
}

const CoverLetterSection = ({
  id,
  isReviewActive,
  setIsReviewActive,
}: CoverLetterSectionProps) => {
  const { coverLetter, qnaIds } = useCoverLetterWithQnAIds(id);
  const { data: sharedLink, isLoading: isSharedLinkLoading } =
    useSharedLink(id);

  const isLive = sharedLink?.active ?? false;

  if (!coverLetter) {
    return null;
  }

  if (isSharedLinkLoading) {
    return null;
  }

  if (isLive && sharedLink?.shareLinkId) {
    return (
      <CoverLetterLiveMode
        shareId={sharedLink.shareLinkId}
        coverLetter={coverLetter}
        qnaIds={qnaIds}
        isReviewActive={isReviewActive}
        setIsReviewActive={setIsReviewActive}
      />
    );
  }

  return (
    <CoverLetterApiMode
      coverLetter={coverLetter}
      qnaIds={qnaIds}
      isReviewActive={isReviewActive}
      setIsReviewActive={setIsReviewActive}
    />
  );
};

export default CoverLetterSection;
