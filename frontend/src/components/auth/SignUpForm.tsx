import { useEffect, useState } from 'react';

import SubmitButton from '@/components/common/SubmitButton';
import CheckDuplicationButton from '@/components/signUp/CheckDuplicationButton';
import InputBarInSignUp from '@/components/signUp/InputBarInSignUp';
import useAuthForm from '@/hooks/auth/useAuthForm';

import { INPUT_BAR_IN_SIGNUP } from '@/constants/constantsInSignUpPage';
import type { AuthFormData } from '@/types/auth';
import {
  validateId,
  validateNickname,
  validatePassword,
} from '@/utils/auth/validation';

interface isActivedType {
  id: boolean;
  submit: boolean;
}

const SignUpForm = () => {
  const { formData, handleInputChange } = useAuthForm({
    id: '',
    password: '',
    passwordCheck: '',
    nickname: '',
  });

  const [statusMsg, setStatusMsg] = useState<AuthFormData>({
    id: '',
    password: '',
    passwordCheck: '',
    nickname: '',
  });

  const [isPasswordMatched, setIsPasswordMatched] = useState<boolean>(false);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const newMsg = { ...statusMsg };
      let isMatch = false;

      if (formData.id) {
        if (!validateId(formData.id)) {
          newMsg.id = '6~12자의 영문 소문자, 숫자만 사용 가능합니다.';
        } else {
          newMsg.id = '';
        }
      } else {
        newMsg.id = '';
      }

      if (formData.password) {
        newMsg.password = validatePassword(formData.password)
          ? ''
          : '비밀번호 형식이 올바르지 않습니다. (영문, 숫자 조합 8자 이상)';
      } else {
        newMsg.password = '';
      }

      if (formData.passwordCheck) {
        isMatch = formData.password === formData.passwordCheck;
        newMsg.passwordCheck = isMatch
          ? '비밀번호가 일치합니다.'
          : '비밀번호가 일치하지 않습니다.';
      } else {
        newMsg.passwordCheck = '';
        isMatch = false;
      }

      const name = formData.nickname;
      if (name) {
        if (name.length < 2) {
          newMsg.nickname = '2자 이상 입력해주세요';
        } else if (!validateNickname(name)) {
          newMsg.nickname = '형식이 올바르지 않습니다';
        } else {
          newMsg.nickname = '';
        }
      } else {
        newMsg.nickname = '';
      }

      setStatusMsg(newMsg);
      setIsPasswordMatched(isMatch);
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [formData, statusMsg]);

  const isActived: isActivedType = {
    id: validateId(formData.id),

    submit:
      validateId(formData.id) &&
      validatePassword(formData.password) &&
      formData.password === formData.passwordCheck &&
      (formData.nickname || '').length >= 2 &&
      validateNickname(formData.nickname || ''),
  };

  return (
    <form className='flex flex-col justify-center items-center gap-[3.75rem]'>
      <div className='w-[24.5rem] flex flex-col justify-center items-center gap-[1.125rem]'>
        {INPUT_BAR_IN_SIGNUP.map((each) => {
          const currentMsg = statusMsg[each.ID];

          const isPasswordMatchSuccess =
            each.ID === 'passwordCheck' && isPasswordMatched;

          return (
            <InputBarInSignUp
              key={each.ID}
              hintText={each.HINT_TEXT}
              type={each.TYPE}
              placeholder={each.PLACEHOLDER}
              maxLength={each.MAX_LENGTH}
              onChange={(e) => handleInputChange(e, each.ID)}
              value={formData[each.ID]}
              helpMessage={currentMsg}
              isSuccess={isPasswordMatchSuccess}
              rightElement={
                each.ID === 'id' && (
                  <CheckDuplicationButton isActived={isActived.id} />
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
