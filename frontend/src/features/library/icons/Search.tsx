import { type SVGProps } from 'react';

export const SearchIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='19'
      height='19'
      fill='none'
      viewBox='0 0 19 19'
      {...props}
    >
      <path
        stroke='#989898'
        d='m14.077 14.19 3.473 3.36m-1.12-8.96a7.84 7.84 0 1 1-15.68 0 7.84 7.84 0 0 1 15.68 0Z'
        strokeLinecap='round'
        strokeWidth='1.5'
      />
    </svg>
  );
};
