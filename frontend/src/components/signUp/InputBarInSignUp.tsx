import type { InputBarProps } from '@/components/common/InputBar';
import InputBar from '@/components/common/InputBar';

interface InputBarInSignUpProps extends InputBarProps {
  hintText: string;
  helpMessage?: string;
  isSuccess?: boolean;
}

const InputBarInSignUp = ({
  hintText,
  helpMessage,
  isSuccess = false,
  ...inputBarProps
}: InputBarInSignUpProps) => {
  const isError = helpMessage && !isSuccess;

  return (
    <div className='flex flex-col w-full gap-3'>
      <div className='flex gap-[0.125rem]'>
        <div className='text-gray-950 font-bold text-lg'>{hintText}</div>
        <div className='text-red-600'>*</div>
      </div>

      <InputBar
        className={`border ${
          isError ? 'border-red-500' : 'border-transparent'
        }`}
        {...inputBarProps}
      />

      {helpMessage && (
        <p
          className={`text-xs mt-1 ps-1 ${
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
