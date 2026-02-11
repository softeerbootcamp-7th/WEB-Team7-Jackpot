import { useEffect, useState } from 'react';

import { authClient } from '@/features/auth/api/auth';
import useAuthForm from '@/features/auth/hooks/useAuthForm';
import type { AuthFormData, AuthInputKey } from '@/features/auth/types/auth';
import { validateFormData } from '@/features/auth/utils/validateFormData';
import { useToastMessageContext } from '@/shared/context/ToastMessageContext';
import {
  validateId,
  validateNickname,
  validatePassword,
} from '@/shared/utils/validation';

interface isActivedType {
  id: boolean;
  submit: boolean;
}

interface UseSignUpProps {
  handleSuccess: (state: boolean) => void;
}

export const useSignUp = ({ handleSuccess }: UseSignUpProps) => {
  const [isSignUpFailed, setIsSignUpFailed] = useState<boolean>(false);
  const { showToast } = useToastMessageContext();
  const { formData, handleInputChange: originalHandleInputChange } =
    useAuthForm({
      userId: '',
      password: '',
      passwordConfirm: '',
      nickname: '',
    });

  const [statusMsg, setStatusMsg] = useState<AuthFormData>({
    userId: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
  });

  const [isPasswordMatched, setIsPasswordMatched] = useState<boolean>(false);
  const [isIdDuplicationVerified, setIsIdDuplicationVerified] =
    useState<boolean>(false);

  const handleInputChange =
    (key: AuthInputKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isSignUpFailed) setIsSignUpFailed(false);
      originalHandleInputChange(key)(e);
      if (key === 'userId') setIsIdDuplicationVerified(false);
    };

  const handleCheckDuplicateId = async () => {
    if (!validateId(formData.userId)) return;

    try {
      await authClient.checkId({ userId: formData.userId });

      setIsIdDuplicationVerified(true);
      setStatusMsg((prev) => ({
        ...prev,
        userId: '사용 가능한 아이디입니다.',
      }));
    } catch {
      setIsIdDuplicationVerified(false);
      setStatusMsg((prev) => ({
        ...prev,
        userId: '이미 사용 중인 아이디입니다.',
      }));
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isIdDuplicationVerified) {
      showToast('아이디 중복 확인을 해주세요.', false);
      return;
    }

    try {
      await authClient.signUp({
        userId: formData.userId,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        nickname: formData.nickname,
      });

      await authClient.login({
        userId: formData.userId,
        password: formData.password,
      });

      showToast('회원가입 및 로그인이 완료되었습니다.', true);
      handleSuccess(true);
    } catch (error) {
      if (error instanceof Error) {
        setIsSignUpFailed(true);
      } else {
        console.error('SignUp or Auto-Login Error', error);
        showToast('회원가입 또는 로그인 중 오류가 발생했습니다.', false);
      }
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const { newMsg, isMatch } = validateFormData({
        formData: formData,
        isIdDuplicationVerified: isIdDuplicationVerified,
      });
      setStatusMsg(newMsg);
      setIsPasswordMatched(isMatch);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [formData, isIdDuplicationVerified]);

  const isActived: isActivedType = {
    id: validateId(formData.userId) && !isIdDuplicationVerified,

    submit:
      isIdDuplicationVerified &&
      validateId(formData.userId) &&
      validatePassword(formData.password) &&
      formData.password === formData.passwordConfirm &&
      (formData.nickname || '').length >= 2 &&
      validateNickname(formData.nickname || ''),
  };

  return {
    statusMsg: statusMsg,
    handleSignUp: handleSignUp,
    isIdDuplicationVerified: isIdDuplicationVerified,
    isPasswordMatched: isPasswordMatched,
    isSignUpFailed: isSignUpFailed,
    handleInputChange: handleInputChange,
    formData: formData,
    handleCheckDuplicateId: handleCheckDuplicateId,
    isActived: isActived,
  };
};
