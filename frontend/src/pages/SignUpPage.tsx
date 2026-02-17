import { useNavigate } from 'react-router';

import AuthLayout from '@/features/auth/components/AuthLayout';
import SignUpForm from '@/features/auth/components/SignUpForm';
import { SUB_TITLE } from '@/features/auth/constants/constantsInSignUpPage';

const SignUpPage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/signup/complete', { replace: true });
  };

  return (
    <AuthLayout subTitle={SUB_TITLE} subTitleColor='text-gray-950'>
      <SignUpForm handleSuccess={handleSuccess} />
    </AuthLayout>
  );
};

export default SignUpPage;
