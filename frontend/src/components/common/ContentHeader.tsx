import { LibraryIcon } from '../library/icons/Library';

// 박소민 수정 페이지 별로 아이콘 추가할 것
const IconNode: Record<string, React.ReactNode> = {
  라이브러리: <LibraryIcon />,
};

const ContentHeader = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => {
  return (
    <div className='w-131.25 pt-7.5 inline-flex flex-col justify-start items-start gap-0.5'>
      <div className='flex flex-row gap-2.5'>
        <div className='w-9 h-9'>{IconNode[title]}</div>
        <div className='gap-2.5'>
          <div className='text-gray-950 text-3xl font-bold leading-10'>
            {title}
          </div>
          <div className='text-gray-600 text-lg font-normal leading-7'>
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentHeader;
