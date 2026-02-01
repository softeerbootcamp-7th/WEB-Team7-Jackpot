import { useState } from 'react';

import loginBackground from '/images/loginBackgroundImage.png';

import TitleLogo from '@/components/common/icons/TitleLogo';
import LogoAndSubTitle from '@/components/common/LogoAndSubTitle';
import SubmitButton from '@/components/common/SubmitButton';
import InputBarInSignUp from '@/components/signUp/InputBarInSignUp';

import {
  INPUT_BAR_IN_SIGNUP,
  SUB_TITLE,
} from '@/constants/constantsInSignUpPage';

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof FormDataType,
  ) => {
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
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
          subTitleColor='text-gray-950'
        />
        <form className='flex flex-col justify-center items-center gap-[60px]'>
          <div className='w-[24.5rem] flex flex-col justify-center items-center gap-[1.125rem]'>
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
          <SubmitButton isActived={isActived} value='회원가입' />
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
