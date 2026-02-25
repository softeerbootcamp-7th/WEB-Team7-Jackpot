import { AUTH_FORM, AUTH_MESSAGES } from '@/features/auth/constants';
import type { AuthFormData } from '@/features/auth/types/auth';
import {
  validateId,
  validateNickname,
  validatePassword,
} from '@/shared/utils/validation';

interface validateFormDataProps {
  formData: AuthFormData;
  isIdDuplicationVerified: boolean;
}

export const validateFormData = ({
  formData,
  isIdDuplicationVerified,
}: validateFormDataProps) => {
  const newMsg: AuthFormData = {
    userId: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
  };
  let isMatch = false;

  if (formData.userId) {
    if (!validateId(formData.userId)) {
      newMsg.userId = AUTH_MESSAGES.VALIDATION.ID_FORMAT;
    } else {
      if (isIdDuplicationVerified) {
        newMsg.userId = AUTH_MESSAGES.VALIDATION.ID_AVAILABLE;
      } else {
        newMsg.userId = AUTH_MESSAGES.VALIDATION.ID_CHECK_REQUIRED;
      }
    }
  }

  if (formData.password) {
    newMsg.password = validatePassword(formData.password)
      ? ''
      : AUTH_MESSAGES.VALIDATION.PW_FORMAT;
  } else {
    newMsg.password = '';
  }

  if (formData.passwordConfirm) {
    isMatch = formData.password === formData.passwordConfirm;
    newMsg.passwordConfirm = isMatch
      ? AUTH_MESSAGES.VALIDATION.PW_MATCH
      : AUTH_MESSAGES.VALIDATION.PW_MISMATCH;
  } else {
    newMsg.passwordConfirm = '';
    isMatch = false;
  }

  const name = formData.nickname;
  if (name) {
    if (name.length < AUTH_FORM.VALIDATION_RULES.NICKNAME.MIN) {
      newMsg.nickname = AUTH_MESSAGES.VALIDATION.NICKNAME_MIN;
    } else if (name.length > AUTH_FORM.VALIDATION_RULES.NICKNAME.MAX) {
      newMsg.nickname = AUTH_MESSAGES.VALIDATION.NICKNAME_MAX;
    } else if (!validateNickname(name)) {
      newMsg.nickname = AUTH_MESSAGES.VALIDATION.NICKNAME_FORMAT;
    } else {
      newMsg.nickname = '';
    }
  } else {
    newMsg.nickname = '';
  }

  return { newMsg, isMatch };
};
