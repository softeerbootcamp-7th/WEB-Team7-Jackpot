import type { ScrapItem } from '@/features/coverLetter/types/coverLetter';
import * as SI from '@/shared/icons';
import type { RecentCoverLetterType } from '@/shared/types/coverLetter';

interface CardProps {
  item: ScrapItem | RecentCoverLetterType;
  isScrap: boolean;
  deleteScrap: (id: number) => void;
  onClick: () => void;
}

const SidebarCard = ({ item, isScrap, deleteScrap, onClick }: CardProps) => {
  const scrapItem = isScrap ? (item as ScrapItem) : null;
  const libraryItem = !isScrap ? (item as RecentCoverLetterType) : null;

  const companyName = item.companyName;
  const jobPosition = item.jobPosition;

  const season = scrapItem
    ? scrapItem.applySeason
    : `${libraryItem?.applyYear} ${libraryItem?.applyHalf === 'FIRST_HALF' ? '상반기' : '하반기'}`;

  const title = scrapItem ? scrapItem.question : `${companyName} 자기소개서`;
  const description = scrapItem
    ? scrapItem.answer
    : `문항 ${libraryItem?.questionCount}개`;

  return (
    <div
      onClick={onClick}
      role='button'
      tabIndex={0}
      className='flex w-full cursor-pointer flex-col items-start justify-start gap-3 self-stretch rounded-lg transition-colors duration-200 outline-none hover:bg-gray-50'
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <div className='flex flex-col items-start justify-start self-stretch px-3'>
        <div className='flex w-full flex-col items-start justify-start gap-3 border-b border-gray-100 px-3 py-5'>
          <div className='inline-flex items-center justify-between self-stretch pr-1'>
            <div className='flex flex-1 items-center gap-1'>
              <Tag text={companyName} variant='blue' />
              <Tag text={jobPosition} variant='gray' />
              <Tag text={season} variant='gray' />
            </div>
            {isScrap && scrapItem && (
              <button
                type='button'
                className='inline-flex h-6 w-6 cursor-pointer items-center justify-center'
                onClick={(e) => {
                  e.stopPropagation();
                  deleteScrap(scrapItem.id);
                }}
              >
                <SI.DeleteIcon />
              </button>
            )}
          </div>
          <div className='flex flex-col gap-1 self-stretch'>
            <div className='line-clamp-2 text-lg font-bold text-gray-950'>
              {title}
            </div>
            <div className='line-clamp-2 text-sm font-medium text-gray-600'>
              {description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Tag = ({ text, variant }: { text: string; variant: 'blue' | 'gray' }) => (
  <div
    className={`flex items-center justify-center rounded-md px-3 py-1.5 ${
      variant === 'blue'
        ? 'bg-blue-50 text-blue-600'
        : 'bg-gray-50 text-gray-600'
    }`}
  >
    <span className='text-xs font-medium'>{text}</span>
  </div>
);

export default SidebarCard;
