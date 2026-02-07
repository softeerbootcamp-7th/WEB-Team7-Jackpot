import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router';

import { authClient } from '@/features/auth/api/auth';
import CheckDuplicationButton from '@/features/auth/components/CheckDuplicationButton';
import InputBarInSignUp from '@/features/auth/components/InputBarInSignUp';
import SubmitButton from '@/features/auth/components/SubmitButton';
import { INPUT_BAR_IN_SIGNUP } from '@/features/auth/constants/constantsInSignUpPage';
import useAuthForm from '@/features/auth/hooks/useAuthForm';
import type { AuthFormData } from '@/features/auth/types/auth';
import {
  validateId,
  validateNickname,
  validatePassword,
} from '@/shared/utils/validation';

interface isActivedType {
  id: boolean;
  submit: boolean;
}

const SignUpForm = () => {
  const navigate = useNavigate();
  const { formData, handleInputChange } = useAuthForm({
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
      alert('아이디 중복 확인을 해주세요.');
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

      // [윤종근] TODO: 추후 토스트 메시지로 변경 필요
      alert('회원가입이 완료되었습니다.');
      navigate('/home');
    } catch (error) {
      console.error('SignUp or Auto-Login Error', error);
      alert('회원가입 또는 로그인 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
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
        } else if (!validateNickname(name)) {
          newMsg.nickname =
            '형식이 올바르지 않습니다 (자/모음, 숫자, 특수문자, 공백 입력 불가)';
        } else {
          newMsg.nickname = '';
        }
      } else {
        newMsg.nickname = '';
      }

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

  return (
    <form
      className='flex flex-col items-center justify-center gap-[3.75rem]'
      onSubmit={handleSignUp}
    >
      <div className='flex w-[24.5rem] flex-col items-center justify-center gap-[1.125rem]'>
        {INPUT_BAR_IN_SIGNUP.map((each) => {
          const currentMsg = statusMsg[each.ID];

          const isPasswordMatchSuccess =
            each.ID === 'passwordConfirm' && isPasswordMatched;

          return (
            <InputBarInSignUp
              key={each.ID}
              label={each.LABEL}
              type={each.TYPE}
              placeholder={each.PLACEHOLDER}
              maxLength={each.MAX_LENGTH}
              onChange={() => {
                handleInputChange(each.ID);
                if (each.ID === 'userId') {
                  setIsIdDuplicationVerified(false);
                }
              }}
              value={formData[each.ID]}
              helpMessage={currentMsg}
              isSuccess={isPasswordMatchSuccess}
              rightElement={
                each.ID === 'userId' && (
                  <CheckDuplicationButton
                    onClick={handleCheckDuplicateId}
                    isActived={isActived.id}
                  />
                )
              }
            />
          );
        })}
      </div>
      <SubmitButton isActived={isActived.submit} value='회원가입' />
    </form>
  );
};

export default SignUpForm;
