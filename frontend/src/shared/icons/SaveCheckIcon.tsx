import { type SVGProps } from 'react';

const SaveCheckIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
      {...props}
    >
      <title>저장 확인 아이콘</title>
      <path
        d='M13.3333 4L6 11.3333L2.66667 8'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
};

export default SaveCheckIcon;
