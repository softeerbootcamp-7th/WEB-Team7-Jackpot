import type { InputBarProps } from '@/components/common/InputBar';
import InputBar from '@/components/common/InputBar';

interface InputBarInSignUpProps extends InputBarProps {
  hintText: string;
}

const InputBarInSignUp = ({
  hintText,
  ...inputBarProps
}: InputBarInSignUpProps) => {
  return (
    <div className='flex flex-col w-full gap-3'>
      <div className='flex gap-[0.125rem]'>
        <div className='text-gray-950 font-bold text-lg'>{hintText}</div>
        <div className='text-red-600'>*</div>
      </div>
      <InputBar {...inputBarProps} />
    </div>
  );
};

export default InputBarInSignUp;
