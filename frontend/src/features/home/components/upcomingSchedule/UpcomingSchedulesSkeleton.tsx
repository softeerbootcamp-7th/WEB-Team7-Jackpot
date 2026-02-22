const UpcomingSchedulesSkeleton = () => {
  return (
    <div className='flex w-full flex-col gap-6'>
      <div className='flex gap-3'>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className='h-[270px] flex-1 animate-pulse rounded-2xl bg-gray-100'
          />
        ))}
      </div>
    </div>
  );
};

export default UpcomingSchedulesSkeleton;
