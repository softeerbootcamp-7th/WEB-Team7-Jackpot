const SkeletonCard = () => {
  return (
    <div className='mx-auto w-full max-w-[680px] space-y-4 px-6 py-8'>
      {/* Buttons */}
      <div className='flex justify-between'>
        <div className='flex gap-4'>
          <div className='h-10 w-20 animate-pulse rounded-lg bg-gray-100' />
          <div className='h-10 w-20 animate-pulse rounded-lg bg-gray-100' />
        </div>
        <div className='h-10 w-24 animate-pulse rounded-lg bg-gray-100' />
      </div>

      {/* Title */}
      <div className='h-9 w-40 animate-pulse rounded-lg bg-gray-100' />

      {/* Meta */}
      <div className='h-5 w-96 animate-pulse rounded bg-gray-100' />

      {/* Content Box */}
      <div className='h-80 w-full animate-pulse rounded-lg bg-gray-100' />

      {/* Footer */}
      <div className='flex items-center justify-between'>
        <div className='h-5 w-16 animate-pulse rounded bg-gray-100' />
        <div className='h-8 w-8 animate-pulse rounded bg-gray-100' />
      </div>
    </div>
  );
};

export default SkeletonCard;
