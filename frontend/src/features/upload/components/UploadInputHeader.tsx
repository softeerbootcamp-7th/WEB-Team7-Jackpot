import TabButton from '@/features/upload/components/TabButton';
import { UPLOAD_TAB_DATA } from '@/features/upload/constants/uploadPage';
import { MAX_BYTES } from '@/features/upload/constants/uploadPage';
import { UploadPageIcons as UI } from '@/features/upload/icons';
import { formatFileSize } from '@/features/upload/utils/formatFileSize';

interface UploadInputHeaderProps {
  totalSize: number;
  isContent: boolean;
  nextStep: () => void;
}

const UploadInputHeader = ({
  isContent,
  totalSize,
  nextStep,
}: UploadInputHeaderProps) => {
  const isOverSize = !!totalSize && totalSize > MAX_BYTES;
  const canLabeling = isContent && !isOverSize;

  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center'>
        <TabButton
          icon={UPLOAD_TAB_DATA[0].icon}
          label={UPLOAD_TAB_DATA[0].label}
        />
      </div>
      <div className='flex items-center gap-6'>
        <div className='flex items-center gap-1 text-gray-400 select-none'>
          <span className={isOverSize ? 'text-red-600' : ''}>
            {formatFileSize(totalSize ?? 0)}
          </span>
          <span>/</span>
          <span>10MB</span>
        </div>

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
