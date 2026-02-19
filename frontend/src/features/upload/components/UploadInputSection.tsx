import { useState } from 'react';

import { useNavigate } from 'react-router';

import UploadFileArea from '@/features/upload/components/UploadFileArea';
import UploadInputHeader from '@/features/upload/components/UploadInputHeader';

const UploadInputSection = () => {
  const navigate = useNavigate();

  const handleNextStep = () => {
    navigate('/upload/labeling', { replace: true });
  };

  const [isContent, setIsContent] = useState<boolean>(false);
  return (
    <div className='flex flex-col gap-6'>
      <UploadInputHeader
        isContent={isContent}
        nextStep={handleNextStep}
      />
      <UploadFileArea setIsContent={setIsContent} />
    </div>
  );
};

export default UploadInputSection;
