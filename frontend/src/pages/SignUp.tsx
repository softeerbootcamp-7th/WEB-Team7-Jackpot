import { useState } from 'react';

import loginBackground from '/images/loginBackgroundImage.png';
import titleLogo from '/images/titleLogo.svg';

import InputBarInSignUp from '@/components/signUp/InputBarInSignUp';

import { INPUT_BAR_IN_SIGNUP } from '@/constants/constantsInSignUpPage';

import '@/index.css';

const SignUpPage = () => {
  const [idData, setIdData] = useState<string>('');
  const [passwordData, setPasswordData] = useState<string>('');
  const [passwordCheckData, setPasswordCheckData] = useState<string>('');
  const [nicknameData, setNicknameData] = useState<string>('');
  const isActived: boolean =
    idData !== '' &&
    passwordData !== '' &&
    passwordCheckData !== '' &&
    nicknameData !== '';
  const buttonActiveStyle: string = isActived
    ? 'bg-gray-900 text-white cursor-pointer'
    : 'bg-gray-50 text-gray-400';

  const saveUserId = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdData(e.target.value);
  };

  const saveUserPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(e.target.value);
  };

  const saveUserPasswordCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordCheckData(e.target.value);
  };

  const saveUserNickname = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNicknameData(e.target.value);
  };

  const saveHandlers = {
    id: saveUserId,
    password: saveUserPassword,
    passwordCheck: saveUserPasswordCheck,
    nickname: saveUserNickname,
  }

  return (
    <div className='flex items-center ps-[30px] py-[30px] gap-[140px]'>
      <img
        className='w-[1048px] h-auto rounded-[40px]'
        src={loginBackground}
        aria-label='백그라운드 이미지'
      />
      <div className='w-[392px] h-[392px] flex flex-col justify-center items-center gap-6'>
        <div className='flex flex-col items-center gap-3'>
          <img src={titleLogo} aria-label='타이틀 로고' />
          <div className='text-center justify-start text-gray-950 text-lg font-bold line-clamp-1 select-none'>
            회원가입
          </div>
        </div>
        <form className='flex flex-col justify-center items-center gap-[60px]'>
          <div className='w-[392px] flex flex-col justify-center items-center gap-[18px]'>
            {INPUT_BAR_IN_SIGNUP.map((each) => (
              <InputBarInSignUp
                key={each.ID}
                hintText={each.HINT_TEXT}
                type={each.TYPE}
                placeholder={each.PLACEHOLDER}
                onChange={saveHandlers[each.ID]}
              />
            ))}
          </div>
          <input
            className={`w-full ${buttonActiveStyle} px-5 py-[12px] rounded-lg`}
            type='submit'
            value='회원가입'
          />
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
