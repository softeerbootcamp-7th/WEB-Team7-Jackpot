import React from 'react';

import CheckDuplicationButton from '@/features/auth/components/CheckDuplicationButton';
import InputBarInSignUp from '@/features/auth/components/InputBarInSignUp';
import SubmitButton from '@/features/auth/components/SubmitButton';
import { INPUT_BAR_IN_SIGNUP } from '@/features/auth/constants/constantsInSignUpPage';
import { useSignUp } from '@/features/auth/hooks/useSignUp';

interface SignUpFormProps {
  handleSuccess: (state: boolean) => void;
}

const SignUpForm = ({ handleSuccess }: SignUpFormProps) => {
  const {
    statusMsg,
    handleSignUp,
    isIdDuplicationVerified,
    isPasswordMatched,
    isSignUpFailed,
    handleInputChange,
    formData,
    handleCheckDuplicateId,
    isActived,
  } = useSignUp({ handleSuccess: handleSuccess });
  return (
    <form
      className='flex flex-col items-center justify-center gap-[3.75rem]'
      onSubmit={handleSignUp}
    >
      <div className='flex w-[24.5rem] flex-col items-center justify-center gap-[1.125rem]'>
        {INPUT_BAR_IN_SIGNUP.map((each) => {
          const currentMsg = statusMsg[each.ID];

          const isIdDuplicationVerifiedSuccess =
            each.ID === 'userId' && isIdDuplicationVerified;
          const isPasswordMatchSuccess =
            each.ID === 'passwordConfirm' && isPasswordMatched;

          return (
            <React.Fragment key={each.ID}>
              <InputBarInSignUp
                label={each.LABEL}
                isFail={isSignUpFailed}
                type={each.TYPE}
                placeholder={each.PLACEHOLDER}
                maxLength={each.MAX_LENGTH}
                onChange={handleInputChange(each.ID)}
                value={formData[each.ID]}
                helpMessage={currentMsg}
                isSuccess={
                  isIdDuplicationVerifiedSuccess || isPasswordMatchSuccess
                }
                rightElement={
                  each.ID === 'userId' && (
                    <CheckDuplicationButton
                      onClick={handleCheckDuplicateId}
                      isActived={isActived.id}
                    />
                  )
                }
              />
            </React.Fragment>
          );
        })}
      </div>
      <SubmitButton isActived={isActived.submit} value='회원가입' />
    </form>
  );
};

export default SignUpForm;
