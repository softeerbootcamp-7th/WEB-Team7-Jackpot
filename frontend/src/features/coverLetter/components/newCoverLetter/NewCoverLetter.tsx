// import { useState } from 'react';

import InputField from '@/features/coverLetter/components/newCoverLetter/InputField';
import QuestionsSection from '@/features/coverLetter/components/newCoverLetter/QuestionsSection';
import { ChevronDownIcon } from '@/features/coverLetter/icons/ChevronDown';
import { NewCoverLetterIcon } from '@/features/coverLetter/icons/NewCoverLetter';

const NewCoverLetter = () => {
  // const [newDisable, setNewDisable] = useState(true);
  const newDisable = false;

  return (
    <div className='mb-23.5 flex flex-col items-start gap-10 border-l border-gray-100 px-8'>
      <div className='flex items-center justify-between self-stretch'>
        <div className='flex items-center justify-start gap-2'>
          <div className='m-auto h-8 w-8 overflow-hidden'>
            <NewCoverLetterIcon />
          </div>
          <div className='text-title-m justify-start font-bold text-gray-950'>
            새 자기소개서 등록
          </div>
        </div>
        <button
          type='button'
          className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg ${newDisable ? 'bg-gray-50' : 'bg-gray-900'} px-5 py-3`}
        >
          <div
            className={`text-title-s justify-start text-center font-bold ${newDisable ? 'text-gray-400' : 'text-white'}`}
          >
            등록 완료
          </div>
        </button>
      </div>
      <form
        className='flex flex-col gap-10 self-stretch'
        onSubmit={(e) => e.preventDefault()}
      >
        <div className='flex items-center justify-start self-stretch'>
          <div className='flex flex-1 flex-col items-start justify-start gap-5'>
            <InputField title='기업명' placeholder='기업명을 입력해주세요' />
            <InputField title='직무명' placeholder='직무명을 입력해주세요' />
          </div>
          <div className='flex flex-col items-start justify-start gap-5'>
            <div className='flex h-24 flex-col items-start justify-start gap-3 self-stretch'>
              <div className='inline-flex items-center justify-start gap-0.5 self-stretch'>
                <div className='text-title-s justify-start font-bold text-gray-950'>
                  채용 분기
                </div>
                <div className='text-title-s justify-start font-bold text-red-600'>
                  *
                </div>
              </div>
              <div className='inline-flex items-start justify-start gap-3 self-stretch'>
                <div className='flex h-12 w-32 min-w-32 items-center justify-between rounded-lg bg-gray-50 py-3.5 pr-3.5 pl-5'>
                  <div className='text-body-m flex-1 justify-start font-medium text-gray-950'>
                    2026
                  </div>

                  <button
                    type='button'
                    aria-label='채용 연도 선택'
                    className='flex cursor-pointer items-center justify-start gap-2.5'
                  >
                    <div className='relative h-6 w-6'>
                      <ChevronDownIcon />
                    </div>
                  </button>
                </div>
                <div className='flex h-12 w-64 items-center justify-start overflow-hidden rounded-lg bg-gray-50 p-1'>
                  <div className='flex h-11 flex-1 items-center justify-center rounded-md bg-white px-10 py-2.5 shadow-[0px_0px_10px_0px_rgba(41,41,41,0.06)]'>
                    <div className='text-body-m justify-start font-bold text-gray-950'>
                      상반기
                    </div>
                  </div>
                  <div className='flex h-11 flex-1 items-center justify-center rounded-md px-10 py-2.5'>
                    <div className='text-body-m justify-start font-normal text-gray-400'>
                      하반기
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='flex flex-col items-start justify-start gap-3 self-stretch'>
              <div className='flex items-center justify-start gap-0.5 self-stretch'>
                <div className='text-title-s justify-start font-bold text-gray-950'>
                  마감일
                </div>
              </div>
              <div className='flex items-start justify-start gap-2 self-stretch'>
                <div className='flex h-12 w-32 min-w-32 items-center justify-between rounded-lg bg-gray-50 px-5 py-3.5'>
                  <div className='text-body-s flex-1 justify-start font-normal text-gray-400'>
                    YYYY
                  </div>
                  <div className='text-body-m justify-start text-right font-medium text-gray-950'>
                    년
                  </div>
                </div>
                <div className='flex h-12 w-32 min-w-32 items-center justify-between rounded-lg bg-gray-50 px-5 py-3.5'>
                  <div className='text-body-s flex-1 justify-start font-normal text-gray-400'>
                    MM
                  </div>
                  <div className='text-body-m justify-start text-right font-medium text-gray-950'>
                    월
                  </div>
                </div>
                <div className='flex h-12 w-32 min-w-32 items-center justify-between rounded-lg bg-gray-50 px-5 py-3.5'>
                  <div className='text-body-s flex-1 justify-start font-normal text-gray-400'>
                    DD
                  </div>
                  <div className='text-body-m justify-start text-right font-medium text-gray-950'>
                    일
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <QuestionsSection />
      </form>
    </div>
  );
};

export default NewCoverLetter;
