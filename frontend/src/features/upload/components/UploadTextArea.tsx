import { useEffect, useState } from 'react';

import CoverLetterList from '@/features/upload/components/CoverLetterList';
import * as UI from '@/features/upload/icons';

interface UploadTextAreaProps {
  setIsContent: (state: boolean) => void;
  currentId: number;
  handleIdChange: (id: number) => void;
}
const UploadTextArea = ({
  setIsContent,
  currentId,
  handleIdChange,
}: UploadTextAreaProps) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const [contents, setContents] = useState<{ [key: number]: string }>({
    1: '',
    2: '',
    3: '',
  });

  const handleContents = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    setContents((prev) => ({ ...prev, [currentId]: newValue }));
  };

  useEffect(() => {
    const contentList = Object.values(contents);
    const hasContent = contentList.some((content) => content !== '');
    setIsContent(hasContent);
  }, [contents, setIsContent]);

  return (
    <div className='flex flex-col gap-6'>
      <div className='rounded-lg bg-purple-50 px-[1.5rem] py-[1.25rem] select-none'>
        <div className='flex w-full items-center gap-[0.625rem]'>
          <UI.TextDocumentIcon />
          <div className='text-[1.375rem] font-bold text-purple-600'>
            최대 3개의 텍스트형 자기소개서를 업로드할 수 있어요.
          </div>
        </div>
        <div className='px-[2.75rem] text-base font-normal text-gray-400'>
          라이브러리 내에 아카이빙하기 위한 기본 정보와 함께, 질문과 답변으로
          구성된 자기소개서 텍스트를 붙여넣어주세요.
        </div>
      </div>
      <CoverLetterList tabState={currentId} setTabState={handleIdChange} />
      <div>
        <div className='flex gap-[0.125rem]'>
          <div className='text-lg font-bold text-gray-950'>자기소개서 내용</div>
          <div className='text-red-600'>*</div>
        </div>
        <div>
          <div className='relative w-full'>
            {
              <div
                className={`pointer-events-none absolute inset-0 flex flex-col gap-1 px-5 py-[0.875rem] text-sm text-gray-400 select-none ${!contents[currentId] && !isFocused ? 'opacity-100' : 'opacity-0'}`}
              >
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
            }
          </div>
          <textarea
            id='text'
            className='min-h-64 w-full resize-none rounded-lg bg-gray-50 px-5 py-3 outline-none'
            value={contents[currentId]}
            onChange={handleContents}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default UploadTextArea;
