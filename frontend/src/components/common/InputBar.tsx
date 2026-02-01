export interface InputBarProps {
  type: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputBar = ({
  type,
  placeholder,
  onChange,
}: InputBarProps) => {
  return (
    <input
      className='w-full bg-gray-50 px-5 py-[0.875rem] rounded-lg'
      type={type}
      placeholder={placeholder}
      onChange={onChange}
    />
  );
};

export default InputBar;
