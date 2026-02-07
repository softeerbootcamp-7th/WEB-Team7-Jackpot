import { type SVGProps } from 'react';

export const PlusIcon = (props: SVGProps<SVGSVGElement>) => {
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
        stroke='currentColor'
        d='M12 4.8v14.4m7.2-7.2H4.8'
        strokeLinecap='round'
        strokeWidth='2'
      />
    </svg>
  );
};
