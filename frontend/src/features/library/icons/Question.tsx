import { type SVGProps } from 'react';

export const QuestionIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      fill='none'
      viewBox='0 0 24 24'
      {...props}
    >
      <path
        fill='#AEB7F3'
        d='M14.099 2.005a1 1 0 0 1 .608.288l5 5A1 1 0 0 1 20 8v11a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V3a1 1 0 0 1 1-1h9zM14 8h3.586L14 4.414z'
      />
      <path
        stroke='#7371E3'
        d='M9 13.143h6m-6 4h6'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
      />
      <path
        fill='#7371E3'
        stroke='#7371E3'
        d='M14.344 7.81V2.85l4.961 4.961z'
        strokeLinejoin='round'
        strokeWidth='1.2'
      />
    </svg>
  );
};
