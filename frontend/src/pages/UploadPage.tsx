import { useState } from 'react';

import { useSearchParams } from 'react-router';

import ContentArea from '@/features/upload/components/ContentArea';
import StepItem from '@/features/upload/components/StepItem';
import UploadPageHeader from '@/features/upload/components/UploadPageHeader';

const UploadPage = () => {
  const [uploadTab, setUploadTab] = useState<'file' | 'text'>('file');
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStep: string = searchParams.get('step') || '1';
  const nextStep = (step: string) => {
    setSearchParams({ step: step });
  };
  return (
    <div>
      <div className='mb-12 px-75'>
        <div className='mb-12'>
          <UploadPageHeader />
          <StepItem step={currentStep} />
        </div>

        <ContentArea
          uploadTab={uploadTab}
          setUploadTab={setUploadTab}
          step={currentStep}
          nextStep={nextStep}
        />
      </div>
    </div>
  );
};

export default UploadPage;
