import { useState } from 'react';

import CoverLetterList from '@/components/upload/CoverLetterList';
import { UploadPageIcons } from '@/components/upload/icons/index';

const UploadTextArea = () => {
  const [tabState, setTabState] = useState<1 | 2 | 3>(1);

  const [contents, setContents] = useState<{ [key: number]: string }>({
    1: '',
    2: '',
    3: '',
  });

  const handleContents = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    setContents((prev) => ({ ...prev, [tabState]: newValue }));
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='px-[1.5rem] py-[1.25rem] rounded-lg select-none bg-purple-50 select-none'>
        <div className='flex w-full items-center gap-[0.625rem]'>
          <UploadPageIcons.TextDocumentIcon />
          <div className='font-bold text-purple-600 text-[1.375rem]'>
            최대 3개의 텍스트형 자기소개서를 업로드할 수 있어요.
          </div>
        </div>
        <div className='font-normal text-gray-400 px-[2.75rem] text-base'>
          라이브러리 내에 아카이빙하기 위한 기본 정보와 함께, 질문과 답변으로
          구성된 자기소개서 텍스트를 붙여넣어주세요.
        </div>
      </div>
      <CoverLetterList tabState={tabState} setTabState={setTabState} />
      <div>
        <div className='flex gap-[0.125rem]'>
          <div className='font-bold text-lg text-gray-950'>자기소개서 내용</div>
          <div className='text-red-600'>*</div>
        </div>
        <div>
          <div className='relative w-full'>
            {!contents[tabState] && (
              <div className='absolute inset-0 px-5 py-[0.875rem] flex flex-col gap-1 text-gray-400 text-sm select-none pointer-events-none'>
                <div className='font-bold'>
                  보유하고 계신 자기소개서 전체, 혹은 경험의 일부를
                  붙여넣어주세요
                </div>
                <div className='flex'>
                  <div>ex.&nbsp;</div>
                  <div>
                    Q. 협업 중 발생하는 어려움을 극복한 경험과 해당 경험에서
                    배운 점을 서술하세요. (1,500자)
                    <br />
                    A. 팀 프로젝트 중 다툼이 있었으나, 이를 중재해 성공적으로
                    마무리하였습니다.
                  </div>
                </div>
              </div>
            )}
          </div>
          <textarea
            id='text'
            className='w-full min-h-64 resize-none outline-none bg-gray-50 rounded-lg'
            value={contents[tabState]}
            onChange={handleContents}
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default UploadTextArea;
