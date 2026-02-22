import * as CI from '@/features/coverLetter/icons';
import type { ScrapItem } from '@/features/coverLetter/types/coverLetter';
import * as SI from '@/shared/icons';

interface CardDetailProps {
  scrap: ScrapItem;
  onBack: () => void;
}

const SidebarCardDetail = ({ scrap, onBack }: CardDetailProps) => {
  const { companyName, jobPosition, applySeason, question, answer } = scrap;

  return (
    <div className='flex h-full w-full flex-col items-center gap-3'>
      <div className='flex shrink-0 flex-col gap-5 self-stretch'>
        <div className='flex w-full flex-col gap-1'>
          <div className='inline-flex items-center gap-1 self-stretch px-3'>
            <button
              type='button'
              onClick={onBack}
              className='flex h-7 w-7 cursor-pointer items-center justify-center'
              aria-label='뒤로가기'
            >
              <SI.RightArrow className='rotate-180' />
            </button>
            <div className='flex flex-1 items-center gap-2'>
              <CI.FileDocument />
              <div className='line-clamp-1 flex-1 text-lg leading-7 font-bold text-gray-950'>
                {applySeason} {companyName}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='flex min-h-0 flex-1 flex-col gap-3 self-stretch overflow-y-auto'>
        <div className='flex flex-col self-stretch px-3'>
          <div className='flex w-full flex-col gap-3 border-b border-gray-100 px-3 py-5'>
            <div className='inline-flex items-center self-stretch pr-1'>
              <div className='flex flex-1 items-center gap-1'>
                <div className='flex items-center justify-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5'>
                  <div className='text-xs leading-4 font-medium text-blue-600'>
                    {companyName}
                  </div>
                </div>
                <div className='flex items-center justify-center gap-1 rounded-xl bg-gray-50 px-3 py-1.5'>
                  <div className='text-xs leading-4 font-medium text-gray-600'>
                    {jobPosition}
                  </div>
                </div>
                <div className='flex items-center justify-center gap-1 rounded-xl bg-gray-50 px-3 py-1.5'>
                  <div className='text-xs leading-4 font-medium text-gray-600'>
                    {applySeason}
                  </div>
                </div>
              </div>
            </div>

            <div className='flex flex-col gap-2.5 self-stretch'>
              <div className='inline-flex items-center gap-1 self-stretch'>
                <div className='flex-1 text-lg leading-6 font-bold text-gray-950'>
                  {question}
                </div>
              </div>
              <div className='self-stretch text-sm leading-6 font-medium text-gray-600'>
                {answer}
              </div>
            </div>

            <div className='inline-flex items-center gap-0.5'>
              <div className='text-sm leading-5 font-medium text-gray-400'>
                {answer && `${answer.length}자`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarCardDetail;
