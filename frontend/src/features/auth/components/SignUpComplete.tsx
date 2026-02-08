import { useNavigate } from 'react-router';

import FolderIcon from '@/assets/icons/FolderIcon.png';
import { SignUpPageIcons as SI } from '@/features/auth/icons';
import { CommonIcon as CI } from '@/shared/icons';

const SignUpComplete = () => {
  const navigate = useNavigate();

  return (
    <div className='relative flex h-screen w-full flex-col items-center justify-center select-none'>
      <div className='absolute -z-10'>
        <SI.SignUpBackground />
      </div>
      <div className='z-10 flex flex-col items-center'>
        <div className='mb-8'>
          <img src={FolderIcon} />
        </div>
        <div className='mb-5'>
          <CI.TitleLogo />
        </div>
        <div className='flex flex-col gap-1'>
          <span className='text-headline-l font-bold text-gray-800'>
            회원가입이 완료되었어요!
          </span>
          <span className='text-title-m mb-12 text-center text-gray-600'>
            자기소개서 저장부터
            <br />
            손쉬운 작성까지 빠르게 경험해보세요!
          </span>
        </div>

        <button
          className='text-title-s flex cursor-pointer items-center gap-2 rounded-lg bg-gray-900 px-7 py-3 text-white'
          type='button'
          onClick={() => navigate('/upload')}
        >
          <SI.ShareIcon />
          <span>자료 업로드하러 가기</span>
        </button>
      </div>
    </div>
  );
};

export default SignUpComplete;
