import { UploadPageIcons as I } from '@/features/upload/icons';

const AddFileItem = () => {
  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)}MB`;
  };
  return (
    <button className='flex h-[23.5rem] w-[25.5rem] cursor-pointer flex-col items-center justify-center gap-5 rounded-lg bg-gray-50'>
      <I.AddFileIcon />
      <div className='flex flex-col gap-2 text-center text-gray-400 select-none'>
        <div className='text-2xl font-bold'>
          이곳을 클릭하시거나,
          <br />
          영역 내로 파일을 드래그해주세요
        </div>
        <div className='text-[0.9375rem] font-normal'>
          pdf, docs 파일을 지원해요
        </div>
      </div>
    </button>
  );
};

export default AddFileItem;
