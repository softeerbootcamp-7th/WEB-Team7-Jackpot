import { useState } from 'react';

import { Outlet } from 'react-router';

import { coverLetterHeaderText } from '@/features/coverLetter/constants';
import ContentHeader from '@/shared/components/ContentHeader';

const CoverLetterLayout = () => {
  const [isReviewActive, setIsReviewActive] = useState(false);

  return (
    <div
      className={`flex h-[calc(100vh-6.25rem)] w-full min-w-[1700px] flex-col ${isReviewActive ? 'pl-75' : 'px-75'}`}
    >
      <ContentHeader {...coverLetterHeaderText} />
      <Outlet context={{ isReviewActive, setIsReviewActive }} />
    </div>
  );
};

export default CoverLetterLayout;
