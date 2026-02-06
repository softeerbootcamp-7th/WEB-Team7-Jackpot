import { type SVGProps } from 'react';

export const EditIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='22'
      height='17'
      fill='none'
      viewBox='0 0 22 17'
      {...props}
    >
      <path
        stroke='#656565'
        d='M5.2 4.6h-3A1.2 1.2 0 0 0 1 5.8v4.8a1.2 1.2 0 0 0 1.2 1.2h3m4.2-7.2H19a1.2 1.2 0 0 1 1.2 1.2v4.8a1.2 1.2 0 0 1-1.2 1.2H9.4m-4.2 3.6V1M3.4 15.4H7'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
      />
    </svg>
  );
};
