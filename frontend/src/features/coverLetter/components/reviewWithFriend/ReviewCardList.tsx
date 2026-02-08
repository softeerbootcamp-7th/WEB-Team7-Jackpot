import ReviewCard from '@/features/coverLetter/components/reviewWithFriend/ReviewCard';

const ReviewCardList = () => {
  // TODO: 실제 데이터 연동 시 이 배열을 props 또는 hook에서 가져옴
  const reviews = [{ id: 1 }, { id: 2 }, { id: 3 }];

  return (
    <div className='flex h-full flex-col overflow-y-auto'>
      {reviews.map((review) => (
        <ReviewCard key={review.id} />
      ))}
    </div>
  );
};

export default ReviewCardList;
