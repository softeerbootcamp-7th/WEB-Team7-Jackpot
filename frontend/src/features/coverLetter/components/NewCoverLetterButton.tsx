// 나중에 이름 변경 라우팅 할 예정
// 자기소개서 등록하기 버튼입니다

import { Link } from 'react-router';

import { PlusIcon } from '@/features/coverLetter/icons/Plus';

const NewCoverLetterButton = () => {
  return (
    <Link
      to='./new'
      className='inline-flex cursor-pointer items-center justify-start gap-6'
    >
      <div className='flex items-center justify-center gap-1.5 rounded-lg bg-gray-900 py-3 pr-5 pl-4'>
        <div className='h-6 w-6'>
          <PlusIcon className='text-white' />
        </div>
        <div className='text-title-s justify-start text-center font-bold text-white'>
          자기소개서 추가하기
        </div>
      </div>
    </Link>
  );
};

export default NewCoverLetterButton;
