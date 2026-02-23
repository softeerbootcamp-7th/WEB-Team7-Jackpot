import { useLocation, useNavigate } from 'react-router';

import folderIconInUpload from '@/assets/icons/folderIconInUpload.png';
import * as UI from '@/features/upload/icons';
import * as SI from '@/shared/icons';

const UploadCompleteSection = () => {
  // [윤종근] - TODO: 추후 useNavigate -> Link로 변경 시 수정
  const navigate = useNavigate();
  const location = useLocation();

  const isFailed = location.state?.isFailed || false;

  if (isFailed) {
    return (
      <div className='flex w-full flex-col items-center justify-center bg-white py-20'>
        <div className='relative flex h-80 w-80 items-center justify-center'>
          <SI.NotFoundIllustration
            className='absolute h-full w-full opacity-10'
            aria-hidden='true'
          />
          <div className='z-10 flex flex-col items-center justify-center rounded-full bg-white/70 p-8 text-center shadow-sm backdrop-blur-md'>
            <h2 className='text-xl font-bold text-gray-950'>
              업로드 과정에서
              <br />
              오류가 발생했어요
            </h2>
            <p className='mt-2 text-sm text-gray-500'>
              자기소개서 내에서 답변을 찾지 못했어요.
              <br />
              답변을 포함한 다른 자료를 새업로드해주세요.
            </p>
            <div className='mt-4 text-4xl text-gray-300'>!</div>
          </div>
        </div>

        <div className='mt-10 flex'>
          <button
            onClick={() => navigate('/upload')}
            className='flex cursor-pointer gap-2 rounded-lg bg-gray-50 px-5 py-3'
          >
            <UI.UploadIconInButton />
            <span className='text-gray-600'>새로운 자료 업로드하기</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='relative flex w-full items-center justify-center'>
      <div className='absolute top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2'>
        <UI.UploadCompleteBackground />
      </div>
      <div className='z-10 mt-24 flex flex-col items-center gap-12'>
        <img src={folderIconInUpload} />

        <div className='text-title-s flex gap-3'>
          <button
            onClick={() => navigate('/upload')}
            className='flex cursor-pointer gap-2 rounded-lg bg-gray-50 px-5 py-3'
          >
            <UI.UploadIconInButton />
            <span className='text-gray-600'>새로운 자료 업로드하기</span>
          </button>
          <button
            onClick={() => navigate('/library')}
            className='flex cursor-pointer gap-2 rounded-lg bg-gray-900 px-5 py-3'
          >
            <UI.FolderIconInButton />
            <span className='text-white'>라이브러리에서 보기</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadCompleteSection;
