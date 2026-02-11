import { useOutletContext, useParams } from 'react-router';
import { useLocation } from 'react-router';

import CoverLetterReviewContent from '@/features/coverLetter/components/CoverLetterReviewContent';
import ReviewSidebar from '@/features/coverLetter/components/reviewWithFriend/ReviewSidebar';
import {
  coverLetterContent,
  emptyCaseText,
} from '@/features/coverLetter/constants';
import useCoverLetterParams from '@/features/coverLetter/hooks/useCoverLetterParams';
import type { CoverLetterView } from '@/features/coverLetter/types';
import EmptyCase from '@/shared/components/EmptyCase';
import TabBar from '@/shared/components/TabBar';

const CoverLetterQnAFriendsPage = () => {
  const { coverLetterId } = useParams();
  const { actions } = useCoverLetterParams();
  const coverLetterIdNumber = coverLetterId ? Number(coverLetterId) : null;
  const location = useLocation();

  const currentTab =
    coverLetterContent.find((tab) => location.pathname.startsWith(tab.path))
      ?.name ?? ('COVERLETTER_WRITE' as CoverLetterView);

  const { isReviewActive, setIsReviewActive } = useOutletContext<{
    isReviewActive: boolean;
    setIsReviewActive: (v: boolean) => void;
  }>();

  return (
    <div className='flex min-h-0 w-full flex-1 flex-col'>
      <TabBar
        content={coverLetterContent}
        handleTabChange={actions.handleTabChange}
        currentTab={currentTab}
      />
      <div className='flex min-h-0 w-full flex-1 flex-row overflow-hidden'>
        <aside className='h-full w-[427px] flex-none overflow-y-auto'>
          <ReviewSidebar
            selectedDocumentId={coverLetterIdNumber}
            onSelectDocument={() => {}}
          />
        </aside>

        <main className='h-full min-h-0 min-w-0 flex-1 overflow-hidden'>
          {!coverLetterIdNumber ? (
            <EmptyCase {...emptyCaseText.edit} />
          ) : (
            <CoverLetterReviewContent
              key={coverLetterIdNumber}
              selectedDocumentId={coverLetterIdNumber!}
              isReviewActive={isReviewActive}
              setIsReviewActive={setIsReviewActive}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default CoverLetterQnAFriendsPage;
