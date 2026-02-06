import CoverLetterSection from '@/features/review/components/coverLetter/CoverLetterSection';
import ReviewListSection from '@/features/review/components/review/ReviewListSection';
import useReviewState from '@/features/review/hooks/useReviewState';

const ReviewLayout = () => {
  const {
    coverLetter,
    currentPageIndex,
    currentQna,
    currentText,
    currentReviews,
    pages,
    editingReview,
    handleAddReview,
    handleUpdateReview,
    handlePageChange,
    handleEditReview,
    handleCancelEdit,
    handleDeleteReview,
  } = useReviewState();

  if (!currentQna) return <div>로딩 중...</div>;

  return (
    <>
      <main className='h-full'>
        <CoverLetterSection
          company={coverLetter.companyName}
          job={coverLetter.jobPosition}
          questionIndex={currentPageIndex + 1}
          question={currentQna.question}
          text={currentText}
          reviews={currentReviews}
          currentPage={currentPageIndex}
          totalPages={pages.length}
          editingReview={editingReview}
          onAddReview={handleAddReview}
          onUpdateReview={handleUpdateReview}
          onCancelEdit={handleCancelEdit}
          onPageChange={handlePageChange}
        />
      </main>
      <aside className='h-full w-[426px] flex-none'>
        <ReviewListSection
          reviews={currentReviews}
          editingReview={editingReview}
          onEditReview={handleEditReview}
          onDeleteReview={handleDeleteReview}
        />
      </aside>
    </>
  );
};

export default ReviewLayout;
