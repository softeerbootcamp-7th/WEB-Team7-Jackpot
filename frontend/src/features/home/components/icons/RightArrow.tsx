interface RightArrowProps {
  size?: 'sm' | 'lg';
  className?: string;
}

const RightArrow = ({ size = 'lg', className = '' }: RightArrowProps) => {
  const isLarge = size === 'lg';
  const sizeClass = isLarge ? 'w-8 h-8' : 'w-6 h-6';
  const colorClass = isLarge ? 'text-gray-400' : 'text-gray-300';
  const strokeWidth = isLarge ? '2' : '1.5';

  return (
    <svg
      className={`${sizeClass} ${colorClass} ${className}`}
      viewBox={isLarge ? '0 0 32 32' : '0 0 24 24'}
      fill='none'
      aria-hidden='true'
      focusable='false'
    >
      <path
        d={isLarge ? 'M12 10L18 16L12 22' : 'M10 8L14 12L10 16'}
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
};

export default RightArrow;
