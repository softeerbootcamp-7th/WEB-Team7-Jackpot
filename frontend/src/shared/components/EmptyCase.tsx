export interface EmptyCaseProps {
  title: string;
  content: string;
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  className?: string;
}

const sizeClasses = {
  small: 'h-96 w-96',
  medium: 'h-140 w-140',
  large: 'h-180 w-180',
};

const titleClasses = {
  small: 'text-title-m',
  medium: 'text-title-l',
  large: 'text-title-xl',
};

const contentClasses = {
  small: 'text-title-xs',
  medium: 'text-title-s',
  large: 'text-title-m',
};

const imageClasses = {
  small: 'pt-5',
  medium: 'pt-0',
  large: 'pt-20',
};

const EmptyCase = ({
  title,
  content,
  size = 'medium',
  icon,
  className = '',
}: EmptyCaseProps) => {
  return (
    <div
      className={`mx-auto inline-flex ${sizeClasses[size]} flex-col items-center justify-center gap-3 bg-[url(/images/Circles.png)] bg-cover bg-center ${className}`}
    >
      {/* pt-25 삭제 */}
      <div
        className={`${titleClasses[size]} justify-start self-stretch text-center font-bold whitespace-pre-wrap text-gray-600`}
      >
        {title}
      </div>
      <div
        className={`${contentClasses[size]} self-stretch text-center font-normal whitespace-pre-wrap text-gray-400`}
      >
        {content}
      </div>
      <img
        className={imageClasses[size]}
        src={`${icon ? icon : '/images/EmptyFiles.png'}`}
        alt=''
        aria-hidden='true'
      />
    </div>
  );
};

export default EmptyCase;
