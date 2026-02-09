const CoverLetterOverviewSkeleton = ({ len = 6 }: { len?: number }) => {
  return (
    <div className='inline-flex w-full flex-col items-start justify-start gap-6'>
      <div className='grid w-full grid-cols-3 gap-3'>
        {Array.from({ length: len }).map((_, idx) => (
          <div
            key={idx}
            className='h-48 animate-pulse rounded-2xl bg-gray-100'
          />
        ))}
      </div>
    </div>
  );
};

export default CoverLetterOverviewSkeleton;
