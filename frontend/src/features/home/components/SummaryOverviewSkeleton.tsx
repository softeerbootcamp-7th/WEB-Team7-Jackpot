const SummaryOverviewSkeleton = () => {
  return (
    <div className='inline-flex items-center justify-start gap-3'>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className='h-28 flex-1 animate-pulse rounded-2xl bg-gray-100 px-10 py-5'
        />
      ))}
    </div>
  );
};

export default SummaryOverviewSkeleton;
