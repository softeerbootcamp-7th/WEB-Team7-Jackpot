import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  SUMMARY_OVERVIEW_COMPLETE_SUFFIX,
  SUMMARY_OVERVIEW_COVER_LETTER_COUNT,
  SUMMARY_OVERVIEW_DEFAULT_USER,
  SUMMARY_OVERVIEW_QNA_ANSWERED,
  SUMMARY_OVERVIEW_QNA_COUNT,
  SUMMARY_OVERVIEW_SEASON,
  SUMMARY_OVERVIEW_SEASON_COUNT,
} from '@/features/home/constants';
import { useHomeCount } from '@/features/home/hooks/queries/useHomeQueries';
import BooksIcon from '@/features/home/icons/BooksIcon';
import ScrollIcon from '@/features/home/icons/ScrollIcon';
import ThoughtIcon from '@/features/home/icons/ThoughtIcon';

const SummaryOverview = () => {
  const { data } = useHomeCount();
  const { userInfo } = useAuth();

  if (
    data.coverLetterCount === 0 &&
    data.qnaCount === 0 &&
    data.seasonCoverLetterCount === 0
  ) {
    return null;
  }

  return (
    <div className='inline-flex w-full items-center justify-start gap-3'>
      <div className='flex h-28 flex-1 items-center justify-start gap-5 rounded-2xl px-10 py-5 outline outline-1 outline-offset-[-1px] outline-gray-100'>
        <div className='relative h-10 w-10'>
          <ThoughtIcon />
        </div>
        <div className='inline-flex flex-col items-start justify-start'>
          <div className='text-title-s font-medium text-gray-400'>
            {userInfo?.nickname || SUMMARY_OVERVIEW_DEFAULT_USER}
            {SUMMARY_OVERVIEW_COMPLETE_SUFFIX}
          </div>
          <div className='justify-start text-xl leading-9 font-bold text-gray-950'>
            {data.coverLetterCount}
            {SUMMARY_OVERVIEW_COVER_LETTER_COUNT}
          </div>
        </div>
      </div>
      <div className='flex h-28 flex-1 items-center justify-start gap-5 rounded-2xl px-10 py-5 outline outline-1 outline-offset-[-1px] outline-gray-100'>
        <div className='relative h-10 w-10'>
          <BooksIcon />
        </div>
        <div className='inline-flex flex-col items-start justify-start'>
          <div className='text-title-s justify-start font-medium text-gray-400'>
            {SUMMARY_OVERVIEW_QNA_ANSWERED}
          </div>
          <div className='justify-start text-xl leading-9 font-bold text-gray-950'>
            총 {data.qnaCount}
            {SUMMARY_OVERVIEW_QNA_COUNT}
          </div>
        </div>
      </div>
      <div className='flex h-28 flex-1 items-center justify-start gap-5 rounded-2xl px-10 py-5 outline outline-1 outline-offset-[-1px] outline-gray-100'>
        <div className='relative h-10 w-10'>
          <ScrollIcon />
        </div>
        <div className='inline-flex flex-col items-start justify-start'>
          <div className='text-title-s justify-start font-medium text-gray-400'>
            {SUMMARY_OVERVIEW_SEASON}
          </div>
          <div className='justify-start text-xl leading-9 font-bold text-gray-950'>
            총 {data.seasonCoverLetterCount}
            {SUMMARY_OVERVIEW_SEASON_COUNT}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryOverview;
