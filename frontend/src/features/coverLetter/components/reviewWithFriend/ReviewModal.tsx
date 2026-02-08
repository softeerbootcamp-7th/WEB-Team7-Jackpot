import PaperChipIcon from '@/shared/icons/PaperChipIcon';
import PenToolIcon from '@/shared/icons/PenToolIcon';

const ReviewModal = () => {
  return (
    <div className='inline-flex w-96 flex-col items-start justify-start gap-5 rounded-[32px] p-5 shadow-[0px_0px_30px_0px_rgba(41,41,41,0.08)]'>
      <div className='flex flex-col items-start justify-start gap-4 self-stretch'>
        <div className='inline-flex items-center justify-start gap-3 self-stretch'>
          <div className='flex flex-1 items-center justify-start gap-2'>
            <div className='flex flex-1 items-center justify-start gap-2'>
              <div className='relative h-9 w-9 overflow-hidden rounded-[69.23px] bg-purple-50'>
                <div className='absolute top-[22.85px] left-[2.08px] h-8 w-8 rounded-full bg-purple-200' />
                <div className='absolute top-[8.31px] left-[11.77px] h-3 w-3 rounded-full bg-purple-200' />
              </div>
              <div className='text-Semantic-text-headline line-clamp-1 justify-start text-base leading-6 font-bold'>
                귀여운 캥거루
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-col items-start justify-start gap-4 self-stretch'>
          <div className='flex flex-col items-start justify-start gap-1 self-stretch'>
            <div className='inline-flex items-center justify-center gap-1.5'>
              <PaperChipIcon />
              <div className='text-Semantic-text-headline justify-start text-base leading-6 font-bold'>
                수정
              </div>
            </div>
            <div className='inline-flex items-center justify-center gap-2.5 self-stretch pl-6'>
              <div className='text-Primitive-Color-gray-gray-800 flex-1 justify-start text-sm leading-5 font-normal'>
                &apos;분석을 통한 개선&apos;입니다. 학창 시절부터 주어진 과제를
                수행하는 것에 그치지 않고, &quot;왜 이 방식이어야
                하는가?&quot;라는 의문을 갖고 프로세스를 개선하는 데
              </div>
            </div>
          </div>
          <div className='flex flex-col items-start justify-start gap-1 self-stretch'>
            <div className='inline-flex items-center justify-center gap-1.5'>
              <PenToolIcon />
              <div className='text-Semantic-text-headline justify-start text-base leading-6 font-bold'>
                코멘트
              </div>
            </div>
            <div className='inline-flex items-center justify-center gap-2.5 self-stretch pl-6'>
              <div className='text-Semantic-text-label-600 flex-1 justify-start text-sm leading-5 font-normal'>
                어휘가 적당하지 않고, 수식어가 많다는 느낌이 있어요!
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='inline-flex items-center justify-between self-stretch'>
        <div className='flex items-center justify-start gap-1.5'>
          <div className='flex h-7 w-7 items-center justify-center gap-1 rounded-[100px] bg-red-50 px-2 py-[5px]'>
            <PaperChipIcon />
          </div>
          <div className='flex h-7 w-7 items-center justify-center gap-1 rounded-[100px] bg-blue-50 px-2 py-[5px]'>
            <PenToolIcon />
          </div>
        </div>
        <div className='flex items-center justify-start gap-2'>
          <button
            type='button'
            className='flex cursor-pointer items-center justify-start gap-1 rounded-xl px-3 py-1.5'
          >
            <span className='text-center text-sm leading-5 font-medium text-red-600'>
              삭제하기
            </span>
          </button>
          <button
            type='button'
            className='flex cursor-pointer items-center justify-start gap-1 rounded-xl bg-gray-900 px-3 py-1.5'
          >
            <span className='text-center text-sm leading-5 font-bold text-white'>
              적용하기
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
