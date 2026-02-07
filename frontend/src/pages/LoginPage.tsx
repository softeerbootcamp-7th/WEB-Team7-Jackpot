import AuthLayout from '@/features/auth/components/AuthLayout';
import LoginForm from '@/features/auth/components/LoginForm';
import { SUB_TITLE } from '@/features/auth/constants/constantsInLoginPage';

const LoginPage = () => {
  return (
    <AuthLayout subTitle={SUB_TITLE} subTitleColor='text-gray-600'>
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
