import { useNavigate } from 'react-router';

import folderIconInSignUp from '@/assets/icons/folderIconInSignUp.png';
import { AUTH_FORM } from '@/features/auth/constants';
import * as AI from '@/features/auth/icons';
import * as SI from '@/shared/icons';

const SignUpCompletePage = () => {
  const navigate = useNavigate();

  return (
    <div className='relative flex h-screen w-full flex-col items-center justify-center select-none'>
      <div className='absolute -z-10'>
        <AI.SignUpBackground />
      </div>
      <div className='z-10 flex flex-col items-center'>
        <div className='mb-8'>
          <img src={folderIconInSignUp} />
        </div>
        <div className='mb-5'>
          <SI.TitleLogo />
        </div>
        <div className='flex flex-col gap-1'>
          <span className='text-headline-l font-bold text-gray-800'>
            {AUTH_FORM.COMPLETE.TITLE}
          </span>
          <span className='text-title-m mb-12 text-center text-gray-600'>
            {AUTH_FORM.COMPLETE.SUB_TITLE_FIRST}
            <br />
            {AUTH_FORM.COMPLETE.SUB_TITLE_SECOND}
          </span>
        </div>

        <button
          className='text-title-s flex cursor-pointer items-center gap-2 rounded-lg bg-gray-900 px-7 py-3 text-white'
          type='button'
          onClick={() => navigate('/upload')}
        >
          <AI.ShareIcon />
          <span>{AUTH_FORM.COMPLETE.BUTTON_TEXT}</span>
        </button>
      </div>
    </div>
  );
};

export default SignUpCompletePage;
