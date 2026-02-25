import libraryFolder from '@/assets/icons/LibraryFolder.svg';

interface LibraryFolderGridProps {
  folderList: string[];
  onSelectFolder: (folderName: string) => void;
}

/**
 * LibraryFolderGrid 컴포넌트
 *
 * 역할: 라이브러리 검색 탭의 초기 화면 (폴더 그리드 뷰)
 * - 서버에서 받은 folderList를 기반으로 문항 유형 폴더 표시
 * - 폴더 클릭 시 해당 유형의 문항 리스트로 전환
 * - URL 변경 없이 상태만 변경
 */
const LibraryFolderGrid = ({
  folderList,
  onSelectFolder,
}: LibraryFolderGridProps) => {
  return (
    <div className='flex w-full flex-col items-center justify-start gap-6 px-3 pb-3'>
      <div className='grid grid-cols-3 gap-2.5'>
        {folderList.map((folderName) => (
          <button
            key={folderName}
            type='button'
            onClick={() => onSelectFolder(folderName)}
            aria-label={`${folderName} 폴더 열기`}
            className='inline-flex h-30 w-30 flex-col items-center justify-center gap-2.5 rounded-lg px-3 pt-5 pb-4 transition-colors hover:bg-gray-50'
          >
            <img src={libraryFolder} alt='' className='h-[54px] w-[77.76px]' />
            <div className='text-caption-l line-clamp-1 w-24 justify-start text-center font-medium text-gray-950'>
              {folderName}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LibraryFolderGrid;
