export interface InputBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  rightElement?: React.ReactNode;
}

const InputBar = ({ rightElement, className, ...props }: InputBarProps) => {
  return (
    <div className='relative w-full'>
      <input
        className={`w-full bg-gray-50 px-5 py-[0.875rem] rounded-lg ${className}`}
        {...props}
      />
      {rightElement && (
        <div className='absolute right-[0.75rem] top-1/2 -translate-y-1/2'>
          {rightElement}
        </div>
      )}
    </div>
  );
};

export default InputBar;
