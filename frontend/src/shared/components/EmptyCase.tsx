export interface EmptyCaseProps {
  title: string;
  content: string;
}

const EmptyCase = ({ title, content }: EmptyCaseProps) => {
  return (
    <div className='mx-auto flex h-140 w-140 flex-col items-center justify-center gap-3 bg-[url(/images/Circles.png)] bg-cover bg-center'>
      <div className='justify-start self-stretch pt-25 text-center text-3xl leading-9 font-bold whitespace-pre-wrap text-gray-600'>
        {title}
      </div>
      <div className='text-title-s self-stretch text-center font-normal whitespace-pre-wrap text-gray-400'>
        {content}
      </div>
      <img className='' src='/images/EmptyFiles.png' alt='Empty Files' />
    </div>
  );
};

export default EmptyCase;
