import { ReviewPageIcons } from '@/features/review/components/icons';
import type { TabType } from '@/features/review/types/review';

interface TabSelectorProps {
  tab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabSelector = ({ tab, onTabChange }: TabSelectorProps) => {
  return (
    <div className='flex h-12 w-full items-center rounded-2xl bg-gray-100 p-1'>
      <button
        type='button'
        onClick={() => onTabChange('revision')}
        className={`flex h-10 w-1/2 items-center justify-center gap-1.5 rounded-xl transition-all ${
          tab === 'revision'
            ? 'bg-white shadow-[0px_0px_10px_0px_rgba(41,41,41,0.06)]'
            : ''
        }`}
      >
        <ReviewPageIcons.PaperChipIcon active={tab === 'revision'} />
        <span
          className={`text-body-l ${
            tab === 'revision'
              ? 'font-bold text-gray-900'
              : 'font-normal text-gray-400'
          }`}
        >
          수정하기
        </span>
      </button>

      <button
        onClick={() => onTabChange('comment')}
        className={`flex h-10 w-1/2 items-center justify-center gap-1.5 rounded-xl transition-all ${
          tab === 'comment'
            ? 'bg-white shadow-[0px_0px_10px_0px_rgba(41,41,41,0.06)]'
            : ''
        }`}
      >
        <ReviewPageIcons.PenToolIcon active={tab === 'comment'} />
        <span
          className={`text-body-l ${
            tab === 'comment'
              ? 'font-bold text-gray-900'
              : 'font-normal text-gray-400'
          }`}
        >
          코멘트 추가하기
        </span>
      </button>
    </div>
  );
};

export default TabSelector;
