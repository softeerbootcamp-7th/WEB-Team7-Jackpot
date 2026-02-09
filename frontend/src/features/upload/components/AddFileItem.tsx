import documentIcon from '@/assets/icons/documentIcon.svg';
import { UploadPageIcons as I } from '@/features/upload/icons';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface AddFileItemProps {
  file: File | null;
  uploadStatus?: UploadStatus;
  onFileChange: (newFile: File | null) => void;
}

const AddFileItem = ({
  file,
  uploadStatus = 'idle',
  onFileChange,
}: AddFileItemProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileChange(selectedFile);
    }
    e.target.value = '';
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFileChange(null);
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)}MB`;
  };

  const getStatusUI = () => {
    switch (uploadStatus) {
      case 'uploading':
        return { text: null, color: 'text-gray-400' };
      case 'error':
        return { text: '업로드 실패', color: 'text-red-600' };
      case 'success':
        return { text: '업로드 완료!', color: 'text-green-500' };
      case 'idle':
      default:
        return { text: '업로드 대기', color: 'text-gray-400' };
    }
  };

  const statusUI = getStatusUI();

  return (
    <>
      <label
        className={`relative flex h-[23.5rem] w-full flex-col items-center justify-center gap-5 overflow-hidden rounded-lg transition-all duration-500 ease-in-out ${file ? '' : 'cursor-pointer bg-gray-50'}`}
      >
        <input
          type='file'
          className='hidden'
          onChange={handleInputChange}
          accept='.pdf,.doc,.docx'
          disabled={!!file}
        />
        {file ? (
          <div
            key='file-content'
            className='animate-enter flex h-full w-full flex-col items-center justify-center'
          >
            <button
              type='button'
              onClick={handleRemove}
              className='absolute top-5 right-5 z-10 cursor-pointer p-2'
            >
              <I.FileRemoveIcon />
            </button>

            <div className='flex w-full flex-col items-center justify-center gap-5 select-none'>
              <div className='relative flex h-[120px] w-24 items-center justify-center'>
                <img
                  src={documentIcon}
                  className={`h-full w-full object-contain transition-opacity duration-300 ${uploadStatus === 'error' ? 'opacity-50' : 'opacity-100'}`}
                />
              </div>
              <div className='flex w-full flex-col gap-1 text-center'>
                <span
                  className={`text-title-l w-full truncate px-4 font-bold ${
                    uploadStatus === 'error' ? 'text-gray-300' : 'text-gray-950'
                  }`}
                  title={file.name}
                >
                  {file.name}
                </span>
                <div className='text-body-l flex h-12 flex-col gap-1'>
                  <span
                    className={
                      uploadStatus === 'error'
                        ? 'text-gray-300'
                        : 'text-gray-400'
                    }
                  >
                    {formatFileSize(file.size)}
                  </span>
                  {uploadStatus === 'uploading' ? (
                    <div className='delay-show flex items-center gap-2 text-gray-400'>
                      <svg
                        className='h-5 w-5 animate-spin text-indigo-500'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        ></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                      </svg>
                      <span>업로드 중...</span>
                    </div>
                  ) : (
                    <span className={`font-medium ${statusUI.color}`}>
                      {statusUI.text}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            key='empty-content'
            className='animate-enter flex flex-col items-center gap-5'
          >
            <I.AddFileIcon />
            <div className='animate-enter flex flex-col gap-2 text-center text-gray-400 select-none'>
              <div className='text-2xl font-bold'>
                이곳을 클릭하시거나,
                <br />
                영역 내로 파일을 드래그해주세요
              </div>
              <div className='text-[0.9375rem] font-normal'>
                pdf, docs 파일을 지원해요
              </div>
            </div>
          </div>
        )}
      </label>
    </>
  );
};

export default AddFileItem;
