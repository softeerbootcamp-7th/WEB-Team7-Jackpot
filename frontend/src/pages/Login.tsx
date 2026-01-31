import { useState } from 'react';

import loginBackground from '/images/loginBackgroundImage.png';
import titleLogo from '/images/titleLogo.svg';
import { useNavigate } from 'react-router';

import InputBar from '@/components/common/InputBar';
import SubmitButton from '@/components/common/SubmitButton';

import {
  INPUT_BAR_IN_LOGIN,
  SUB_TITLE,
} from '@/constants/constatnsInLoginPage';

import '@/index.css';

interface FormDataType {
  id: string;
  password: string;
}

const LoginPage = () => {
  const [formData, setFormData] = useState<FormDataType>({
    id: '',
    password: '',
  });
  const navigate = useNavigate();

  const isActived: boolean = Object.values(formData).every(
    (each) => each !== '',
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof FormDataType,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
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
          <div className='text-center justify-start text-gray-600 text-lg font-bold line-clamp-1 select-none'>
            {SUB_TITLE}
          </div>
        </div>
        <div>
          <form className='flex flex-col justify-center items-center gap-6'>
            <div className='w-[392px] flex flex-col justify-center items-center gap-3'>
              {INPUT_BAR_IN_LOGIN.map((each) => (
                <InputBar
                  key={each.ID}
                  type={each.TYPE}
                  placeholder={each.PLACEHOLDER}
                  onChange={(e) => handleInputChange(e, each.ID)}
                />
              ))}
            </div>
            <SubmitButton isActived={isActived} value='로그인' />
          </form>
        </div>
        <button
          className='text-gray-600 font-medium text-base cursor-pointer'
          onClick={() => navigate('/signup')}
        >
          회원가입
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
