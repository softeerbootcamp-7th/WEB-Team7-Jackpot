import AuthLayout from '@/features/auth/components/AuthLayout';
import LoginForm from '@/features/auth/components/LoginForm';
import { AUTH_FORM } from '@/features/auth/constants';

const LoginPage = () => {
  return (
    <AuthLayout subTitle={AUTH_FORM.TITLES.LOGIN} subTitleColor='text-gray-600'>
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
