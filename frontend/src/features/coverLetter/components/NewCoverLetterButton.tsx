// 나중에 이름 변경 라우팅 할 예정
// 자기소개서 등록하기 버튼입니다

import { PlusIcon } from '../icons/Plus';

interface ButtonProps {
  handleClick: (isLanding: boolean) => void;
}

const NewCoverLetterButton = ({ handleClick }: ButtonProps) => {
  return (
    <button
      type='button'
      className='inline-flex cursor-pointer items-center justify-start gap-6'
      onClick={() => handleClick(false)}
    >
      <div className='flex items-center justify-center gap-1.5 rounded-lg bg-gray-900 py-3 pr-5 pl-4'>
        <div className='h-6 w-6'>
          <PlusIcon className='text-white' />
        </div>
        <div className='text-title-s justify-start text-center font-bold text-white'>
          자기소개서 추가하기
        </div>
      </div>
    </button>
  );
};

export default NewCoverLetterButton;
