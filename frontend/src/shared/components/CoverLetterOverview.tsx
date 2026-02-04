import RightArrow from '../icons/RightArrow';
import { WritingCoverLetterIcon } from '../icons/WritingCoverLetter';
import CoverLetterPreview from './CoverLetterPreview';

const previews = Array.from({ length: 6 });

const CoverLetterOverview = () => {
  return (
    <div className='inline-flex w-[82.5rem] flex-col items-start justify-start gap-6'>
      <div className='inline-flex items-center justify-between self-stretch'>
        <div className='flex items-center justify-start gap-2.5'>
          <div className='relative h-7 w-7'>
            <WritingCoverLetterIcon />
          </div>
          <div className='justify-start text-xl leading-9 font-bold text-gray-950'>
            작성 중인 자기소개서
          </div>
        </div>
        <RightArrow size='lg' />
      </div>
      <div className='grid w-[82.5rem] grid-cols-3 gap-3'>
        {previews.map((_, idx) => (
          <CoverLetterPreview key={idx} />
        ))}
      </div>
    </div>
  );
};

export default CoverLetterOverview;
