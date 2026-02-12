import Folder from '@/features/library/components/Folder';

interface FolderListProps {
  className?: string;
  folderList?: string[];
}

const FolderList = ({ className, folderList }: FolderListProps) => {
  return (
    <div
      className={`inline-flex w-full flex-col items-center justify-start gap-6 pb-3 ${className ?? ''}`}
    >
      <div className='grid grid-cols-3 gap-2.5 px-3'>
        {folderList &&
          folderList.map((name, idx) => {
            return <Folder name={name} key={idx} />;
          })}
      </div>
    </div>
  );
};

export default FolderList;
