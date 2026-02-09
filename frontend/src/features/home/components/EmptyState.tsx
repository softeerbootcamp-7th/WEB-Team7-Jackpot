import { Link } from 'react-router';

import PlusIcon from '@/features/home/icons/PlusIcon';

interface EmptyStateProps {
  title: string;
  description: string;
  to?: string;
  replace?: boolean;
}

const EmptyState = ({ title, description, to, replace }: EmptyStateProps) => {
  const content = (
    <>
      <PlusIcon />
      <div className='flex flex-col items-start justify-start gap-2 self-stretch'>
        <div className='justify-start self-stretch text-center text-lg leading-9 font-bold text-gray-400'>
          {title}
        </div>
        <div
          className='justify-start self-stretch text-center text-sm leading-6 font-normal text-gray-400'
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        replace={replace}
        className='flex h-full flex-col items-center justify-center gap-5 self-stretch rounded-2xl bg-stone-50/50'
      >
        {content}
      </Link>
    );
  }

  return (
    <div className='flex h-full flex-col items-center justify-center gap-5 self-stretch rounded-2xl bg-gray-50/50'>
      {content}
    </div>
  );
};

export default EmptyState;
