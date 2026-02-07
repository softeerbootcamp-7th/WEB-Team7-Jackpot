import Scrap from '@/features/coverLetter/components/Scrap';
import SearchInput from '@/shared/components/SearchInput';

const scrabList = Array.from({ length: 3 });

const CoverLetterWriteSidebar = () => {
  // 나중에 수정
  const handleSearch = () => {};

  const deleteScrap = () => {};

  return (
    <div className='inline-flex h-full w-[26.75rem] flex-col items-start justify-start gap-3 self-stretch'>
      <div className='flex flex-col items-center justify-start gap-3 self-stretch'>
        <div className='flex flex-col items-start justify-start gap-2.5 self-stretch px-3'>
          <div className='inline-flex h-12 items-center justify-start self-stretch overflow-hidden rounded-lg bg-gray-50 p-1'>
            <div className='flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md bg-white px-16 py-2.5 shadow-[0px_0px_10px_0px_rgba(41,41,41,0.06)]'>
              <div className='text-body-m justify-start font-bold text-gray-950'>
                문항 스크랩
              </div>
            </div>
            <div className='flex h-11 flex-1 items-center justify-center rounded-md px-10 py-2.5'>
              <div className='text-body-m justify-start font-normal text-gray-400'>
                라이브러리 검색
              </div>
            </div>
          </div>
        </div>
        <SearchInput
          onSearch={handleSearch}
          placeholder='문항 유형을 입력해주세요'
        />
      </div>

      {scrabList.map((_, idx) => {
        return <Scrap key={idx} deleteScrap={deleteScrap} />;
      })}
    </div>
  );
};

export default CoverLetterWriteSidebar;
