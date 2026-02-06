import type { PaginationButtonIconProps } from '@/features/upload/types/upload';

const LeftPaginationButtonIcon = ({ color }: PaginationButtonIconProps) => {
  return (
    <svg
      width='9'
      height='10'
      viewBox='0 0 9 10'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M0.673078 3.67977C-0.224358 4.1979 -0.22436 5.49324 0.673076 6.01138L6.73077 9.50879C7.6282 10.0269 8.75 9.37925 8.75 8.34298L8.75 1.34816C8.75 0.311893 7.62821 -0.335777 6.73077 0.182358L0.673078 3.67977Z'
        fill={color}
      />
    </svg>
  );
};
export default LeftPaginationButtonIcon;
