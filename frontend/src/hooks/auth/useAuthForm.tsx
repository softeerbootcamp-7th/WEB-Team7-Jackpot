import { useCallback, useState } from 'react';

import type { AuthFormData, AuthInputKey } from '@/types/auth';

const useAuthForm = <T extends AuthFormData>(initialState: T) => {
  const [formData, setFormData] = useState<T>(initialState);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, key: AuthInputKey) => {
      let value = e.target.value;

      switch (key) {
        case 'id':
          value = value.toLowerCase().replace(/[^a-z0-9]/g, '');
          break;
        case 'password':
        case 'passwordCheck':
          value = value.replace(/\s/g, '');
          break;
        case 'nickname':
          value = value.replace(
            /[0-9!@#$%^&*()_+={}[\]:;"'<>,.?/\\|`~\s]/g,
            '',
          );
          break;
        default:
          break;
      }

      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  return { formData, handleInputChange, setFormData };
};

export default useAuthForm;
