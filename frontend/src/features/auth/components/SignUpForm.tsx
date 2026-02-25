import React from 'react';

import CheckDuplicationButton from '@/features/auth/components/CheckDuplicationButton';
import InputBarInSignUp from '@/features/auth/components/InputBarInSignUp';
import SubmitButton from '@/features/auth/components/SubmitButton';
import { AUTH_FORM, AUTH_MESSAGES } from '@/features/auth/constants';
import { useSignUp } from '@/features/auth/hooks/useSignUp';
import LoadingModal from '@/shared/components/modal/LoadingModal';

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
    isPending,
  } = useSignUp({ handleSuccess: handleSuccess });
  return (
    <>
      <LoadingModal
        isLoading={isPending}
        message={AUTH_MESSAGES.SIGNUP.PENDING}
      />
      <form
        className='flex flex-col items-center justify-center gap-[3.75rem]'
        onSubmit={handleSignUp}
      >
        <div className='flex w-[24.5rem] flex-col items-center justify-center gap-[1.125rem]'>
          {AUTH_FORM.INPUTS.SIGNUP.map((each) => {
            const currentMsg = statusMsg[each.ID];

            const isIdDuplicationVerifiedSuccess =
              each.ID === AUTH_FORM.FIELDS.USER_ID && isIdDuplicationVerified;
            const isPasswordMatchSuccess =
              each.ID === AUTH_FORM.FIELDS.PASSWORD_CONFIRM &&
              isPasswordMatched;

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
                    each.ID === AUTH_FORM.FIELDS.USER_ID && (
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
        <SubmitButton
          isActived={isActived.submit}
          value={AUTH_FORM.LABELS.SIGN_UP_ACTION}
        />
      </form>
    </>
  );
};

export default SignUpForm;
