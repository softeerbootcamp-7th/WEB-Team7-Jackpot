import { memo } from 'react';

const ContentHeader = memo(
  ({
    icon,
    title,
    content,
  }: {
    icon: () => React.ReactNode;
    title: string;
    content: string;
  }) => {
    return (
      <div className='inline-flex w-131.25 flex-col items-start justify-start gap-0.5 pb-7.5'>
        <div className='grid grid-cols-[auto_1fr] items-center gap-2.5'>
          {/* icon */}
          <div className='h-9 w-9'>{icon()}</div>

          {/* title */}
          <div className='text-headline-m font-bold text-gray-950'>{title}</div>

          {/* Empty space (same width as icon) */}
          <div />

          {/* content */}
          <div className='text-title-s font-normal text-gray-600'>
            {content}
          </div>
        </div>
      </div>
    );
  },
);

ContentHeader.displayName = 'ContentHeader';

export default ContentHeader;
