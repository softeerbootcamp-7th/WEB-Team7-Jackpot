import FirstContentAreaHeader from '@/components/upload/FirstContentAreaHeader';
import UploadFileArea from '@/components/upload/UploadFileArea';
import UploadTextArea from '@/components/upload/UploadTextArea';

import type { FirstContentAreaHeaderProps } from '@/types/upload';

import SecondContentAreaHeader from './SecondContentAreaHeader';

const ContentArea = ({
  uploadTab,
  setUploadTab,
  step,
  nextStep,
}: FirstContentAreaHeaderProps) => {
  return (
    <div className='flex flex-col gap-4 p-6 border border-gray-100 rounded-2xl'>
      {step === '1' && (
        <>
          <FirstContentAreaHeader
            uploadTab={uploadTab}
            setUploadTab={setUploadTab}
            nextStep={nextStep}
          />
          {uploadTab === 'file' ? <UploadFileArea /> : <UploadTextArea />}
        </>
      )}
      {step === '2' && <SecondContentAreaHeader />}
      {step === '3' && <>3</>}
    </div>
  );
};
export default ContentArea;
