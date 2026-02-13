const ActionButtons = ({
  reviewId,
  handleEditReview,
  handleDeleteReview,
}: {
  reviewId: number;
  handleEditReview: (index: number) => void;
  handleDeleteReview: (index: number) => void;
}) => (
  <div className='flex items-center gap-2'>
    <button
      type='button'
      className='rounded-xl px-3 py-1.5'
      onClick={() => handleDeleteReview(reviewId)}
    >
      <span className='text-body-s font-medium text-red-500'>삭제하기</span>
    </button>
    <button
      type='button'
      className='rounded-xl bg-gray-950 px-3 py-1.5'
      onClick={() => handleEditReview(reviewId)}
    >
      <span className='text-body-s font-bold text-white'>수정하기</span>
    </button>
  </div>
);

export default ActionButtons;
