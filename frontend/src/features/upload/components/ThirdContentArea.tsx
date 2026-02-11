import { UploadPageIcons as I } from '@/features/upload/icons';

const ThirdContentArea = () => {
  return (
    <div>
      <div className='flex flex-col gap-1'>
        <span className='text-title-m text-gray-600'>저장이 완료되었어요!</span>
        <span className='text-body-l text-gray-400'>
          총 3개의 문항이 라이브러리에 저장되었어요.
        </span>
      </div>
      <div>그림 영역</div>
      <div className='text-title-s flex gap-3'>
        <button className='flex gap-2 rounded-lg bg-gray-50 px-5 py-3'>
          <I.FolderIconInButton />
          <span className='text-gray-600'>새로운 자료 업로드하기</span>
        </button>
        <button className='flex gap-2 rounded-lg bg-gray-900 px-5 py-3'>
          <I.FolderIconInButton />
          <span className='text-white'>라이브러리에서 보기</span>
        </button>
      </div>
    </div>
  );
};

export default ThirdContentArea;
