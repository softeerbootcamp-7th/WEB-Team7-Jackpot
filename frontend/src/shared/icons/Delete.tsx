import { type SVGProps } from 'react';

export const DeleteIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='12'
      height='12'
      fill='none'
      viewBox='0 0 12 12'
      {...props}
    >
      <title>삭제</title>
      <path
        stroke='#BDBDBD'
        d='m1 1 10 10M1 11 11 1'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
      />
    </svg>
  );
};
