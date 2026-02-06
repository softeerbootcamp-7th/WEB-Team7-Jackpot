import { UploadPageIcons as I } from '@/features/upload/icons';

const AddFileItem = () => {
  return (
    <button className='w-[25.5rem] h-[23.5rem] flex flex-col justify-center items-center rounded-lg bg-gray-50 gap-5 cursor-pointer'>
      <I.AddFileIcon />
      <div className='flex flex-col text-center text-gray-400 gap-2 select-none'>
        <div className='font-bold text-2xl'>
          이곳을 클릭하시거나,
          <br />
          영역 내로 파일을 드래그해주세요
        </div>
        <div className='font-normal text-[0.9375rem]'>
          pdf, docs 파일을 지원해요
        </div>
      </div>
    </button>
  );
};

export default AddFileItem;
