interface DropdownArrowProps {
  isOpen: boolean;
}

const DropdownArrow = ({ isOpen }: DropdownArrowProps) => {
  return (
    <svg
      width='12'
      height='7'
      viewBox='0 0 12 7'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      style={{
        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.3s ease-in-out',
      }}
    >
      <path
        d='M0.75 0.75L5.75081 5.33L10.75 0.75'
        stroke='#989898'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
};

export default DropdownArrow;
