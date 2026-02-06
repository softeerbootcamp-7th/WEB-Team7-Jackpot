import CoverLetterPreview from '@/features/home/components/CoverLetterPreview';
import CardIcon from '@/features/home/components/icons/CardIcon';
import RightArrow from '@/features/home/components/icons/RightArrow';

const previews = Array.from({ length: 6 });

const CoverLetterOverview = () => {
  return (
    <div className='w-[82.5rem] inline-flex flex-col justify-start items-start gap-6'>
      <div className='self-stretch inline-flex justify-between items-center'>
        <div className='flex justify-start items-center gap-2.5'>
          <div className='w-7 h-7 relative'>
            <CardIcon />
          </div>
          <div className='justify-start text-gray-950 text-xl font-bold leading-9'>
            작성 중인 자기소개서
          </div>
        </div>
        <RightArrow size='lg' />
      </div>
      <div className='w-[82.5rem] grid grid-cols-3 gap-3'>
        {previews.map((_, idx) => (
          <CoverLetterPreview key={idx} />
        ))}
      </div>
    </div>
  );
};

export default CoverLetterOverview;
