import { Link } from 'react-router';

import EmptyState from '@/features/home/components/EmptyState';
import {
  EMPTY_COVER_LETTER_DESCRIPTION,
  EMPTY_COVER_LETTER_TITLE,
} from '@/features/home/constants';
import { useRecentCoverLetters } from '@/features/home/hooks/queries/useHomeQueries';
import CoverLetterOverview from '@/shared/components/CoverLetterOverview';
import * as SI from '@/shared/icons';

const LinkToCoverLetter = () => {
  return (
    <Link to={'/cover-letter'} aria-label='자기소개서 작성 페이지로 이동'>
      <SI.RightArrow />
    </Link>
  );
};

const HomeCoverLetterSection = () => {
  const { data } = useRecentCoverLetters(6);

  return (
    <>
      {data.coverLetters.length > 0 ? (
        <CoverLetterOverview
          button={<LinkToCoverLetter />}
          coverLetters={data.coverLetters}
          isHome
        />
      ) : (
        <EmptyState
          className='h-[20rem]'
          title={EMPTY_COVER_LETTER_TITLE}
          description={EMPTY_COVER_LETTER_DESCRIPTION}
          to='/cover-letter/new'
        />
      )}
    </>
  );
};

export default HomeCoverLetterSection;
