export interface InputBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  rightElement?: React.ReactNode;
}

const InputBar = ({ rightElement, className, ...props }: InputBarProps) => {
  return (
    <div className='relative w-full'>
      <input
        className={`w-full rounded-lg bg-gray-50 px-5 py-[0.875rem] outline-none ${className}`}
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
