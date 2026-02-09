import TabButton from '@/features/upload/components/TabButton';
import { UPLOAD_TAB_DATA } from '@/features/upload/constants/uploadPage';
import { MAX_BYTES } from '@/features/upload/constants/uploadPage';
import { UploadPageIcons as I } from '@/features/upload/icons';
import type { FirstContentAreaHeaderProps } from '@/features/upload/types/upload';
import { formatFileSize } from '@/features/upload/utils/formatFileSize';

const FirstContentAreaHeader = ({
  uploadTab,
  isContent,
  totalSize,
  setIsContent = () => {},
  setUploadTab,
  nextStep,
}: FirstContentAreaHeaderProps) => {
  const isOverSize =
    uploadTab === 'file' && !!totalSize && totalSize > MAX_BYTES;
  const canLabeling = isContent && !isOverSize;

  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center'>
        {UPLOAD_TAB_DATA.map((data) => (
          <TabButton
            key={data.targetTab}
            isActived={uploadTab === data.targetTab}
            onClick={() => {
              if (
                !isContent ||
                window.confirm('탭 전환을 하면 업로드한 내용이 사라집니다.')
              ) {
                setIsContent(false);
                setUploadTab(data.targetTab);
              }
            }}
            icon={data.icon}
            label={data.label}
          />
        ))}
      </div>
      <div className='flex items-center gap-6'>
        {uploadTab === 'file' && (
          <div className='flex items-center gap-1 text-gray-400 select-none'>
            <span
              className={
                totalSize && totalSize > MAX_BYTES ? 'text-red-600' : ''
              }
            >
              {formatFileSize(totalSize ?? 0)}
            </span>
            <span>/</span>
            <span>10MB</span>
          </div>
        )}
        <button
          className='text-title-s flex cursor-pointer gap-[0.375rem] rounded-lg bg-gray-900 px-[1.125rem] py-3 font-bold text-white disabled:cursor-default disabled:bg-gray-50 disabled:text-gray-400'
          onClick={() => nextStep?.('2')}
          disabled={!canLabeling}
        >
          <I.AILabelingIcon
            color={canLabeling ? 'white' : 'var(--color-gray-300)'}
            size='24'
          />
          <div>AI 라벨링 시작</div>
        </button>
      </div>
    </div>
  );
};

export default FirstContentAreaHeader;
