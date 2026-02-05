import { useState } from 'react';

import { useSearchParams } from 'react-router';

import PageGlobalHeader from '@/components/common/PageGlobalHeader';
import ContentArea from '@/components/upload/ContentArea';
import StepItem from '@/components/upload/StepItem';
import UploadPageHeader from '@/components/upload/UploadPageHeader';

const UploadPage = () => {
  const [uploadTab, setUploadTab] = useState<'file' | 'text'>('file');
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStep: string = searchParams.get('step') || '1';
  const nextStep = (step: string) => {
    setSearchParams({ step: step });
  };
  return (
    <div>
      <PageGlobalHeader />
      <div className='px-[13.125rem] mb-12'>
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
