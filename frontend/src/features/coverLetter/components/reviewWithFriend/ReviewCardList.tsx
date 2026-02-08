import ReviewCard from '@/features/coverLetter/components/reviewWithFriend/ReviewCard';

const ReviewCardList = () => {
  return (
    <div className='flex h-full flex-col overflow-y-auto'>
      <ReviewCard />
      <ReviewCard />
      <ReviewCard />
    </div>
  );
};

export default ReviewCardList;
