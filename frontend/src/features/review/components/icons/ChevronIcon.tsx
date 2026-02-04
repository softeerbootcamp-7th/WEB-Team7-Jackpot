const ChevronIcon = ({
  isDetail,
  handleShowDetail,
}: {
  isDetail: boolean;
  handleShowDetail: () => void;
}) => (
  <svg
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className={`transition-transform duration-200 ${isDetail ? 'rotate-180' : ''}`}
    onClick={handleShowDetail}
  >
    <path
      d='M17 14L11.9992 9.42L7 14'
      stroke='#989898'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export default ChevronIcon;
