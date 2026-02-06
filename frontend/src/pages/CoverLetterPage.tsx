import { useState } from 'react';

import CoverLetterWriteSidebar from '@/features/coverLetter/components/CoverLetterWriteSidebar';
import NewCoverLetter from '@/features/coverLetter/components/newCoverLetter/NewCoverLetter';
import NewCoverLetterButton from '@/features/coverLetter/components/newCoverLetterButton';
import {
  coverLetterHeaderText,
  emptyCaseText,
} from '@/features/coverLetter/constants';
import ContentHeader from '@/shared/components/ContentHeader';
import CoverLetterOverview from '@/shared/components/CoverLetterOverview';
import DataGuard from '@/shared/components/DataGuard';
import EmptyCase from '@/shared/components/EmptyCase';
import SearchInput from '@/shared/components/SearchInput';
import SidebarLayout from '@/shared/components/SidebarLayout';

const CoverLetterPage = () => {
  const [isLanding, setIsLanding] = useState(true);

  const hasData = true;

  const handleSearch = () => {};

  // 나중에 페이지 분기처리 리팩토링
  // isLanding으로 랜딩 페이지, 자기소개서 등록/수정 페이지 분기
  // 자기소개서 등록/수정 페이지는 사이드바가 아닌 메인 콘텐츠로 분기

  return (
    <SidebarLayout
      headerSlot={
        <>
          <ContentHeader {...coverLetterHeaderText} />
          {isLanding && (
            <div className='flex flex-row items-center justify-between'>
              <SearchInput
                onSearch={handleSearch}
                placeholder='문항 유형을 입력해주세요'
              />
              <NewCoverLetterButton handleClick={setIsLanding} />
            </div>
          )}
        </>
      }
      sidebarSlot={!isLanding && <CoverLetterWriteSidebar />}
    >
      <DataGuard
        data={hasData}
        fallback={<EmptyCase {...emptyCaseText.overview} />}
      >
        {isLanding ? (
          <CoverLetterOverview isCoverLetter={true} len={9} />
        ) : (
          <NewCoverLetter />
        )}
      </DataGuard>
    </SidebarLayout>
  );
};

export default CoverLetterPage;
