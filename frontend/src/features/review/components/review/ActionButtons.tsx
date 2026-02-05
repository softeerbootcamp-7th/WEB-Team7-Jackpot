const ActionButtons = ({
  reviewId,
  handleEditReview,
  handleDeleteReview,
}: {
  reviewId: string;
  handleEditReview: (index: string) => void;
  handleDeleteReview: (index: string) => void;
}) => (
  <div className='flex items-center gap-2'>
    <button
      type='button'
      className='rounded-xl px-3 py-1.5'
      onClick={() => handleDeleteReview(reviewId)}
    >
      <span className='text-sm leading-5 font-medium text-red-500'>
        삭제하기
      </span>
    </button>
    <button
      type='button'
      className='rounded-xl bg-gray-950 px-3 py-1.5'
      onClick={() => handleEditReview(reviewId)}
    >
      <span className='text-sm leading-5 font-bold text-white'>수정하기</span>
    </button>
  </div>
);

export default ActionButtons;
