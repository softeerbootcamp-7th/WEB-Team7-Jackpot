import { ReviewPageIcons } from '@/features/review/components/icons';

const ChipRow = ({
  hasEdit,
  hasComment,
}: {
  hasEdit: boolean;
  hasComment: boolean;
}) => (
  <div className='flex items-center gap-1.5'>
    {hasEdit && (
      <div className='flex items-center gap-1 rounded-full bg-red-50 px-2 py-[5px] pr-2.5'>
        <ReviewPageIcons.PaperChipIcon />
        <span className='text-xs leading-5 font-medium text-red-500'>수정</span>
      </div>
    )}
    {hasComment && (
      <div className='flex items-center gap-1 rounded-full bg-blue-50 px-2 py-[5px] pr-2.5'>
        <ReviewPageIcons.PenToolIcon />
        <span className='text-xs leading-5 font-medium text-blue-500'>
          코멘트
        </span>
      </div>
    )}
  </div>
);

export default ChipRow;
