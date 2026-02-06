import { type SVGProps } from 'react';

export const FolderIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='28'
      height='28'
      fill='none'
      viewBox='0 0 28 28'
      {...props}
    >
      <g
        clipPath='url(#a)'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2.333'
      >
        <path
          fill='#7371E3'
          stroke='#7371E3'
          d='M3.5 19.833v-14h8.167L14 8.166h10.5v11.667a2.333 2.333 0 0 1-2.333 2.333H5.833A2.333 2.333 0 0 1 3.5 19.833'
        />
        <path
          fill='#AEB7F3'
          stroke='#AEB7F3'
          d='M3.5 19.834V8.167h21v11.667a2.333 2.333 0 0 1-2.333 2.333H5.833A2.333 2.333 0 0 1 3.5 19.834'
        />
      </g>
    </svg>
  );
};
