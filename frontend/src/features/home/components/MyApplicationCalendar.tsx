import CalendarIcon from '@/features/home/icons/CalendarIcon';
import RightArrow from '@/shared/icons/RightArrow';

const MyApplicationCalendar = () => {
  return (
    <div className='inline-flex w-96 flex-col items-start justify-start gap-6'>
      <div className='inline-flex items-center justify-between self-stretch'>
        <div className='flex items-center justify-start gap-2.5'>
          <div className='h-7 w-7'>
            <CalendarIcon />
          </div>
          <div className='justify-start text-xl leading-9 font-bold text-gray-950'>
            나의 지원 캘린더
          </div>
        </div>
        <RightArrow size='lg' />
      </div>
      <div className='flex flex-col items-start justify-start gap-1 self-stretch'>
        <div className='inline-flex items-center justify-between self-stretch'>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-center rounded-[125px] px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-rose-400'>
              일
            </div>
          </div>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-center rounded-[125px] px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950'>
              월
            </div>
          </div>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-center rounded-[125px] px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950'>
              화
            </div>
          </div>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-center rounded-[125px] px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950'>
              수
            </div>
          </div>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-center rounded-[125px] px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950'>
              목
            </div>
          </div>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-center rounded-[125px] px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950'>
              금
            </div>
          </div>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-center rounded-[125px] px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-blue-500'>
              토
            </div>
          </div>
        </div>
        <div className='inline-flex items-center justify-between self-stretch'>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-end gap-1.5 rounded-2xl px-4 py-1 opacity-40'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950 opacity-40'>
              1
            </div>
            <div className='h-[5px] w-[5px] rounded-full bg-gray-950 opacity-40' />
          </div>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-end gap-1.5 rounded-2xl px-4 py-1 opacity-40'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950 opacity-40'>
              2
            </div>
            <div className='h-[5px] w-[5px] rounded-full opacity-40' />
          </div>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-end gap-1.5 rounded-2xl px-4 py-1 opacity-40'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950 opacity-40'>
              3
            </div>
            <div className='h-[5px] w-[5px] rounded-full bg-gray-950 opacity-40' />
          </div>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-end gap-1.5 rounded-2xl bg-purple-50 px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-semibold text-purple-500'>
              4
            </div>
            <div className='h-[5px] w-[5px] rounded-full' />
          </div>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-end gap-1.5 rounded-2xl px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950'>
              5
            </div>
            <div className='h-[5px] w-[5px] rounded-full' />
          </div>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-end gap-1.5 rounded-2xl px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950'>
              6
            </div>
            <div className='h-[5px] w-[5px] rounded-full' />
          </div>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-end gap-1.5 rounded-2xl px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950'>
              7
            </div>
            <div className='h-[5px] w-[5px] rounded-full bg-purple-500' />
          </div>
        </div>
        <div className='inline-flex items-center justify-between self-stretch'>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-end gap-1.5 rounded-2xl px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950'>
              8
            </div>
            <div className='h-[5px] w-[5px] rounded-full bg-purple-500' />
          </div>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-end gap-1.5 rounded-2xl px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950'>
              9
            </div>
            <div className='h-[5px] w-[5px] rounded-full' />
          </div>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-end gap-1.5 rounded-2xl px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950'>
              10
            </div>
            <div className='h-[5px] w-[5px] rounded-full' />
          </div>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-end gap-1.5 rounded-2xl px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950'>
              11
            </div>
            <div className='h-[5px] w-[5px] rounded-full bg-purple-500' />
          </div>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-end gap-1.5 rounded-2xl px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950'>
              12
            </div>
            <div className='h-[5px] w-[5px] rounded-full' />
          </div>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-end gap-1.5 rounded-2xl px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950'>
              13
            </div>
            <div className='h-[5px] w-[5px] rounded-full' />
          </div>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-end gap-1.5 rounded-2xl px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950'>
              14
            </div>
            <div className='h-[5px] w-[5px] rounded-full bg-purple-500' />
          </div>
        </div>
        <div className='inline-flex items-center justify-between self-stretch'>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-end gap-1.5 rounded-2xl px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950'>
              15
            </div>
            <div className='h-[5px] w-[5px] rounded-full bg-purple-500' />
          </div>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-end gap-1.5 rounded-2xl px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950'>
              16
            </div>
            <div className='h-[5px] w-[5px] rounded-full' />
          </div>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-end gap-1.5 rounded-2xl px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950'>
              17
            </div>
            <div className='h-[5px] w-[5px] rounded-full' />
          </div>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-end gap-1.5 rounded-2xl px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950'>
              18
            </div>
            <div className='h-[5px] w-[5px] rounded-full' />
          </div>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-end gap-1.5 rounded-2xl px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950'>
              19
            </div>
            <div className='h-[5px] w-[5px] rounded-full' />
          </div>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-end gap-1.5 rounded-2xl px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950'>
              20
            </div>
            <div className='h-[5px] w-[5px] rounded-full bg-purple-500' />
          </div>
          <div className='inline-flex h-12 w-12 flex-col items-center justify-end gap-1.5 rounded-2xl px-4 py-1'>
            <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950'>
              21
            </div>
            <div className='h-[5px] w-[5px] rounded-full' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyApplicationCalendar;
