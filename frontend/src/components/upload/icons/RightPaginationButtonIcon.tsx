import type { PaginationButtonIconProps } from '@/types/upload';

const RightPaginationButtonIcon = ({ color }: PaginationButtonIconProps) => {
  return (
    <svg
      width='9'
      height='10'
      viewBox='0 0 9 10'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M8.07692 3.67977C8.97436 4.1979 8.97436 5.49324 8.07692 6.01138L2.01923 9.50879C1.1218 10.0269 -4.0998e-07 9.37925 -3.64683e-07 8.34298L-5.89301e-08 1.34816C-1.36333e-08 0.311893 1.12179 -0.335777 2.01923 0.182358L8.07692 3.67977Z'
        fill={color}
      />
    </svg>
  );
};

export default RightPaginationButtonIcon;
