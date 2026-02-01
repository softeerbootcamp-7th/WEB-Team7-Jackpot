import BooksIcon from '@/components/home/icons/BooksIcon';
import ScrollIcon from '@/components/home/icons/ScrollIcon';
import ThoughtIcon from '@/components/home/icons/ThoughtIcon';

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
    <div className='w-[82.5rem] inline-flex justify-start items-center gap-3'>
      <div className='flex-1 h-28 px-10 py-5 rounded-2xl outline outline-1 outline-offset-[-1px] outline-gray-100 flex justify-start items-center gap-5'>
        <div className='w-10 h-10 relative'>
          <ThoughtIcon />
        </div>
        <div className='inline-flex flex-col justify-start items-start'>
          <div className='justify-start text-gray-400 text-lg font-medium  leading-7'>
            졸린 경민님은 지금까지
          </div>
          <div className='justify-start text-gray-950 text-xl font-bold  leading-9'>
            {mockSummary.coverLetterCnt}장의 자기소개서를 완성했어요
          </div>
        </div>
      </div>
      <div className='flex-1 h-28 px-10 py-5 rounded-2xl outline outline-1 outline-offset-[-1px] outline-gray-100 flex justify-start items-center gap-5'>
        <div className='w-10 h-10 relative'>
          <BooksIcon />
        </div>
        <div className='inline-flex flex-col justify-start items-start'>
          <div className='justify-start text-gray-400 text-lg font-medium  leading-7'>
            끝까지 작성을 마친 답변들은
          </div>
          <div className='justify-start text-gray-950 text-xl font-bold  leading-9'>
            총 {mockSummary.QnACnt}문항이에요
          </div>
        </div>
      </div>
      <div className='flex-1 h-28 px-10 py-5 rounded-2xl outline outline-1 outline-offset-[-1px] outline-gray-100 flex justify-start items-center gap-5'>
        <div className='w-10 h-10 relative'>
          <ScrollIcon />
        </div>
        <div className='inline-flex flex-col justify-start items-start'>
          <div className='justify-start text-gray-400 text-lg font-medium  leading-7'>
            이번 시즌에는
          </div>
          <div className='justify-start text-gray-950 text-xl font-bold  leading-9'>
            총 {mockSummary.applicationCount}개의 공고에 지원했어요
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryOverview;
