interface CoverLetterChipListProps {
  company: string;
  job: string;
}

const CoverLetterChipList = ({ company, job }: CoverLetterChipListProps) => {
  return (
    <div className='flex h-[2.5rem] shrink-0 items-center'>
      <div className='flex items-start gap-[0.25rem]'>
        <div className='flex items-center gap-[0.25rem] rounded-xl bg-blue-50 px-[0.75rem] py-[0.375rem]'>
          <div className='text-xs leading-4 font-medium text-blue-600'>
            {company}
          </div>
        </div>
        <div className='flex items-center gap-[0.25rem] rounded-xl bg-gray-50 px-[0.75rem] py-[0.375rem]'>
          <div className='text-xs leading-4 font-medium text-gray-600'>
            {job}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterChipList;
