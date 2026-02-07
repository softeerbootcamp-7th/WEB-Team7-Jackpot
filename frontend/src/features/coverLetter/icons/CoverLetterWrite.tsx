import { type SVGProps } from 'react';

export const CoverLetterWriteIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      fill='none'
      viewBox='0 0 24 24'
      {...props}
    >
      <g stroke='#5B4DD3' clipPath='url(#a)' strokeWidth='2'>
        <path
          d='M4 8h9m4 0h3m-9 8h9M4 16h3'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <circle cx='9' cy='16' r='2' />
        <circle cx='15' cy='8' r='2' />
      </g>
    </svg>
  );
};
