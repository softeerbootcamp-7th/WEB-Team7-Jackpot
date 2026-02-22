export interface EmptyCaseProps {
  title: string;
  content: string;
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  className?: string;
}

const sizeClasses = {
  small: 'h-96 w-full max-w-96',
  medium: 'h-140 w-full max-w-140',
  large: 'h-180 w-full max-w-180',
};

const titleClasses = {
  small: 'text-title-s',
  medium: 'text-title-l',
  large: 'text-title-xl',
};

const contentClasses = {
  small: 'text-body-s',
  medium: 'text-title-s',
  large: 'text-title-m',
};

const imageClasses = {
  small: 'pt-2 w-30 h-30',
  medium: 'pt-3 w-100 h-60',
  large: 'pt-5 w-120 h-120',
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
      className={`mx-auto flex ${sizeClasses[size]} flex-col items-center justify-center gap-3 bg-[url(/images/Circles.png)] bg-contain bg-center ${className}`}
    >
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
        className={`${imageClasses[size]} object-contain`}
        src={`${icon ? icon : '/images/EmptyFiles.png'}`}
        alt=''
        aria-hidden='true'
      />
    </div>
  );
};

export default EmptyCase;
