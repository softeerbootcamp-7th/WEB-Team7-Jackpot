import { useState } from 'react';

import loginBackground from '/images/loginBackgroundImage.png';
import titleLogo from '/images/titleLogo.svg';

import InputBarInSignUp from '@/components/signUp/InputBarInSignUp';

import { INPUT_BAR_IN_SIGNUP } from '@/constants/constantsInSignUpPage';

import '@/index.css';

interface FormDataType {
  id: string;
  password: string;
  passwordCheck: string;
  nickname: string;
}
const SignUpPage = () => {
  const [formData, setFormData] = useState<FormDataType>({
    id: '',
    password: '',
    passwordCheck: '',
    nickname: '',
  });

  const isActived: boolean = Object.values(formData).every(
    (each) => each !== '',
  );

  const buttonActiveStyle: string = isActived
    ? 'bg-gray-900 text-white cursor-pointer'
    : 'bg-gray-50 text-gray-400';

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof FormDataType,
  ) => {
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
  };

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
                onChange={(e) => handleInputChange(e, each.ID)}
              />
            ))}
          </div>
          <input
            className={`w-full ${buttonActiveStyle} px-5 py-[12px] rounded-lg`}
            type='submit'
            value='회원가입'
            disabled={!isActived}
          />
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
