import TabButton from '@/features/upload/components/TabButton';
import { UPLOAD_TAB_DATA } from '@/features/upload/constants/uploadPage';
import { UploadPageIcons as I } from '@/features/upload/icons';
import type { FirstContentAreaHeaderProps } from '@/features/upload/types/upload';

const FirstContentAreaHeader = ({
  uploadTab,
  isContent,
  setIsContent= () => {},
  setUploadTab,
  nextStep,
}: FirstContentAreaHeaderProps) => {
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
                setIsContent(false)
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
            <div>0</div>
            <div>/</div>
            <div>10MB</div>
          </div>
        )}
        <button
          className='flex cursor-pointer gap-[0.375rem] rounded-lg bg-gray-50 px-[1.125rem] py-3'
          onClick={() => nextStep?.('2')}
        >
          <I.AILabelingIcon color='var(--color-gray-300)' size='24' />
          <div className='text-lg font-bold text-gray-400'>AI 라벨링 시작</div>
        </button>
      </div>
    </div>
  );
};

export default FirstContentAreaHeader;
