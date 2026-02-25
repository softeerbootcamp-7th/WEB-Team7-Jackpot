import * as SI from '@/shared/icons/index';

interface PaginationProps {
  current: number;
  total: number;
  onChange: (index: number) => void;
  ariaLabel?: string;
  align?: 'start' | 'center' | 'end';
}

const alignMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
} as const;

const Pagination = ({
  current,
  total,
  onChange,
  ariaLabel = '페이지',
  align = 'center',
}: PaginationProps) => {
  const isFirst = current === 0;
  const isLast = total <= 1 || current === total - 1;

  return (
    <div
      className={`flex w-full items-center ${alignMap[align]} gap-[1.25rem]`}
    >
      <button
        type='button'
        onClick={() => onChange(current - 1)}
        disabled={isFirst}
        className='group cursor-pointer disabled:cursor-default disabled:opacity-40 disabled:hover:transform-none'
        aria-label={`이전 ${ariaLabel}`}
      >
        <SI.PaginationIcon direction='left' disabled={isFirst} />
      </button>

      <div className='flex items-center gap-2.5'>
        <div className='text-title-s line-clamp-1 font-bold text-purple-500'>
          {current + 1}
        </div>
        <div className='text-title-s font-bold text-gray-400'>/</div>
        <div className='text-title-s line-clamp-1 font-bold text-gray-400'>
          {total}
        </div>
      </div>

      <button
        type='button'
        onClick={() => onChange(current + 1)}
        disabled={isLast}
        className='group cursor-pointer disabled:cursor-default disabled:opacity-40 disabled:hover:transform-none'
        aria-label={`다음 ${ariaLabel}`}
      >
        <SI.PaginationIcon direction='right' disabled={isLast} />
      </button>
    </div>
  );
};

export default Pagination;
