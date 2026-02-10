interface PaginationIconProps {
  size?: number;
  direction?: 'right' | 'left';
}

export const PaginationIcon = ({
  size = 28,
  direction = 'right',
}: PaginationIconProps) => {
  const transformStyle = direction === 'left' ? 'scaleX(-1)' : 'none';

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 28 28`}
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      style={{ transform: transformStyle, transformOrigin: 'center' }}
    >
      <rect width='28' height='28' rx='7' fill='#F0F2FD' />
      <path
        d='M17.7019 12.8342C18.5994 13.3524 18.5994 14.6477 17.7019 15.1658L11.6442 18.6633C10.7468 19.1814 9.625 18.5337 9.625 17.4974L9.625 10.5026C9.625 9.46636 10.7468 8.81869 11.6442 9.33682L17.7019 12.8342Z'
        fill='#CCD3F9'
      />
    </svg>
  );
};
