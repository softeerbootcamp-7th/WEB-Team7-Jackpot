import { Link } from 'react-router';

import * as HI from '@/features/home/icons';

interface EmptyStateProps {
  className?: string;
  title: string;
  description: string;
  to?: string;
}

const EmptyState = ({ title, description, to, className }: EmptyStateProps) => {
  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-5 self-stretch rounded-2xl bg-gray-50/50 ${className ? className : 'h-full'}`}
    >
      <HI.PlusIcon />
      <div className='flex flex-col items-start justify-start self-stretch'>
        <div className='justify-start self-stretch text-center text-2xl leading-9 font-bold text-gray-400'>
          {title}
        </div>
        <div className='justify-start self-stretch text-center text-base leading-6 font-normal whitespace-pre-wrap text-gray-400'>
          {description}
        </div>
      </div>
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return content;
};

export default EmptyState;
