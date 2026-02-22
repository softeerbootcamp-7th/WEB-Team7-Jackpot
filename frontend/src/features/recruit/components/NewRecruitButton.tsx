import * as SI from '@/shared/icons';

const NewRecruitButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      type='button'
      className='inline-flex cursor-pointer items-center justify-start gap-6'
      onClick={onClick}
    >
      <div className='flex items-center justify-center gap-1.5 rounded-lg bg-gray-900 py-3 pr-5 pl-4'>
        <SI.PlusIcon className='h-6 w-6 text-white' />
        <div className='text-title-s justify-start text-center font-bold text-white'>
          새 공고 등록하기
        </div>
      </div>
    </button>
  );
};

export default NewRecruitButton;
