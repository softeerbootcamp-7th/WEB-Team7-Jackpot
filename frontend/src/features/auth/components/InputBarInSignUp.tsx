import InputBar, {
  type InputBarProps,
} from '@/features/auth/components/InputBar';
import { AUTH_FORM } from '@/features/auth/constants';

interface InputBarInSignUpProps extends InputBarProps {
  label: string;
  helpMessage?: string;
  isSuccess?: boolean;
}

const InputBarInSignUp = ({
  label,
  helpMessage,
  isSuccess = false,
  ...inputBarProps
}: InputBarInSignUpProps) => {
  const isError = helpMessage && !isSuccess;

  return (
    <div className='flex w-full flex-col gap-3'>
      <div className='flex gap-[0.125rem]'>
        <div className='text-title-s font-bold text-gray-950'>{label}</div>
        <div className='text-title-s text-red-600'>{AUTH_FORM.REQUIRED_MARK}</div>
      </div>

      <InputBar
        className={`border ${
          isError ? 'border-red-500' : 'border-transparent'
        }`}
        {...inputBarProps}
      />

      {helpMessage && (
        <p
          className={`text-body-s mt-1 px-1 ${
            isSuccess ? 'text-blue-500' : 'text-red-500'
          }`}
        >
          {helpMessage}
        </p>
      )}
    </div>
  );
};

export default InputBarInSignUp;
