import { useState } from 'react';

import DocumentBoxIcon from '@/components/upload/icons/DocumentBoxIcon';
import FileUploadIcon from '@/components/upload/icons/FileUploadIcon';
import TextUploadIcon from '@/components/upload/icons/TextUploadIcon';
import StepItem from '@/components/upload/StepItem';
import TabButton from '@/components/upload/TabButton';
import UploadAreaLayout from '@/components/upload/UploadFileArea';

const UploadPage = () => {
  const [uploadTab, setUploadTab] = useState<'file' | 'text'>('file');

  return (
    <div>
      <div className='w-full h-[5rem]'>헤더</div>
      <div className='px-[13.125rem]'>
        <div className='mb-12'>
          <div className='mb-12 select-none'>
            <div className='flex w-full items-center gap-[0.625rem]'>
              <DocumentBoxIcon />
              <div className='font-bold text-gray-950 text-[1.75rem]'>
                자료 업로드
              </div>
            </div>
            <div className='font-normal text-gray-600 px-[2.875remx] text-lg'>
              회사별, 문항별로 나만의 자기소개서를 작성하고 관리할 수 있어요
            </div>
          </div>
          <StepItem />
        </div>
        <div className='flex flex-col gap-4 p-4 border border-gray-100 rounded-2xl'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <TabButton
                isActived={uploadTab === 'file'}
                onClick={() => setUploadTab('file')}
                icon={<FileUploadIcon />}
                label='파일 업로드하기'
              />
              <TabButton
                isActived={uploadTab === 'text'}
                onClick={() => setUploadTab('text')}
                icon={<TextUploadIcon />}
                label='텍스트 붙여넣기'
              />
            </div>
            <div className='flex items-center gap-6'>
              <div className='flex items-center text-gray-400 gap-1 select-none'>
                <div>0</div>
                <div>/</div>
                <div>10MB</div>
              </div>
              <button className='bg-gray-50 px-[1.125rem] py-3 gap-[0.375rem] rounded-lg cursor-pointer'>
                <div className='text-lg font-bold text-gray-400'>
                  AI 라벨링 시작
                </div>
              </button>
            </div>
          </div>
          {uploadTab === 'file' ? <UploadAreaLayout /> : <></>}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
