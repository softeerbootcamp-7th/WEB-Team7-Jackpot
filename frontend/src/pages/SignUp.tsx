import AuthLayout from '@/components/auth/AuthLayout';
import SignUpForm from '@/components/auth/SignUpForm';

import { SUB_TITLE } from '@/constants/constantsInSignUpPage';

const SignUpPage = () => {
  return (
    <AuthLayout subTitle={SUB_TITLE} subTitleColor='text-gray-950'>
      <SignUpForm />
    </AuthLayout>
  );
};

export default SignUpPage;
