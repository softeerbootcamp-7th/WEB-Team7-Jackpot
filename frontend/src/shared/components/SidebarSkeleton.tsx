const SidebarCardSkeleton = () => {
  return (
    <div className='flex flex-col items-start justify-start gap-3 self-stretch'>
      <div className='flex flex-col items-start justify-start self-stretch px-3'>
        <div className='flex w-96 flex-col items-start justify-start gap-3 border-b border-gray-100 px-3 py-5'>
          {/* 태그 영역 */}
          <div className='inline-flex items-center justify-between self-stretch pr-1'>
            <div className='flex items-center justify-start gap-1'>
              <div className='h-7 w-14 animate-pulse rounded-md bg-gray-100' />
              <div className='h-7 w-14 animate-pulse rounded-md bg-gray-100' />
              <div className='h-7 w-16 animate-pulse rounded-md bg-gray-100' />
            </div>
            <div className='h-6 w-6 animate-pulse rounded bg-gray-100' />
          </div>
          {/* 텍스트 영역 */}
          <div className='flex flex-col items-start justify-start gap-1 self-stretch'>
            <div className='h-6 w-full animate-pulse rounded bg-gray-100' />
            <div className='h-6 w-3/4 animate-pulse rounded bg-gray-100' />
            <div className='mt-1 h-4 w-full animate-pulse rounded bg-gray-100' />
            <div className='h-4 w-2/3 animate-pulse rounded bg-gray-100' />
          </div>
        </div>
      </div>
    </div>
  );
};

export const SidebarSkeleton = ({ len = 3 }: { len?: number }) => {
  return (
    <>
      {Array.from({ length: len }).map((_, idx) => (
        <SidebarCardSkeleton key={idx} />
      ))}
    </>
  );
};

export default SidebarSkeleton;
