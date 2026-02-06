import Folder from './Folder';

interface FolderListProps {
  className: string;
  folderList: string[];
  handleFolderId?: (folderId: number | null) => void;
}

const FolderList = ({
  className,
  folderList,
  handleFolderId,
}: FolderListProps) => {
  return (
    <div
      className={`inline-flex w-full flex-col items-center justify-start gap-6 pb-3 ${className}`}
    >
      <div className='grid grid-cols-3 gap-2.5 px-3'>
        {folderList.map((name, idx) => {
          return (
            <Folder
              name={name}
              key={idx}
              onClick={() => handleFolderId?.(idx)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FolderList;
