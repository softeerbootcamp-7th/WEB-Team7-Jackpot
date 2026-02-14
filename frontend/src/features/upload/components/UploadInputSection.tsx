import { useState } from 'react';

import { useNavigate } from 'react-router';

import UploadFileArea from '@/features/upload/components/UploadFileArea';
import UploadInputHeader from '@/features/upload/components/UploadInputHeader';

const UploadInputSection = () => {
  const navigate = useNavigate();

  const hanldeNextStep = () => {
    navigate('/upload/labeling', { replace: true });
  };

  const [isContent, setIsContent] = useState<boolean>(false);
  const [totalSize, setTotalSize] = useState<number>(0);
  return (
    <div className='flex flex-col gap-6'>
      <UploadInputHeader
        isContent={isContent}
        totalSize={totalSize}
        nextStep={hanldeNextStep}
      />
      <UploadFileArea setIsContent={setIsContent} setTotalSize={setTotalSize} />
    </div>
  );
};

export default UploadInputSection;
