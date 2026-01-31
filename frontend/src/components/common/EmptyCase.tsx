import type { EmptyCaseProps } from '@/types/common';

const EmptyCase = ({ title, content }: EmptyCaseProps) => {
  return (
    <div className='mx-auto w-140 h-140 flex flex-col justify-center items-center gap-3 bg-[url(./images/library/Circles.png)] bg-cover bg-center'>
      <div className='whitespace-pre-wrap pt-25 self-stretch justify-start text-center text-gray-600 text-3xl font-bold leading-9'>
        {title}
      </div>
      <div className='whitespace-pre-wrap self-stretch text-center text-gray-400 text-lg font-normal leading-7'>
        {content}
      </div>
      <img
        className=''
        src='./images/library/EmptyFiles.png'
        alt='Empty Files'
      />
    </div>
  );
};

export default EmptyCase;
