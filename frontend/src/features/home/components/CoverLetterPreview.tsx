import fileIcon from '/images/file.svg';

const CoverLetterPreview = () => {
  return (
    <div className='flex-1 pl-9 pr-6 py-6 rounded-2xl outline outline-1 outline-offset-[-1px] outline-gray-100 flex justify-start items-center gap-9'>
      <img src={fileIcon} className='w-14 h-16' alt='' aria-hidden='true' />
      <div className='flex-1 inline-flex flex-col justify-start items-start gap-2'>
        <div className='inline-flex justify-end items-start gap-1'>
          <div className='self-stretch justify-start text-gray-950 text-lg font-bold  leading-7 line-clamp-1'>
            토스 - 프로덕트 디자이너
          </div>
        </div>
        <div className='flex flex-wrap gap-1 max-h-[60px] overflow-hidden'>
          <div className='px-3 py-1.5 bg-blue-50 rounded-xl flex justify-center items-center'>
            <div className='text-blue-600 text-xs font-medium leading-4'>
              토스
            </div>
          </div>
          <div className='px-3 py-1.5 bg-gray-50 rounded-xl flex justify-center items-center'>
            <div className='text-gray-600 text-xs font-medium leading-4'>
              프로덕트 디자이너
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterPreview;
