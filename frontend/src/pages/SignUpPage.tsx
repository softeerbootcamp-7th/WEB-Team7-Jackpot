import { useState } from 'react';

import AuthLayout from '@/features/auth/components/AuthLayout';
import SignUpComplete from '@/features/auth/components/SignUpComplete';
import SignUpForm from '@/features/auth/components/SignUpForm';
import { SUB_TITLE } from '@/features/auth/constants/constantsInSignUpPage';

const SignUpPage = () => {
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  return (
    <>
      {isSuccess ? (
        <SignUpComplete />
      ) : (
        <AuthLayout subTitle={SUB_TITLE} subTitleColor='text-gray-950'>
          <SignUpForm handleSuccess={setIsSuccess} />
        </AuthLayout>
      )}
    </>
  );
};

export default SignUpPage;
