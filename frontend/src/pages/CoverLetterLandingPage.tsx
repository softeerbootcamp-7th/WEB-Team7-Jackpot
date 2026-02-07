import NewCoverLetterButton from '@/features/coverLetter/components/NewCoverLetterButton';
import CoverLetterOverview from '@/shared/components/CoverLetterOverview';
import SearchInput from '@/shared/components/SearchInput';

const CoverLetterLandingPage = () => {
  const handleSearch = () => {};

  return (
    <div className='flex h-screen w-full max-w-screen min-w-[1700px] flex-col overflow-hidden px-75 pb-30'>
      <div className='flex flex-row items-center justify-between'>
        <SearchInput
          onSearch={handleSearch}
          placeholder='문항 유형을 입력해주세요'
        />
        {/* [박소민] TODO: Link로 변환 */}
        <NewCoverLetterButton />
      </div>
      <CoverLetterOverview isCoverLetter={true} len={9} />
    </div>
  );
};

export default CoverLetterLandingPage;
