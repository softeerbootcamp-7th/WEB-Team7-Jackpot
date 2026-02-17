import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHomeCount } from '@/features/home/hooks/useHomeQueries';
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
            {userInfo?.nickname || '사용자'}님은 지금까지
          </div>
          <div className='justify-start text-xl leading-9 font-bold text-gray-950'>
            {data.coverLetterCount}장의 자기소개서를 완성했어요
          </div>
        </div>
      </div>
      <div className='flex h-28 flex-1 items-center justify-start gap-5 rounded-2xl px-10 py-5 outline outline-1 outline-offset-[-1px] outline-gray-100'>
        <div className='relative h-10 w-10'>
          <BooksIcon />
        </div>
        <div className='inline-flex flex-col items-start justify-start'>
          <div className='text-title-s justify-start font-medium text-gray-400'>
            끝까지 작성을 마친 답변들은
          </div>
          <div className='justify-start text-xl leading-9 font-bold text-gray-950'>
            총 {data.qnaCount}문항이에요
          </div>
        </div>
      </div>
      <div className='flex h-28 flex-1 items-center justify-start gap-5 rounded-2xl px-10 py-5 outline outline-1 outline-offset-[-1px] outline-gray-100'>
        <div className='relative h-10 w-10'>
          <ScrollIcon />
        </div>
        <div className='inline-flex flex-col items-start justify-start'>
          <div className='text-title-s justify-start font-medium text-gray-400'>
            이번 시즌에는
          </div>
          <div className='justify-start text-xl leading-9 font-bold text-gray-950'>
            총 {data.seasonCoverLetterCount}개의 공고에 지원했어요
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryOverview;
