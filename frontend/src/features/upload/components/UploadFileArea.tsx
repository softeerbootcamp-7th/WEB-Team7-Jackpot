import { useEffect, useState } from 'react';

import AddFileItem from '@/features/upload/components/AddFileItem';
import { MAX_BYTES } from '@/features/upload/constants/uploadPage';
import type { UploadStatus } from '@/features/upload/types/upload';

interface FileStateType {
  file: File | null;
  status: UploadStatus;
}

interface UploadFileLayoutProps {
  setIsContent: (state: boolean) => void;
  setTotalSize: (state: number) => void;
}

const UploadFileLayout = ({
  setIsContent,
  setTotalSize,
}: UploadFileLayoutProps) => {
  const [files, setFiles] = useState<FileStateType[]>([
    { file: null, status: 'idle' },
    { file: null, status: 'idle' },
    { file: null, status: 'idle' },
  ]);

  const validateFile = (newFile: File | null) => {
    const ALLOWED_TYPES = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf',
      'application/msword',
    ];

    // 파일 크기 검사
    if (newFile && newFile.size > MAX_BYTES) {
      return 'error';
    }

    // 파일 확장자 검사
    if (newFile && !ALLOWED_TYPES.includes(newFile.type)) {
      return 'error';
    }
    return 'success';
  };

  const handleFileChange = (index: number, newFile: File | null) => {
    setFiles((prev) => {
      const newFiles = [...prev];

      // 파일 삭제 시 초기화
      if (!newFile) {
        newFiles[index] = { file: null, status: 'idle' };
      }

      // 파일 유효성을 기반으로 저장
      const status = validateFile(newFile);
      newFiles[index] = { file: newFile, status: status };

      return newFiles;
    });
  };

  useEffect(() => {
    const currentTotalSize = files.reduce(
      (acc, curr) => (acc += curr.file?.size ?? 0),
      0,
    );
    setTotalSize(currentTotalSize);
    const hasContent = files.some(
      (file) => file.file !== null && file.status === 'success',
    );
    setIsContent(hasContent);
  }, [files, setIsContent, setTotalSize]);

  return (
    <div className='flex justify-between gap-3'>
      {files.map((file, index) => (
        <AddFileItem
          key={index}
          file={file.file}
          uploadStatus={file.status}
          onFileChange={(newFile) => handleFileChange(index, newFile)}
        />
      ))}
    </div>
  );
};

export default UploadFileLayout;
