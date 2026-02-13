import { useParams } from 'react-router';

import { getMockQuestionsByQnAName } from '@/features/library/api/mockData';
import { useQnAListQueries } from '@/features/library/hooks/queries/useLibraryListQueries';

const QnADetailView = () => {
  const { qnAName, qnAId } = useParams<{
    qnAName: string;
    qnAId: string;
  }>();

  const qnaQuery = useQnAListQueries(qnAName ?? null);

  if (qnaQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (qnaQuery.isError) {
    return <div>문서를 불러오는 중 오류가 발생했습니다.</div>;
  }

  const isDev = import.meta.env.DEV;

  // API 데이터 또는 목데이터에서 찾기
  const mockQuestions = getMockQuestionsByQnAName(qnAName ?? null);

  const currentDocument =
    qnaQuery.data?.pages
      .flatMap((page) => page.questions)
      .find((doc) => doc.id === Number(qnAId)) ||
    (isDev ? mockQuestions.find((doc) => doc.id === Number(qnAId)) : undefined);

  if (!currentDocument) {
    console.log('Document not found!');
    return <div>문서를 찾을 수 없습니다.</div>;
  }

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
          <p className='w-full self-stretch text-left text-[22px] font-bold text-gray-950'>
            {currentDocument.applySeason}
          </p>
          <div className='relative flex items-start justify-start gap-1'>
            <p className='text-body-s text-gray-400'>총 {1}문항 · </p>
            <div className='relative flex items-center justify-start'>
              {/* [박소민] TODO: 최종 수정일 넣기 */}
              <p className='text-body-s text-gray-400'>2026 . 01. 23</p>
            </div>
          </div>
        </div>
      </div>
      <div className='flex flex-col items-start justify-start gap-3.5 self-stretch'>
        <div className='flex items-center justify-start gap-2.5 self-stretch'>
          <div className='flex flex-grow items-start justify-center gap-3'>
            <div className='relative flex w-[35px] items-center justify-center gap-1 rounded-xl bg-gray-50 px-3 py-1.5'>
              <p className='text-body-m text-center font-bold text-gray-600'>
                1
              </p>
            </div>
            <div className='relative flex flex-grow items-center justify-center gap-2.5 pt-[3.5px]'>
              <p className='text-title-s w-full flex-grow font-bold text-gray-950'>
                {currentDocument.question}
              </p>
            </div>
          </div>
        </div>
        <div className='flex flex-col items-start justify-start gap-6 self-stretch pr-[34px] pl-[47px]'>
          <div className='flex flex-col items-start justify-start gap-2 self-stretch'>
            <div className='relative flex flex-col items-start justify-start gap-2 self-stretch py-2'>
              <p className='text-body-m w-full self-stretch text-left text-gray-800'>
                {currentDocument.answer}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className='flex h-8 w-[810px] items-center justify-end gap-5 py-0.5'>
        <div className='relative flex flex-grow items-center justify-start gap-0.5 pl-[47px]'>
          <p className='text-body-m text-left font-medium text-gray-400'>
            {/* {currentDocument.answerSize} */}
          </p>
          {/* <p className='text-body-m text-left font-medium text-gray-400'>자</p> */}
        </div>
      </div>
    </div>
  );
};

export default QnADetailView;
