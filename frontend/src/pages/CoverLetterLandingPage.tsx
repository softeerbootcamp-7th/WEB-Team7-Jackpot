import NewCoverLetterButton from '@/features/coverLetter/components/NewCoverLetterButton';
import { emptyCaseText } from '@/features/coverLetter/constants';
import CoverLetterOverview from '@/shared/components/CoverLetterOverview';
import DataGuard from '@/shared/components/DataGuard';
import EmptyCase from '@/shared/components/EmptyCase';
import SearchInput from '@/shared/components/SearchInput';

// [박소민] TODO: ContentHeader CoverLetterPage.tsx과 겹치는 문제 리렌더링 최소화할 방법 찾기
const CoverLetterLandingPage = () => {
  const hasData = false;
  const handleSearch = () => {};

  const coverLetterEmptyCaseText = emptyCaseText['overview'];

  return (
    <>
      <div className='flex flex-row items-center justify-between'>
        <SearchInput
          onSearch={handleSearch}
          placeholder='문항 유형을 입력해주세요'
        />
        {/* [박소민] TODO: Link로 변환 */}
        <NewCoverLetterButton />
      </div>
      <div className='flex flex-1 items-center'>
        <DataGuard
          data={hasData}
          fallback={<EmptyCase {...coverLetterEmptyCaseText} />}
        >
          <CoverLetterOverview isCoverLetter={true} len={9} />
        </DataGuard>
      </div>
    </>
  );
};

export default CoverLetterLandingPage;
