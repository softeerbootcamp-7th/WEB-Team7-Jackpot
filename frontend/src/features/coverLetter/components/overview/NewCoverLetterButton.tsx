import { Link } from 'react-router';

import { SharedIcons as SI } from '@/shared/icons';

const NewCoverLetterButton = () => {
  return (
    <Link
      to='/cover-letter/new'
      className='inline-flex cursor-pointer items-center justify-start gap-6'
    >
      <div className='flex items-center justify-center gap-1.5 rounded-lg bg-gray-900 py-3 pr-5 pl-4'>
        <div className='h-6 w-6'>
          <SI.PlusIcon className='text-white' />
        </div>
        <div className='text-title-s justify-start text-center font-bold text-white'>
          자기소개서 추가하기
        </div>
      </div>
    </Link>
  );
};

export default NewCoverLetterButton;
