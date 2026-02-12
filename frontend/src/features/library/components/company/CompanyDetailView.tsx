import { useParams, useSearchParams } from 'react-router';

import { MOCK_COVER_LETTERS } from '@/features/library/api/mockData';
import { useCompanyListQueries } from '@/features/library/hooks/queries/useLibraryListQueries';
import type { CoverLetter } from '@/features/library/types';
import Pagination from '@/shared/components/Pagination';
import { getDate } from '@/shared/utils/dates';

const CompanyDetailView = () => {
  const { companyName, coverLetterId } = useParams<{
    companyName: string;
    coverLetterId: string;
  }>();

  const [searchParams, setSearchParams] = useSearchParams();
  const companyQuery = useCompanyListQueries(companyName ?? null);

  // URL 쿼리 파라미터에서 페이지 읽기 (기본값: 1)
  const currentPage = Number(searchParams.get('page')) || 1;
  const currentQuestionIndex = currentPage - 1; // 0-based index

  const currentDocument: CoverLetter | undefined =
    companyQuery.data?.coverLetters.find(
      (doc) => doc.id === Number(coverLetterId),
    ) ||
    MOCK_COVER_LETTERS.find(
      (doc) =>
        doc.companyName === companyName && doc.id === Number(coverLetterId),
    );

  if (!currentDocument) {
    return <div>문서를 찾을 수 없습니다.</div>;
  }

  const currentQuestion = currentDocument.question[currentQuestionIndex];
  const modifiedDate = getDate(currentDocument.modifiedAt);

  // 페이지 변경 핸들러
  const handlePageChange = (newIndex: number) => {
    setSearchParams({ page: String(newIndex + 1) });
  };

  return (
    <div className='flex h-full w-full min-w-0 flex-col items-start justify-start gap-5 border-t-0 border-r-0 border-b-0 border-l border-gray-100 px-8 py-7'>
      <div className='relative flex items-start justify-between self-stretch'>
        <div className='flex items-start justify-end gap-1'>
          <div className='relative flex items-center justify-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5'>
            <p className='text-left text-xs font-medium text-blue-600'>
              {currentDocument.companyName}
            </p>
          </div>
          <div className='relative flex items-center justify-center gap-1 rounded-xl bg-gray-50 px-3 py-1.5'>
            <p className='text-left text-xs font-medium text-gray-600'>
              {currentDocument.jobPosition}
            </p>
          </div>
        </div>
        {/* <div>버튼이 들어갈 예정입니다.</div> */}
      </div>
      <div className='flex flex-col items-start justify-start gap-3 self-stretch'>
        <div className='relative flex flex-col items-start justify-start gap-0.5 self-stretch'>
          <p className='w-[810px] self-stretch text-left text-[22px] font-bold text-gray-950'>
            {currentDocument.applySeason}
          </p>
          <div className='relative flex items-start justify-start gap-1'>
            <p className='text-body-s text-gray-400'>
              총 {currentDocument.questionCount}문항
            </p>
            <p className='text-body-s text-gray-400'>·</p>
            <p className='text-body-s text-gray-400'>{modifiedDate}</p>
          </div>
        </div>
      </div>
      <div className='flex flex-col items-start justify-start gap-3.5 self-stretch'>
        <div className='flex items-center justify-start gap-2.5 self-stretch'>
          <div className='flex flex-grow items-start justify-center gap-3'>
            <div className='relative flex w-[35px] items-center justify-center gap-1 rounded-xl bg-gray-50 px-3 py-1.5'>
              <p className='text-body-m text-center font-bold text-gray-600'>
                {currentQuestionIndex + 1}
              </p>
            </div>
            <div className='relative flex flex-grow items-center justify-center gap-2.5 pt-[3.5px]'>
              <p className='text-title-s w-full flex-grow font-bold text-gray-950'>
                {currentQuestion.question}
              </p>
            </div>
          </div>
        </div>
        <div className='flex flex-col items-start justify-start gap-6 self-stretch pr-[34px] pl-[47px]'>
          <div className='flex flex-col items-start justify-start gap-2 self-stretch'>
            <div className='relative flex flex-col items-start justify-start gap-2 self-stretch py-2'>
              <p className='text-body-m w-full self-stretch text-left text-gray-800'>
                {currentQuestion.answer}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className='flex h-8 w-full items-center justify-between py-0.5'>
        <div className='flex flex-shrink-0 flex-grow items-center justify-start gap-0.5 pl-[47px]'>
          <p className='text-body-m text-left font-medium text-gray-400'>
            {currentQuestion.answerSize}자
          </p>
        </div>
        <Pagination
          current={currentQuestionIndex}
          total={currentDocument.questionCount}
          onChange={handlePageChange}
          align='end'
        />
      </div>
    </div>
  );
};
export default CompanyDetailView;
