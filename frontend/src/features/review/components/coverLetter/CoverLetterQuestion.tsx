interface CoverLetterQuestionProps {
  index: number;
  question: string;
}

const CoverLetterQuestion = ({ index, question }: CoverLetterQuestionProps) => {
  return (
    <div className='flex w-full shrink-0 items-start gap-[0.75rem]'>
      <div className='flex w-[2.25rem] shrink-0 items-center rounded-xl bg-gray-50 px-[0.75rem] py-[0.375rem]'>
        <div className='text-body-m w-full text-center font-bold text-gray-600'>
          {index}
        </div>
      </div>
      <div className='min-w-0 flex-1 pt-[0.25rem]'>
        <div className='text-title-s font-bold text-gray-950'>{question}</div>
      </div>
    </div>
  );
};

export default CoverLetterQuestion;
