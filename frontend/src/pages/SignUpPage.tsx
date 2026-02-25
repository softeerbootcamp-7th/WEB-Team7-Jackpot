import { useNavigate, useSearchParams } from 'react-router';

import AuthLayout from '@/features/auth/components/AuthLayout';
import SignUpForm from '@/features/auth/components/SignUpForm';
import { AUTH_FORM } from '@/features/auth/constants';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSuccess = () => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`, {
        replace: true,
      });
    } else {
      navigate('/signup/complete', { replace: true });
    }
  };

  return (
    <AuthLayout subTitle={AUTH_FORM.TITLES.SIGNUP} subTitleColor='text-gray-950'>
      <SignUpForm handleSuccess={handleSuccess} />
    </AuthLayout>
  );
};

export default SignUpPage;
