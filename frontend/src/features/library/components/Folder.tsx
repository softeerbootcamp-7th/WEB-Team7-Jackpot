import { LibraryFolder } from '../icons/LibraryFolder';

type FolderProps = {
  name: string;
  onClick?: () => void;
};

const Folder = ({ name, onClick }: FolderProps) => {
  return (
    <button
      type='button'
      onClick={onClick}
      className='inline-flex h-30 w-30 flex-col items-center justify-center gap-2.5 px-3 pt-5 pb-4'
    >
      <LibraryFolder />
      <div className='text-caption-l line-clamp-1 w-24 justify-start text-center font-medium text-gray-950'>
        {name}
      </div>
    </button>
  );
};

export default Folder;
