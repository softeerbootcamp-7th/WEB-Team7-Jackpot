import { useState } from 'react';
import React from 'react';

import { useNavigate, useSearchParams } from 'react-router';

import InputBar from '@/features/auth/components/InputBar';
import SubmitButton from '@/features/auth/components/SubmitButton';
import { AUTH_FORM, AUTH_MESSAGES } from '@/features/auth/constants';
import { useLogin } from '@/features/auth/hooks/useAuthClient';
import useAuthForm from '@/features/auth/hooks/useAuthForm';
import type { AuthInputKey } from '@/features/auth/types/auth';
import LoadingModal from '@/shared/components/modal/LoadingModal';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';
import { validateId } from '@/shared/utils/validation';

const LoginForm = () => {
  const { mutateAsync: login, isPending } = useLogin();
  const { showToast } = useToastMessageContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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

  const handleInputChange =
    (key: AuthInputKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
      // 로그인 실패가 된 후 입력이 이루어질 때를 위한 함수 고도화
      if (isLoginFailed) setIsLoginFailed(false);

      // 고차함수 즉시 실행을 위한 문법
      originalHandleInputChange(key)(e);
    };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login({
        userId: formData.userId,
        password: formData.password,
      });

      showToast(AUTH_MESSAGES.LOGIN.SUCCESS, true);
    } catch (error) {
      if (error instanceof Error) {
        setIsLoginFailed(true);
      } else {
        showToast(AUTH_MESSAGES.LOGIN.FAILURE, false);
      }
    }
  };
  return (
    <>
      <LoadingModal isLoading={isPending} message={AUTH_MESSAGES.LOGIN.PENDING} />
      <form
        className='flex flex-col items-center justify-center gap-6'
        onSubmit={handleLogin}
      >
        <div className='flex w-[24.5rem] flex-col items-center justify-center gap-3'>
          {AUTH_FORM.INPUTS.LOGIN.map((each) => (
            <React.Fragment key={each.ID}>
              <InputBar
                isFail={isLoginFailed}
                type={each.TYPE}
                placeholder={each.PLACEHOLDER}
                maxLength={each.MAX_LENGTH}
                value={formData[each.ID]}
                onChange={handleInputChange(each.ID)}
              />
              {each.ID === AUTH_FORM.FIELDS.PASSWORD && (
                <span
                  className={`text-body-s w-full text-center transition-colors duration-200 ${
                    isLoginFailed
                      ? 'text-red-600'
                      : 'text-transparent select-none'
                  }`}
                >
                  {AUTH_MESSAGES.LOGIN.INVALID}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
        <SubmitButton isActived={isActived} value={AUTH_FORM.LABELS.LOGIN_ACTION} />
      </form>
      <button
        type='button'
        onClick={() => {
          const redirect = searchParams.get('redirect');
          navigate(
            redirect
              ? `/signup?redirect=${encodeURIComponent(redirect)}`
              : '/signup',
          );
        }}
        className='text-body-m cursor-pointer font-medium text-gray-600'
      >
        {AUTH_FORM.LABELS.SIGN_UP_ACTION}
      </button>
    </>
  );
};

export default LoginForm;
