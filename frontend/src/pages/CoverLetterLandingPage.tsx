import NewCoverLetterButton from '@/features/coverLetter/components/NewCoverLetterButton';
import { coverLetterHeaderText } from '@/features/coverLetter/constants';
import ContentHeader from '@/shared/components/ContentHeader';
import CoverLetterOverview from '@/shared/components/CoverLetterOverview';
import DataGuard from '@/shared/components/DataGuard';
import EmptyCase from '@/shared/components/EmptyCase';
import SearchInput from '@/shared/components/SearchInput';

// [박소민] TODO: ContentHeader CoverLetterPage.tsx과 겹치는 문제 리렌더링 최소화할 방법 찾기
const CoverLetterLandingPage = () => {
  const hasData = false; // [박소민] TODO: 데이터 유무에 따른 조건 처리
  const handleSearch = () => {};

  const coverLetterEmptyCaseText = emptyCaseText['overview'];

  return (
    <div className='flex h-[calc(100vh-5.625rem)] w-full max-w-screen min-w-[1700px] flex-col overflow-hidden px-75 pb-30'>
      <ContentHeader {...coverLetterHeaderText} />
      <div className='flex flex-row items-center justify-between'>
        <SearchInput
          onSearch={handleSearch}
          placeholder='문항 유형을 입력해주세요'
        /> 
        {/* [박소민] TODO: Link로 변환 */}
        <NewCoverLetterButton />
      </div>
      <CoverLetterOverview isCoverLetter={hasData} len={9} />
    </div>
  );
};

export default CoverLetterLandingPage;
