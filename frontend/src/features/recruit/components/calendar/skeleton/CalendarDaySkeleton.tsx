import SkeletonBox from '@/features/recruit/components/calendar/skeleton/SkeletonBox';

interface Props {
  tagCount?: number; // 스켈레톤에서 보여줄 가짜 태그 개수 (기본값 2개 추천)
}

const CalendarDaySkeleton = ({ tagCount = 2 }: Props) => {
  return (
    // CalendarDay와 동일한 외부 컨테이너 스타일 (이전 w-32 h-32 p-[5px])
    <div className='inline-flex h-28 w-28 flex-col items-start justify-start gap-3.5 rounded-lg border border-transparent p-1'>
      {/* 날짜 표시 영역 (상단) */}
      <div className='inline-flex items-center justify-start self-stretch'>
        <div className='flex flex-1 items-center justify-between gap-2.5'>
          {/* 날짜 원형 스켈레톤 (h-10 w-10) */}
          <SkeletonBox className='h-10 w-10 rounded-md' />

          {/* 공고 개수 표시 스켈레톤 (작은 박스) */}
          <SkeletonBox className='h-3 w-4 rounded' />
        </div>
      </div>

      {/* 공고 리스트 영역 (하단) */}
      <div className='flex w-full flex-col gap-1 overflow-hidden'>
        {Array.from({ length: tagCount }).map((_, index) => (
          // CalendarDay의 아이템 높이와 비슷하게 설정
          <SkeletonBox key={index} className='h-5 w-full rounded' />
        ))}
      </div>
    </div>
  );
};

export default CalendarDaySkeleton;
