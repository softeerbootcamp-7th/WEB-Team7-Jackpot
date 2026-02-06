import { type SVGProps } from 'react';

export const CompanyNameLibrary = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='22'
      height='22'
      fill='none'
      viewBox='0 0 22 22'
      {...props}
    >
      <path
        stroke='#5B4DD3'
        d='M10.6 10.69v-.09m8.963 8.963c-1.896 1.895-7.446-.58-12.396-5.53s-7.425-10.5-5.53-12.396c1.896-1.895 7.446.58 12.395 5.53 4.95 4.95 7.426 10.5 5.53 12.395Zm-17.925 0c-1.896-1.896.58-7.446 5.53-12.395 4.95-4.95 10.499-7.426 12.395-5.53s-.58 7.445-5.53 12.395-10.5 7.425-12.395 5.53Z'
        strokeLinecap='round'
        strokeWidth='2'
      />
    </svg>
  );
};
