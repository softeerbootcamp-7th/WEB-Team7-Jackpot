interface LabeledSelectInputProps {
  label: string;
  value: string | number;
  constantData?: string[];
  handleChange: (value: string | number) => void;
  handleDropdown: (isOpen: boolean) => void;
  isOpen: boolean;
  dropdownDirection: 'top' | 'bottom';
}

const LabeledSelectInput = ({
  label,
  value,
  constantData = [],
  handleChange,
  handleDropdown,
  isOpen,
  dropdownDirection = 'bottom',
}: LabeledSelectInputProps) => {
  const hasDropdown = constantData.length > 0;

  return (
    <div className='flex flex-col gap-3'>
      <div className='font-bold text-lg'>
        {label} <span className='text-red-600'>*</span>
      </div>

      <div className='relative inline-block'>
        <input
          type='text'
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className={`w-full bg-gray-50 px-5 py-[0.875rem] rounded-lg focus:outline-none relative ${isOpen ? 'z-20' : 'z-0'}`}
          onClick={() => handleDropdown?.(!isOpen)}
        />
        {hasDropdown && isOpen && (
          <>
            <div
              className='fixed inset-0 z-10 cursor-default'
              onClick={() => handleDropdown(false)}
            />
            <div
              className={`absolute z-20 w-full max-h-48 rounded-lg bg-white shadow-lg overflow-y-scroll select-none ${dropdownDirection === 'top' ? 'bottom-full mb-2' : 'mt-2'}`}
            >
              <div className='flex flex-col p-1 gap-1'>
                {constantData &&
                  constantData.map((name, index) => (
                    <button
                      type='button'
                      onClick={() => {
                        handleChange(name);
                        handleDropdown(false);
                      }}
                      key={index}
                      className='w-full text-left px-4 py-[0.875rem] text-[0.813rem] rounded-md text-gray-700 cursor-pointer font-medium hover:bg-gray-50 hover:text-gray-950 hover:font-bold focus:bg-gray-100 focus:text-gray-900 focus:outline-hidden'
                    >
                      {name}
                    </button>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LabeledSelectInput;
