const PaperChipIcon = ({
  active = true,
  title = 'paper chip',
}: {
  active?: boolean;
  title?: string;
}) => {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 20 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      role='img'
      aria-label={title}
    >
      <title>{title}</title>
      <path
        d='M10.1675 5.66628L7.34058 10.5627C6.78298 11.5284 7.11388 12.7634 8.07967 13.321C9.04545 13.8786 10.2804 13.5477 10.838 12.5819L13.7659 7.51064C14.8253 5.67565 14.1966 3.32926 12.3616 2.26983C10.5266 1.2104 8.18022 1.83911 7.12079 3.6741L3.99099 9.09509C2.42972 11.7993 3.35624 15.2571 6.06044 16.8184C8.76463 18.3797 12.2225 17.4531 13.7837 14.7489L16.8126 9.50282'
        stroke={active ? '#EF4444' : '#989898'}
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
};

export default PaperChipIcon;
