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
      <div className='flex w-full flex-col items-center justify-center bg-white'>
        <div className='relative aspect-[810/424] w-full max-w-[1000px]'>
          <SI.NotFoundIllustration
            className='h-full w-full'
            aria-hidden='true'
          />
          <div className='absolute top-1/4 left-1/2 inline-flex w-96 max-w-full -translate-x-1/2 flex-col items-center justify-start gap-3'>
            <h2 className='self-stretch text-center text-2xl font-bold text-gray-950'>
              업로드 과정에서
              <br />
              오류가 발생했어요
            </h2>
            <p className='self-stretch text-center text-lg font-normal text-gray-600'>
              자기소개서 내에서 답변을 찾지 못했어요.
              <br />
              답변을 포함한 다른 자료를 새로 업로드해주세요.
            </p>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className='mt-2 flex'>
          <button
            onClick={() => navigate('/upload')}
            className='flex cursor-pointer items-center gap-2 rounded-lg bg-gray-50 px-6 py-3 transition-colors hover:bg-gray-100'
          >
            <UI.UploadIconInButton />
            <span className='text-body-m font-bold text-gray-600'>
              새로운 자료 업로드하기
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='relative flex w-full items-center py-12 justify-center'>
      <div className='absolute top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2'>
        <UI.UploadCompleteBackground />
      </div>
      <div className='z-10 mt-24 flex flex-col items-center gap-12'>
        <img src={folderIconInUpload} />

        <div className='text-title-s flex gap-3'>
          <button
            onClick={() => navigate('/upload')}
            className='flex cursor-pointer gap-2 rounded-lg bg-gray-50 px-5 py-3 hover:bg-gray-100 transition-colors duration-200'
          >
            <UI.UploadIconInButton />
            <span className='text-gray-600'>새로운 자료 업로드하기</span>
          </button>
          <button
            onClick={() => navigate('/library')}
            className='flex cursor-pointer gap-2 rounded-lg bg-gray-900 px-5 py-3 hover:bg-gray-700 transition-colors duration-200'
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
