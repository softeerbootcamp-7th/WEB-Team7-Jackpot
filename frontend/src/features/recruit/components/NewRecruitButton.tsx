// [박소민] TODO: 공고 등록하기 버튼 최적화 memo 안되는 이유 찾기
import { memo } from 'react';

import { PlusIcon } from '@/shared/icons/Plus';

const NewRecruitButton = memo(({ onClick }: { onClick: () => void }) => {
  return (
    <button
      type='button'
      className='inline-flex cursor-pointer items-center justify-start gap-6'
      onClick={onClick}
    >
      <div className='flex items-center justify-center gap-1.5 rounded-lg bg-gray-900 py-3 pr-5 pl-4'>
        <PlusIcon className='h-6 w-6 text-white' />
        <div className='text-title-s justify-start text-center font-bold text-white'>
          새 공고 등록하기
        </div>
      </div>
    </button>
  );
});

NewRecruitButton.displayName = 'NewRecruitButton';

export default NewRecruitButton;
