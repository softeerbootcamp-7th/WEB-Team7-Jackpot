import { useNavigate } from 'react-router';

import InputBar from '@/components/common/InputBar';
import SubmitButton from '@/components/common/SubmitButton';
import useAuthForm from '@/hooks/auth/useAuthForm';

import { INPUT_BAR_IN_LOGIN } from '@/constants/constantsInLoginPage';
import { validateId } from '@/utils/auth/validation';

const LoginForm = () => {
  const navigate = useNavigate();
  const { formData, handleInputChange } = useAuthForm({ id: '', password: '' });

  const isActived = validateId(formData.id) && formData.password.length >= 8;

  return (
    <>
      <form className='flex flex-col justify-center items-center gap-6'>
        <div className='w-[24.5rem] flex flex-col justify-center items-center gap-3'>
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
        className='text-gray-600 font-medium text-base cursor-pointer'
      >
        회원가입
      </button>
    </>
  );
};

export default LoginForm;
