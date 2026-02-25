export interface InputBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  rightElement?: React.ReactNode;
  isFail?: boolean;
}

const InputBar = ({
  rightElement,
  className,
  isFail,
  ...props
}: InputBarProps) => {
  return (
    <div className='relative w-full'>
      <input
        autoComplete='off'
        className={`w-full rounded-lg border bg-gray-50 px-5 py-[0.875rem] transition-colors duration-200 outline-none focus:placeholder:text-transparent ${className ?? ''} ${isFail ? 'border-red-600' : 'border-transparent'}`}
        {...props}
      />
      {rightElement && (
        <div className='absolute top-1/2 right-[0.75rem] -translate-y-1/2'>
          {rightElement}
        </div>
      )}
    </div>
  );
};

export default InputBar;
