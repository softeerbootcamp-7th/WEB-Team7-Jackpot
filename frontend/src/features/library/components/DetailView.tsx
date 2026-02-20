import type { ReactNode } from 'react';

// [박소민] TODO: 공통 인터페이스로 줄이기
interface Props {
  companyName: string;
  jobPosition: string;
  applySeason: string | null;
  modifiedAt: string;
  question: string;
  answer: string;
  answerSize: number;
  button?: ReactNode;
  currentQuestionIndex?: number;
  qnaIds?: number[];
  pagination?: ReactNode;
}

const DetailView = ({
  companyName,
  jobPosition,
  applySeason,
  modifiedAt,
  question,
  answer,
  answerSize,
  button,
  currentQuestionIndex = 0,
  qnaIds,
  pagination,
}: Props) => {
  return (
    <div className='flex h-full w-full min-w-0 flex-col items-start justify-start gap-5 border-t-0 border-r-0 border-b-0 border-l border-gray-100 px-8 py-7'>
      <div className='relative flex items-start justify-between self-stretch'>
        <div className='flex items-start justify-end gap-1'>
          <div className='relative flex items-center justify-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5'>
            <p className='text-left text-xs font-medium text-blue-600'>
              {companyName}
            </p>
          </div>
          <div className='relative flex items-center justify-center gap-1 rounded-xl bg-gray-50 px-3 py-1.5'>
            <p className='text-left text-xs font-medium text-gray-600'>
              {jobPosition}
            </p>
          </div>
        </div>
        {button}
      </div>
      <div className='flex flex-col items-start justify-start gap-3 self-stretch'>
        <div className='relative flex flex-col items-start justify-start gap-0.5 self-stretch'>
          <p className='w-[810px] self-stretch text-left text-[22px] font-bold text-gray-950'>
            {applySeason}
          </p>
          <div className='relative flex items-start justify-start gap-1'>
            <p className='text-body-s text-gray-400'>
              {/* ID 리스트의 길이 = 총 문항 수 */}총 {qnaIds?.length ?? 1}문항
            </p>
            <p className='text-body-s text-gray-400'>·</p>
            <p className='text-body-s text-gray-400'>{modifiedAt}</p>
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
                {question}
              </p>
            </div>
          </div>
        </div>
        <div className='flex flex-col items-start justify-start gap-6 self-stretch pr-[34px] pl-[47px]'>
          <div className='flex flex-col items-start justify-start gap-2 self-stretch'>
            <div className='relative flex flex-col items-start justify-start gap-2 self-stretch py-2'>
              <p className='text-body-m w-full self-stretch text-left whitespace-pre-wrap text-gray-800'>
                {answer}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className='flex h-8 w-full items-center justify-between py-0.5'>
        <div className='flex flex-shrink-0 flex-grow items-center justify-start gap-0.5 pl-[47px]'>
          <p className='text-body-m text-left font-medium text-gray-400'>
            {answerSize}자
          </p>
        </div>
        {pagination}
      </div>
    </div>
  );
};

export default DetailView;
