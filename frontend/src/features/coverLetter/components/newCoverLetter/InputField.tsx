interface InputFieldType {
  title: string;
  placeholder: string;
}

const InputField = ({ title, placeholder }: InputFieldType) => {
  return (
    <div className='flex flex-col items-start justify-start gap-3 self-stretch'>
      <div className='inline-flex items-center justify-start gap-0.5 self-stretch'>
        <div className='text-title-s justify-start font-bold text-gray-950'>
          {title}
        </div>
        <div className='text-title-s justify-start font-bold text-red-600'>
          *
        </div>
      </div>
      <div className='inline-flex h-12 items-center justify-start gap-2 self-stretch rounded-lg bg-gray-50 px-5 py-3.5'>
        <input
          type='text'
          aria-label={title}
          required
          aria-required='true'
          className='text-body-s line-clamp-1 flex-1 justify-start font-normal text-gray-400'
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default InputField;
