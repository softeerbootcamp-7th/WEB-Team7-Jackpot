import { useNavigate } from 'react-router';

import InputBar from './InputBar';
import SubmitButton from './SubmitButton';

import { authClient } from '@/features/auth/api/auth';
import { INPUT_BAR_IN_LOGIN } from '@/features/auth/constants/constantsInLoginPage';
import useAuthForm from '@/features/auth/hooks/useAuthForm';
import { validateId } from '@/shared/utils/validation';

const LoginForm = () => {
  const navigate = useNavigate();
  const { formData, handleInputChange } = useAuthForm({
    userId: '',
    password: '',
  });

  const isActived =
    validateId(formData.userId) && formData.password.length >= 8;
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await authClient.login({
        userId: formData.userId,
        password: formData.password,
      });

      // [윤종근] TODO: 추후 토스트 메시지로 변경 필요
      alert('로그인 되었습니다.');
      navigate('/home');
    } catch (error) {
      console.error('Login Failed:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('로그인에 실패했습니다.');
      }
    }
  };
  return (
    <>
      <form className='flex flex-col items-center justify-center gap-6'>
        <div className='flex w-[24.5rem] flex-col items-center justify-center gap-3'>
          {INPUT_BAR_IN_LOGIN.map((each) => (
            <InputBar
              key={each.ID}
              type={each.TYPE}
              placeholder={each.PLACEHOLDER}
              maxLength={each.MAX_LENGTH}
              value={formData[each.ID]}
              onChange={(e) => handleInputChange(e, each.ID)}
            />
          ))}
        </div>
        <SubmitButton isActived={isActived} value='로그인' />
      </form>
      <button
        type='button'
        onClick={() => navigate('/signup')}
        className='cursor-pointer text-base font-medium text-gray-600'
      >
        회원가입
      </button>
    </>
  );
};

export default LoginForm;
