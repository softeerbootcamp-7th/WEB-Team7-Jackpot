import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

import { SUB_TITLE } from '@/constants/constantsInLoginPage';

const LoginPage = () => {
  return (
    <AuthLayout subTitle={SUB_TITLE} subTitleColor='text-gray-600'>
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
