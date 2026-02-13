import type { ReactNode } from 'react';

import { ChevronLeftIcon } from '@/features/library/icons/ChevronLeft';
import { FolderIcon } from '@/features/library/icons/Folder';

// 제네릭 <T>를 사용하여 어떤 타입의 데이터 배열이든 받을 수 있게 합니다.
type DocumentListProps<T> = {
  className?: string;
  title: string; // '현대자동차', qnAName 등 동적으로 변하는 제목
  items: T[]; // 데이터 배열 (questions 또는 coverLetters)
  onBack: () => void; // 뒤로가기 버튼 액션
  renderItem: (item: T) => ReactNode; // 각 아이템을 어떻게 렌더링할지 결정하는 함수
};

const DocumentList = <T,>({
  className = '',
  title,
  items,
  onBack,
  renderItem,
}: DocumentListProps<T>) => {
  return (
    <div className={`w-full ${className}`}>
      <div className='inline-flex items-center justify-start gap-1 self-stretch px-3'>
        <button type='button' aria-label='목록으로 돌아가기' onClick={onBack}>
          <ChevronLeftIcon />
        </button>
        <div className='flex flex-1 items-center justify-start gap-2'>
          <div className='h-7 w-7'>
            <FolderIcon />
          </div>
          <div className='text-title-m line-clamp-1 flex-1 justify-start font-bold text-gray-950'>
            {title}
          </div>
        </div>
      </div>

      <div>{items.map((item) => renderItem(item))}</div>
    </div>
  );
};

export default DocumentList;
