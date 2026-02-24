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
        <svg
          width='28'
          height='28'
          viewBox='0 0 28 28'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          aria-hidden='true'
        >
          <rect
            width='28'
            height='28'
            rx='7'
            transform='matrix(-1 0 0 1 28 0)'
            className='fill-purple-50 transition-colors group-disabled:fill-gray-100'
          />
          <path
            d='M10.2981 12.8342C9.40064 13.3524 9.40064 14.6477 10.2981 15.1658L16.3558 18.6633C17.2532 19.1814 18.375 18.5337 18.375 17.4974L18.375 10.5026C18.375 9.46636 17.2532 8.81869 16.3558 9.33682L10.2981 12.8342Z'
            className='fill-purple-200 transition-colors group-disabled:fill-gray-300'
          />
        </svg>
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
        <svg
          width='28'
          height='28'
          viewBox='0 0 28 28'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          aria-hidden='true'
        >
          <rect
            width='28'
            height='28'
            rx='7'
            className='fill-purple-50 transition-colors group-disabled:fill-gray-100'
          />
          <path
            d='M17.7019 12.8342C18.5994 13.3524 18.5994 14.6477 17.7019 15.1658L11.6442 18.6633C10.7468 19.1814 9.625 18.5337 9.625 17.4974L9.625 10.5026C9.625 9.46636 10.7468 8.81869 11.6442 9.33682L17.7019 12.8342Z'
            className='fill-purple-200 transition-colors group-disabled:fill-gray-300'
          />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
