import NewCoverLetterButton from '@/features/coverLetter/components/NewCoverLetterButton';
import { emptyCaseText } from '@/features/coverLetter/constants';
import CoverLetterOverview from '@/shared/components/CoverLetterOverview';
import DataGuard from '@/shared/components/DataGuard';
import EmptyCase from '@/shared/components/EmptyCase';
import SearchInput from '@/shared/components/SearchInput';

const CoverLetterLandingPage = () => {
  const hasData = true;
  const handleSearch = () => {};

  const coverLetterEmptyCaseText = emptyCaseText['overview'];

  return (
    <div className='flex h-[calc(100vh-5.625rem)] w-full max-w-screen min-w-[1700px] flex-col overflow-hidden px-75 pb-30'>
      <div className='flex flex-row items-center justify-between'>
        <SearchInput
          onSearch={handleSearch}
          placeholder='문항 유형을 입력해주세요'
        />
        {/* [박소민] TODO: Link로 변환 */}
        <NewCoverLetterButton />
      </div>
      <DataGuard
        data={hasData}
        fallback={<EmptyCase {...coverLetterEmptyCaseText} />}
      >
        <CoverLetterOverview isCoverLetter={true} len={9} />
      </DataGuard>
    </div>
  );
};

export default CoverLetterLandingPage;
