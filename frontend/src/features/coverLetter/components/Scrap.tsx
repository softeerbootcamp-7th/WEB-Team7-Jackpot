import { DeleteIcon } from '@/features/coverLetter/icons/Delete';

interface ScrapProps {
  deleteScrap: (id: number) => void;
}

const Scrap = ({ deleteScrap }: ScrapProps) => {
  const id = 1;

  return (
    <div className='flex flex-col items-start justify-start gap-3 self-stretch'>
      <div className='flex flex-col items-start justify-start self-stretch px-3'>
        <div
          data-name={id}
          className='flex w-96 flex-col items-start justify-start gap-3 border-b border-gray-100 px-3 py-5'
        >
          <div className='inline-flex items-center justify-between self-stretch pr-1'>
            <div className='flex flex-1 items-center justify-start gap-1'>
              <div className='flex items-center justify-center gap-1 rounded-md bg-blue-50 px-3 py-1.5'>
                <div className='justify-start text-xs leading-4 font-medium text-blue-600'>
                  기업명
                </div>
              </div>
              <div className='flex items-center justify-center gap-1 rounded-md bg-gray-50 px-3 py-1.5'>
                <div className='justify-start text-xs leading-4 font-medium text-gray-600'>
                  직무명
                </div>
              </div>
              <div className='flex items-center justify-center gap-1 rounded-md bg-gray-50 px-3 py-1.5'>
                <div className='justify-start text-xs leading-4 font-medium text-gray-600'>
                  모집 시즌
                </div>
              </div>
            </div>
            <button
              type='button'
              className='inline-flex h-6 w-6 items-center justify-center overflow-hidden'
              onClick={() => deleteScrap?.(id)}
            >
              <DeleteIcon />
            </button>
          </div>
          <div className='flex flex-col items-start justify-start gap-1 self-stretch'>
            <div className='inline-flex items-center justify-start gap-1 self-stretch'>
              <div className='line-clamp-2 max-h-12 flex-1 justify-start text-lg leading-6 font-bold text-gray-950'>
                본인의 성장과정을 간략히 기술하되 현재의 자신에게 가장 큰 영향을
                끼친 사건, 인물 등을 포함하여 기술하시기 바랍니다. (※작품속
                가상인물도 가능)
              </div>
            </div>
            <div className='text-caption-m line-clamp-2 max-h-10 justify-start self-stretch font-medium text-gray-600'>
              대학 시절, 교내 동아리의 운영진으로 활동하며 고질적인 전수 조사한
              경험이 있습니다. 당시 단순 친목 도모 위주의 활동이 고학년
              학생들에게는 매력적이지 않다는 점을 발견했고,{' '}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scrap;
