import * as CI from '@/features/coverLetter/icons';
import * as SI from '@/shared/icons';

type SaveProps =
  | { autoSave: true; onSave?: never; isPending?: never }
  | { autoSave?: false; onSave?: () => void; isPending?: boolean };

type CoverLetterToolbarProps = {
  companyName: string;
  jobPosition: string;
  isReviewActive: boolean;
  onToggleReview: () => void;
  onCopyLink: () => void;
  onDelete: () => void;
} & SaveProps;

const CoverLetterToolbar = ({
  companyName,
  jobPosition,
  isReviewActive,
  isPending,
  onToggleReview,
  onCopyLink,
  onSave,
  onDelete,
  autoSave,
}: CoverLetterToolbarProps) => {
  const isDisabled = isPending || !onSave;

  return (
    <div className='flex flex-shrink-0 items-center justify-between'>
      <div className='flex gap-1'>
        <div className='flex items-center justify-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5'>
          <div className='justify-start text-xs leading-4 font-medium text-blue-600'>
            {companyName}
          </div>
        </div>
        <div className='flex items-center justify-center gap-1 rounded-xl bg-gray-50 px-3 py-1.5'>
          <div className='justify-start text-xs leading-4 font-medium text-gray-600'>
            {jobPosition}
          </div>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <button
          type='button'
          onClick={onToggleReview}
          className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
            isReviewActive
              ? 'border-gray-800 bg-gray-800 text-white'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <SI.ReviewMessageIcon className='h-5 w-5' />
          <span>{isReviewActive ? '첨삭 비활성화' : '첨삭 활성화'}</span>
        </button>

        <button
          type='button'
          onClick={onCopyLink}
          disabled={!isReviewActive}
          className={`flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium transition-colors ${
            isReviewActive
              ? 'cursor-pointer text-gray-700 hover:bg-gray-50'
              : 'cursor-not-allowed text-gray-400 opacity-50'
          }`}
          aria-label='첨삭 링크 복사'
        >
          <CI.LinkAngled />
          <span>링크 복사</span>
        </button>

        {autoSave ? (
          <div className='flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-1.5 text-sm font-medium text-green-600'>
            <div className='h-2 w-2 animate-pulse rounded-full bg-green-500' />
            <span>실시간 저장 중</span>
          </div>
        ) : (
          <button
            type='button'
            onClick={onSave}
            disabled={isDisabled}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-sm font-bold text-white transition-colors ${
              isDisabled
                ? 'cursor-not-allowed bg-gray-400'
                : 'cursor-pointer bg-gray-800 hover:bg-gray-900'
            }`}
          >
            <SI.SaveCheckIcon />
            <span>{isPending ? '저장 중...' : '저장하기'}</span>
          </button>
        )}

        <button
          type='button'
          onClick={onDelete}
          className='flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600'
        >
          <CI.TrashIcon />
          <span>삭제하기</span>
        </button>
      </div>
    </div>
  );
};

export default CoverLetterToolbar;
