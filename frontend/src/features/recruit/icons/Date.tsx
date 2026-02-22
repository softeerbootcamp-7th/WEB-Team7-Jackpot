import { type SVGProps } from 'react';

export const DateIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='32'
      height='32'
      fill='none'
      viewBox='0 0 32 32'
      {...props}
    >
      <path
        fill='#8D91EC'
        d='M4 6.333a1 1 0 0 1 1-1h22.005a1 1 0 0 1 1 1v2.806a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z'
      />
      <path
        stroke='#8D91EC'
        d='M5.336 5.333h21.333V24a2.667 2.667 0 0 1-2.666 2.666h-16A2.667 2.667 0 0 1 5.336 24zm0 5.334h21.333'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2.667'
      />
      <path
        stroke='#7371E3'
        d='M21.336 4v2.667M10.664 4v2.667'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2.667'
      />
      <path
        fill='#E3E8FC'
        d='M4 12.678a1 1 0 0 1 1-1h22.005a1 1 0 0 1 1 1V26.98a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z'
      />
      <path
        stroke='#7371E3'
        d='M20.125 19.83h-8.243'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2.667'
      />
    </svg>
  );
};
