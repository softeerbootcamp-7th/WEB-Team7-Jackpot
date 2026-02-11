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
      newMsg.userId = '6~12자의 영문 소문자, 숫자만 사용 가능합니다.';
    } else {
      if (isIdDuplicationVerified) {
        newMsg.userId = '사용 가능한 아이디입니다.';
      } else {
        newMsg.userId = '중복 확인이 필요합니다.';
      }
    }
  }

  if (formData.password) {
    newMsg.password = validatePassword(formData.password)
      ? ''
      : '비밀번호 형식이 올바르지 않습니다. (영문, 숫자 조합 8자 이상)';
  } else {
    newMsg.password = '';
  }

  if (formData.passwordConfirm) {
    isMatch = formData.password === formData.passwordConfirm;
    newMsg.passwordConfirm = isMatch
      ? '비밀번호가 일치합니다.'
      : '비밀번호가 일치하지 않습니다.';
  } else {
    newMsg.passwordConfirm = '';
    isMatch = false;
  }

  const name = formData.nickname;
  if (name) {
    if (name.length < 2) {
      newMsg.nickname = '2자 이상 입력해주세요';
    } else if (name.length > 15) {
      newMsg.nickname = '15자 이하로 입력해주세요';
    } else if (!validateNickname(name)) {
      newMsg.nickname =
        '형식이 올바르지 않습니다 (자/모음, 숫자, 특수문자, 공백 입력 불가)';
    } else {
      newMsg.nickname = '';
    }
  } else {
    newMsg.nickname = '';
  }

  return { newMsg, isMatch };
};
