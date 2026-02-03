import { UploadPageIcons } from '@/components/upload/icons/index';
import TabButton from '@/components/upload/TabButton';

import type { ContentAreaHeaderProps } from '@/types/upload';

interface TabDataType {
  label: string;
  targetTab: 'file' | 'text';
  icon: React.ReactNode;
}

const ContentAreaHeader = ({
  uploadTab,
  setUploadTab,
}: ContentAreaHeaderProps) => {
  const tabData: TabDataType[] = [
    {
      label: '파일 업로드하기',
      targetTab: 'file',
      icon: <UploadPageIcons.FileUploadIcon />,
    },
    {
      label: '텍스트 붙여넣기',
      targetTab: 'text',
      icon: <UploadPageIcons.TextUploadIcon />,
    },
  ];

  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center'>
        {tabData.map((data) => (
          <TabButton
            key={data.targetTab}
            isActived={uploadTab === data.targetTab}
            onClick={() => setUploadTab(data.targetTab)}
            icon={data.icon}
            label={data.label}
          />
        ))}
      </div>
      <div className='flex items-center gap-6'>
        {uploadTab === 'file' && (
          <div className='flex items-center text-gray-400 gap-1 select-none'>
            <div>0</div>
            <div>/</div>
            <div>10MB</div>
          </div>
        )}
        <button className='bg-gray-50 px-[1.125rem] py-3 gap-[0.375rem] rounded-lg cursor-pointer'>
          <div className='text-lg font-bold text-gray-400'>AI 라벨링 시작</div>
        </button>
      </div>
    </div>
  );
};

export default ContentAreaHeader;
