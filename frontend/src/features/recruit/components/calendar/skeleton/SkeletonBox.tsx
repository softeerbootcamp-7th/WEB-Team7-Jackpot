// 반짝이는 효과 컴포넌트
const SkeletonBox = ({ className = '' }: { className?: string }) => {
  return (
    <div
      className={`animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] ${className}`}
    />
  );
};

export default SkeletonBox;
