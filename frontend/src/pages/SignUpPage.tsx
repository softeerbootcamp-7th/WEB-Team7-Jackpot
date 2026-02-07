import AuthLayout from '@/features/auth/components/AuthLayout';
import SignUpForm from '@/features/auth/components/SignUpForm';
import { SUB_TITLE } from '@/features/auth/constants/constantsInSignUpPage';

const SignUpPage = () => {
  return (
    <AuthLayout subTitle={SUB_TITLE} subTitleColor='text-gray-950'>
      <SignUpForm />
    </AuthLayout>
  );
};

export default SignUpPage;
