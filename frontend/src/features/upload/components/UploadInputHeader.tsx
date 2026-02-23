import TabButton from '@/features/upload/components/TabButton';
import { UPLOAD_TAB_DATA } from '@/features/upload/constants/uploadPage';
import * as UI from '@/features/upload/icons';

interface UploadInputHeaderProps {
  isContent: boolean;
  nextStep: () => void;
}

const UploadInputHeader = ({ isContent, nextStep }: UploadInputHeaderProps) => {
  const canLabeling = isContent;

  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <TabButton
          icon={UPLOAD_TAB_DATA[0].icon}
          label={UPLOAD_TAB_DATA[0].label}
        />
        <a
          href='/files/coverLetterSamples.zip'
          download='자기소개서 샘플 압축.zip'
          className='flex items-center gap-[0.375rem] rounded-lg bg-gray-50 px-[1.125rem] py-3 text-gray-600 transition-colors hover:bg-gray-100'
        >
          {UPLOAD_TAB_DATA[1].icon}
          <div className='font-bold'>{UPLOAD_TAB_DATA[1].label}</div>
        </a>
      </div>

      <div className='flex items-center gap-6'>
        <button
          className='text-title-s flex cursor-pointer gap-[0.375rem] rounded-lg bg-gray-900 px-[1.125rem] py-3 font-bold text-white disabled:cursor-default disabled:bg-gray-50 disabled:text-gray-400'
          onClick={nextStep}
          disabled={!canLabeling}
        >
          <UI.AILabelingIcon
            color={canLabeling ? 'white' : 'var(--color-gray-300)'}
            size='24'
          />
          <div>AI 라벨링 시작</div>
        </button>
      </div>
    </div>
  );
};

export default UploadInputHeader;
