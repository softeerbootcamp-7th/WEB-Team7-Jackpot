import { UploadPageIcons as I } from '@/features/upload/icons';

const UploadLayoutHeader = () => {
  return (
    <div className='mb-12 select-none'>
      <div className='flex w-full items-center gap-[0.625rem]'>
        <I.DocumentBoxIcon />
        <div className='font-bold text-gray-950 text-[1.75rem]'>
          자료 업로드
        </div>
      </div>
      <div className='font-normal text-gray-600 px-[2.875rem] text-lg'>
        회사별, 문항별로 나만의 자기소개서를 작성하고 관리할 수 있어요
      </div>
    </div>
  );
};

export default UploadLayoutHeader;
