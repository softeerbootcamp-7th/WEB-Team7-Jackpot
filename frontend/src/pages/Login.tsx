import { useState } from 'react';

import loginBackground from '/images/loginBackgroundImage.png';
import { useNavigate } from 'react-router';

import TitleLogo from '@/components/common/icons/TitleLogo';
import InputBar from '@/components/common/InputBar';
import LogoAndSubTitle from '@/components/common/LogoAndSubTitle';
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
    <div className='flex items-center ps-[1.875rem] py-[1.875rem] gap-[8.75rem]'>
      <img
        className='w-[65.5rem] h-auto rounded-[2.5rem]'
        src={loginBackground}
        aria-label='백그라운드 이미지'
      />
      <div className='w-[24.5rem] h-[24.5rem] flex flex-col justify-center items-center gap-6'>
        <LogoAndSubTitle
          TitleLogoComponent={TitleLogo}
          subTitle={SUB_TITLE}
          subTitleColor='text-gray-600'
        />
        <div>
          <form className='flex flex-col justify-center items-center gap-6'>
            <div className='w-[24.5rem] flex flex-col justify-center items-center gap-3'>
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
