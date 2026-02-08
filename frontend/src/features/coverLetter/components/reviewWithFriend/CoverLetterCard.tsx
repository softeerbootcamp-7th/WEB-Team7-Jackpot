interface CoverLetterCardProps {
  isSelected?: boolean;
  isSelectStatus: boolean;
  onClick?: () => void;
  coverLetter: {
    id: number;
    applySeason: string;
    companyName: string;
    jobPosition: string;
    questionCount: number;
    modifiedAt: string;
  };
}

const CoverLetterCard = ({
  isSelected,
  isSelectStatus,
  onClick,
  coverLetter,
}: CoverLetterCardProps) => {
  return (
    <div
      role='button'
      tabIndex={0}
      className={`inline-flex w-96 cursor-pointer flex-col items-start justify-start gap-1 border-b border-gray-100 px-3 py-5 ${!isSelectStatus || isSelected ? '' : 'opacity-30'}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className='inline-flex items-center justify-between self-stretch pr-1'>
        <div className='flex flex-1 items-center justify-start gap-1'>
          <div className='flex items-center justify-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5'>
            <div className='justify-start text-xs leading-4 font-medium text-blue-600'>
              {coverLetter.companyName}
            </div>
          </div>
          <div
            data-속성-1='job chip'
            className='flex items-center justify-center gap-1 rounded-xl bg-gray-50 px-3 py-1.5'
          >
            <div className='justify-start text-xs leading-4 font-medium text-gray-600'>
              {coverLetter.applySeason}
            </div>
          </div>
        </div>
      </div>
      <div className='flex flex-col items-start justify-start gap-0.5 self-stretch'>
        <div className='line-clamp-1 justify-start self-stretch text-lg leading-7 font-bold text-zinc-800'>
          {`${coverLetter.companyName} - ${coverLetter.jobPosition}`}
        </div>
        <div className='inline-flex items-start justify-start gap-1'>
          <div className='justify-start text-xs leading-5 font-normal text-gray-400'>
            총 {coverLetter.questionCount}문항
          </div>
          <div className='justify-start text-sm leading-5 font-normal text-gray-400'>
            ·
          </div>
          <div className='text-xs leading-5 font-normal text-gray-400'>
            {(() => {
              const date = new Date(coverLetter.modifiedAt);
              return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterCard;
