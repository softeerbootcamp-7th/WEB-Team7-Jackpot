const ContentHeader = ({
  icon,
  title,
  content,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
}) => {
  return (
    <div className='inline-flex w-131.25 flex-col items-start justify-start gap-0.5 py-7.5'>
      <div className='flex flex-row gap-2.5'>
        <div className='h-9 w-9'>{icon}</div>
        <div className='gap-2.5'>
          <div className='text-headline-m font-bold text-gray-950'>{title}</div>
          <div className='text-title-s font-normal text-gray-600'>
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentHeader;
