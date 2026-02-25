import { useState } from 'react';

import { AUTH_FORM } from '@/features/auth/constants';
import type { AuthFormData, AuthInputKey } from '@/features/auth/types/auth';

// 로그인과 회원가입의 입력바 형태가 비슷해서 쉽게 사용할 수 있도록 커스텀 훅 제공
const useAuthForm = <T extends AuthFormData>(initialState: T) => {
  const [formData, setFormData] = useState<T>(initialState);

  // 입력창에 입력 시 자동 변환이나 입력자 제한을 하는 핸들러
  // 고차 함수(HOF) 커링을 사용하여 onChange에서 콜백 함수가 아닌 일반 함수로 호출하도록 변경
  const handleInputChange =
    (key: AuthInputKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;

      // 입력의 종류에 따라 로직을 추가할 수 있도록 switch-case문 추가
      switch (key) {
        case AUTH_FORM.FIELDS.USER_ID:
          value = value.toLowerCase();
          break;

        default:
          break;
      }
      setFormData((prev) => ({ ...prev, [key]: value }));
    };
  return { formData, handleInputChange, setFormData };
};

export default useAuthForm;
