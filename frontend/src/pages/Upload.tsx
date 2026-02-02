import AddFileItem from '@/components/upload/AddFileItem';
import DocumentBoxIcon from '@/components/upload/icons/DocumentBoxIcon';
import FileUploadIcon from '@/components/upload/icons/FileUploadIcon';
import TextUploadIcon from '@/components/upload/icons/TextUploadIcon';
import StepItem from '@/components/upload/StepItem';

const UploadPage = () => {
  return (
    <div>
      <div className='w-full h-[5rem]'>헤더</div>
      <div className='px-[13.125rem]'>
        <div>
          <div className='mb-12'>
            <div className='flex w-full items-center gap-[0.625rem]'>
              <DocumentBoxIcon />
              <div className='font-bold text-gray-950 text-[1.75rem]'>
                자료 업로드
              </div>
            </div>
            <div className='font-normal text-gray-600 px-[2.875remx] text-lg'>
              회사별, 문항별로 나만의 자기소개서를 작성하고 관리할 수 있어요
            </div>
          </div>
          <StepItem />
        </div>
        <div className='flex flex-col gap-4 p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <button className='flex items-center gap-[0.375rem] px-[1.125rem] py-3 bg-purple-50 rounded-lg cursor-pointer'>
                <FileUploadIcon />
                <div className='text-purple-600 font-bold'>파일 업로드하기</div>
              </button>
              <button className='flex items-center gap-[0.375rem] px-[1.125rem] py-3 rounded-lg cursor-pointer'>
                <TextUploadIcon />
                <div className='text-gray-600 font-normal'>텍스트 붙여넣기</div>
              </button>
            </div>
            <div className='flex items-center gap-6'>
              <div className='flex items-center text-gray-400 gap-1 select-none'>
                <div>0</div>
                <div>/</div>
                <div>10MB</div>
              </div>
              <button className='bg-gray-50 px-[1.125rem] py-3 gap-[0.375rem] rounded-lg cursor-pointer'>
                <div className='text-lg text-gray-400'>AI 라벨링 시작</div>
              </button>
            </div>
          </div>
          <div className='flex justify-between'>
            {[0, 1, 2].map((i) => (
              <AddFileItem key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
