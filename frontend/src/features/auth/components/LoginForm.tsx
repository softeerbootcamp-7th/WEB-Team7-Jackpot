import { useCallback, useState } from 'react';
import React from 'react';

import { useNavigate } from 'react-router';

import { authClient } from '@/features/auth/api/auth';
import InputBar from '@/features/auth/components/InputBar';
import SubmitButton from '@/features/auth/components/SubmitButton';
import { INPUT_BAR_IN_LOGIN } from '@/features/auth/constants/constantsInLoginPage';
import useAuthForm from '@/features/auth/hooks/useAuthForm';
import type { AuthInputKey } from '@/features/auth/types/auth';
import { validateId } from '@/shared/utils/validation';

const LoginForm = () => {
  const navigate = useNavigate();
  // 로그인 실패 시를 위한 상태
  const [isLoginFailed, setIsLoginFailed] = useState<boolean>(false);
  // SoC(관심사 분리)를 위해 커스텀 훅 내부가 아닌 외부에서 핸들러 고도화 (구조 분해 할당 alias 활용)
  const { formData, handleInputChange: originalHandleInputChange } =
    useAuthForm({
      userId: '',
      password: '',
    });

  const isActived =
    validateId(formData.userId) && formData.password.length >= 8;

  const handleInputChange = useCallback(
    (key: AuthInputKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
      // 로그인 실패가 된 후 입력이 이루어질 때를 위한 함수 고도화
      if (isLoginFailed) setIsLoginFailed(false);

      // 고차함수 즉시 실행을 위한 문법
      originalHandleInputChange(key)(e);
    },
    [isLoginFailed, originalHandleInputChange],
  );

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
        setIsLoginFailed(true);
      } else {
        alert('로그인에 실패했습니다.');
      }
    }
  };
  return (
    <>
      <form
        className='flex flex-col items-center justify-center gap-6'
        onSubmit={handleLogin}
      >
        <div className='flex w-[24.5rem] flex-col items-center justify-center gap-3'>
          {INPUT_BAR_IN_LOGIN.map((each) => (
            <React.Fragment key={each.ID}>
              <InputBar
                isError={isLoginFailed}
                type={each.TYPE}
                placeholder={each.PLACEHOLDER}
                maxLength={each.MAX_LENGTH}
                value={formData[each.ID]}
                onChange={handleInputChange(each.ID)}
              />
              {each.ID === 'password' && (
                <span
                  className={`text-body-s w-full text-center transition-colors duration-200 ${
                    isLoginFailed
                      ? 'text-red-600'
                      : 'text-transparent select-none'
                  }`}
                >
                  아이디, 비밀번호를 확인해 주세요
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
        <SubmitButton isActived={isActived} value='로그인' />
      </form>
      <button
        type='button'
        onClick={() => navigate('/signup')}
        className='text-body-m cursor-pointer font-medium text-gray-600'
      >
        회원가입
      </button>
    </>
  );
};

export default LoginForm;
