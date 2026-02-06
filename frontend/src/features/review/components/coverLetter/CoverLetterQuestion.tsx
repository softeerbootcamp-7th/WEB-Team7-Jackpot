interface CoverLetterQuestionProps {
  index: number;
  question: string;
}

const CoverLetterQuestion = ({ index, question }: CoverLetterQuestionProps) => {
  return (
    <div className='shrink-0 w-full flex items-start gap-[0.75rem]'>
      <div className='w-[2.25rem] shrink-0 px-[0.75rem] py-[0.375rem] bg-gray-50 rounded-xl flex items-center'>
        <div className='w-full text-center text-gray-600 text-base font-bold leading-6'>
          {index}
        </div>
      </div>
      <div className='flex-1 min-w-0 pt-[0.25rem]'>
        <div className='text-gray-950 text-lg font-bold leading-7'>
          {question}
        </div>
      </div>
    </div>
  );
};

export default CoverLetterQuestion;
