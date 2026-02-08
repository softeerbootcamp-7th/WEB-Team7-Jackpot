import LinkAngled from '@/features/coverLetter/icons/LinkAngled';
import ToggleIcon from '@/features/coverLetter/icons/ToggleIcon';
import TrashIcon from '@/features/coverLetter/icons/TrashIcon';

const CoverLetterMenu = ({
  documentId,
  openReview,
  isReviewOpen,
}: {
  documentId: number;
  openReview: (value: boolean) => void;
  isReviewOpen: boolean;
}) => {
  return (
    <div className='w-48 rounded-md bg-white p-2 shadow-[0px_4px_20px_0px_rgba(41,41,41,0.12)]'>
      <button
        type='button'
        className='flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl px-3'
      >
        <TrashIcon />
        <span className='text-base font-semibold text-red-600'>삭제하기</span>
      </button>

      {isReviewOpen && (
        <button
          type='button'
          onClick={() => {
            const url = `${import.meta.env.VITE_SERVICE_BASE_URL || window.location.origin}/review/${documentId}`;

            navigator.clipboard
              .writeText(url)
              .then(() => {
                // TODO: 나중에 토스트로 교체 가능
                alert('첨삭 링크가 복사되었습니다.');
              })
              .catch(() => {
                // TODO: 토스트로 교체 시 에러 메시지도 함께 처리
                alert('링크 복사에 실패했습니다. 직접 복사해주세요: ' + url);
              });
          }}
          className='flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl px-3'
        >
          <LinkAngled />
          <span className='text-base font-semibold text-zinc-800'>
            첨삭 링크 복사
          </span>
        </button>
      )}

      <button
        type='button'
        onClick={() => openReview(!isReviewOpen)}
        className='flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl px-3'
      >
        <ToggleIcon />
        <span className='text-base font-semibold text-zinc-800'>
          첨삭 링크 {isReviewOpen ? '비활성화' : '활성화'}
        </span>
      </button>
    </div>
  );
};

export default CoverLetterMenu;
