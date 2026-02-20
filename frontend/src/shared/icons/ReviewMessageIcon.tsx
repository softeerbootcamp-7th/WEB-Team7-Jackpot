import { type SVGProps } from 'react';

export const ReviewMessageIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      fill='none'
      viewBox='0 0 20 20'
      aria-hidden='true'
      {...props}
    >
      <title>리뷰 메시지 아이콘</title>
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M17.5 12.5a1.667 1.667 0 0 1-1.667 1.667h-10L2.5 17.5v-13.333A1.667 1.667 0 0 1 4.167 2.5h11.666A1.667 1.667 0 0 1 17.5 4.167v8.333z'
      />
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M6 7.5h8M6 11h5'
      />
    </svg>
  );
};
