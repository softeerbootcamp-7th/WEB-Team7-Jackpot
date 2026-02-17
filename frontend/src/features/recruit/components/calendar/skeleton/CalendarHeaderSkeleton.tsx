import SkeletonBox from '@/features/recruit/components/calendar/skeleton/SkeletonBox';

const CalendarHeaderSkeleton = () => {
  return (
    <div className='inline-flex items-center justify-center gap-14 self-stretch'>
      <div className='flex items-center justify-start gap-1'>
        <SkeletonBox className='h-6 w-8 rounded' />
      </div>
      <div className='flex items-center justify-start gap-5'>
        <SkeletonBox className='h-9 w-9 rounded-full' />
        <SkeletonBox className='h-8 w-36 rounded' />
        <SkeletonBox className='h-9 w-9 rounded-full' />
      </div>
      <div className='flex items-center justify-start gap-1'>
        <SkeletonBox className='h-6 w-8 rounded' />
      </div>
    </div>
  );
};

export default CalendarHeaderSkeleton;
