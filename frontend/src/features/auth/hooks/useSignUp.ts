import { useEffect, useState } from 'react';

import { AUTH_FORM, AUTH_MESSAGES } from '@/features/auth/constants';
import {
  useCheckId,
  useLogin,
  useSignUp as useSignUpMutation,
} from '@/features/auth/hooks/useAuthClient';
import useAuthForm from '@/features/auth/hooks/useAuthForm';
import type { AuthFormData, AuthInputKey } from '@/features/auth/types/auth';
import { validateFormData } from '@/features/auth/utils/validateFormData';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';
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
  const { mutateAsync: checkId, isPending: isCheckingId } = useCheckId();
  const { mutateAsync: signUp, isPending: isSigningUp } = useSignUpMutation();
  const { mutateAsync: login, isPending: isLoggingIn } = useLogin();
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

  const isPending = isCheckingId || isSigningUp || isLoggingIn;

  const handleInputChange =
    (key: AuthInputKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isSignUpFailed) setIsSignUpFailed(false);
      originalHandleInputChange(key)(e);
      if (key === AUTH_FORM.FIELDS.USER_ID) setIsIdDuplicationVerified(false);
    };

  const handleCheckDuplicateId = async () => {
    if (!validateId(formData.userId)) return;

    try {
      await checkId({ userId: formData.userId });

      setIsIdDuplicationVerified(true);
      setStatusMsg((prev) => ({
        ...prev,
        userId: AUTH_MESSAGES.VALIDATION.ID_AVAILABLE,
      }));
    } catch {
      setIsIdDuplicationVerified(false);
      setStatusMsg((prev) => ({
        ...prev,
        userId: AUTH_MESSAGES.VALIDATION.ID_DUPLICATED,
      }));
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isIdDuplicationVerified) {
      showToast(AUTH_MESSAGES.VALIDATION.ID_CHECK_REQUIRED, false);
      return;
    }

    try {
      await signUp({
        userId: formData.userId,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        nickname: formData.nickname,
      });

      await login({
        userId: formData.userId,
        password: formData.password,
      });

      showToast(AUTH_MESSAGES.SIGNUP.SUCCESS_ALL, true);
      handleSuccess(true);
    } catch (error) {
      if (error instanceof Error) {
        setIsSignUpFailed(true);
      } else {
        showToast(AUTH_MESSAGES.SIGNUP.ERROR, false);
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
    isPending: isPending,
  };
};
