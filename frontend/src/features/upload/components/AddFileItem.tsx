import { useId, useState } from 'react';

import documentIcon from '@/assets/icons/documentIcon.svg';
import * as UI from '@/features/upload/icons';
import type { UploadStatus } from '@/features/upload/types/upload';
import { formatFileSize } from '@/features/upload/utils/formatFileSize';

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
  const inputId = useId();
  // 3단계: AddFileItem 드래그 드롭 구현
  // 3-2. 상태 변수: isDragOver - 드래그 오버 상태 표시
  const [isDragOver, setIsDragOver] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileChange(selectedFile);
    }
    e.target.value = '';
  };

  const handleRemove = () => {
    onFileChange(null);
  };

  // 3-1. Drag & Drop 이벤트 핸들러
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      onFileChange(droppedFile);
    }
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
  const containerStyle = `relative flex h-[23.5rem] w-full flex-col items-center justify-center gap-5 overflow-hidden rounded-lg transition-all duration-500 ease-in-out ${file ? '' : 'cursor-pointer bg-gray-50'}`;

  return (
    <>
      <input
        id={inputId}
        type='file'
        className='hidden'
        onChange={handleInputChange}
        accept='.pdf'
        disabled={!!file}
      />
      {file ? (
        <div className={`animate-enter ${containerStyle}`}>
          <button
            type='button'
            onClick={handleRemove}
            className='absolute top-5 right-5 z-10 cursor-pointer p-2'
          >
            <UI.FileRemoveIcon />
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
                    uploadStatus === 'error' ? 'text-red-600' : 'text-gray-400'
                  }
                >
                  {formatFileSize(file.size)}
                </span>
                {uploadStatus === 'uploading' ? (
                  <div className='delay-show flex items-center gap-2 text-gray-400'>
                    <UI.LoadingSpinnerIcon />
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
        <label
          // 3-3. UI 피드백: 드래그 오버 시 배경 색상 변경 (blue-50), 테두리 표시
          className={`hover-float-up relative flex h-[23.5rem] w-full flex-col items-center justify-center gap-5 overflow-hidden rounded-lg transition-all duration-500 ease-in-out ${file ? '' : 'cursor-pointer bg-gray-50'} ${
            isDragOver ? 'bg-blue-50 ring-2 ring-blue-400' : ''
          }`}
          htmlFor={inputId}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div
            key='empty-content'
            className='animate-enter flex flex-col items-center gap-5'
          >
            <UI.AddFileIcon />
            <div className='animate-enter flex flex-col gap-2 text-center text-gray-400 select-none'>
              <div className='text-2xl font-bold'>
                이곳을 클릭하시거나,
                <br />
                영역 내로 파일을 드래그해주세요
              </div>
              <div className='text-[0.9375rem] font-normal'>
                pdf 파일을 지원해요
              </div>
            </div>
          </div>
        </label>
      )}
    </>
  );
};

export default AddFileItem;
