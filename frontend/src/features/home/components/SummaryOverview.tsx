import BooksIcon from '@/features/home/components/icons/BooksIcon';
import ScrollIcon from '@/features/home/components/icons/ScrollIcon';
import ThoughtIcon from '@/features/home/components/icons/ThoughtIcon';

interface SummaryType {
  coverLetterCnt: number;
  QnACnt: number;
  applicationCount: number;
}

const mockSummary: SummaryType = {
  coverLetterCnt: 0,
  QnACnt: 0,
  applicationCount: 0,
};

const SummaryOverview = () => {
  return (
    <div className='inline-flex w-full items-center justify-start gap-3'>
      <div className='flex h-28 flex-1 items-center justify-start gap-5 rounded-2xl px-10 py-5 outline outline-1 outline-offset-[-1px] outline-gray-100'>
        <div className='relative h-10 w-10'>
          <ThoughtIcon />
        </div>
        <div className='inline-flex flex-col items-start justify-start'>
          <div className='justify-start text-lg leading-7 font-medium text-gray-400'>
            졸린 경민님은 지금까지
          </div>
          <div className='justify-start text-xl leading-9 font-bold text-gray-950'>
            {mockSummary.coverLetterCnt}장의 자기소개서를 완성했어요
          </div>
        </div>
      </div>
      <div className='flex h-28 flex-1 items-center justify-start gap-5 rounded-2xl px-10 py-5 outline outline-1 outline-offset-[-1px] outline-gray-100'>
        <div className='relative h-10 w-10'>
          <BooksIcon />
        </div>
        <div className='inline-flex flex-col items-start justify-start'>
          <div className='justify-start text-lg leading-7 font-medium text-gray-400'>
            끝까지 작성을 마친 답변들은
          </div>
          <div className='justify-start text-xl leading-9 font-bold text-gray-950'>
            총 {mockSummary.QnACnt}문항이에요
          </div>
        </div>
      </div>
      <div className='flex h-28 flex-1 items-center justify-start gap-5 rounded-2xl px-10 py-5 outline outline-1 outline-offset-[-1px] outline-gray-100'>
        <div className='relative h-10 w-10'>
          <ScrollIcon />
        </div>
        <div className='inline-flex flex-col items-start justify-start'>
          <div className='justify-start text-lg leading-7 font-medium text-gray-400'>
            이번 시즌에는
          </div>
          <div className='justify-start text-xl leading-9 font-bold text-gray-950'>
            총 {mockSummary.applicationCount}개의 공고에 지원했어요
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryOverview;
