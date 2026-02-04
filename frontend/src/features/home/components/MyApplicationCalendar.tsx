import CalendarIcon from '@/features/home/components/icons/CalendarIcon';
import RightArrow from '@/features/home/components/icons/RightArrow';

const MyApplicationCalendar = () => {
  return (
    <div className='w-96 inline-flex flex-col justify-start items-start gap-6'>
      <div className='self-stretch inline-flex justify-between items-center'>
        <div className='flex justify-start items-center gap-2.5'>
          <div className='w-7 h-7 relative'>
            <CalendarIcon />
          </div>
          <div className='justify-start text-gray-950 text-xl font-bold  leading-9'>
            나의 지원 캘린더
          </div>
        </div>
        <RightArrow size='lg' />
      </div>
      <div className='self-stretch flex flex-col justify-start items-start gap-1'>
        <div className='self-stretch inline-flex justify-between items-center'>
          <div className='w-12 h-12 px-4 py-1 rounded-[125px] inline-flex flex-col justify-center items-center'>
            <div className='w-6 h-5 text-center justify-center text-rose-400 text-xl font-normal  leading-4'>
              일
            </div>
          </div>
          <div className='w-12 h-12 px-4 py-1 rounded-[125px] inline-flex flex-col justify-center items-center'>
            <div className='w-6 h-5 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              월
            </div>
          </div>
          <div className='w-12 h-12 px-4 py-1 rounded-[125px] inline-flex flex-col justify-center items-center'>
            <div className='w-6 h-5 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              화
            </div>
          </div>
          <div className='w-12 h-12 px-4 py-1 rounded-[125px] inline-flex flex-col justify-center items-center'>
            <div className='w-6 h-5 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              수
            </div>
          </div>
          <div className='w-12 h-12 px-4 py-1 rounded-[125px] inline-flex flex-col justify-center items-center'>
            <div className='w-6 h-5 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              목
            </div>
          </div>
          <div className='w-12 h-12 px-4 py-1 rounded-[125px] inline-flex flex-col justify-center items-center'>
            <div className='w-6 h-5 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              금
            </div>
          </div>
          <div className='w-12 h-12 px-4 py-1 rounded-[125px] inline-flex flex-col justify-center items-center'>
            <div className='w-6 h-5 text-center justify-center text-blue-500 text-xl font-normal  leading-4'>
              토
            </div>
          </div>
        </div>
        <div className='self-stretch inline-flex justify-between items-center'>
          <div className='w-12 h-12 px-4 py-1 opacity-40 rounded-2xl inline-flex flex-col justify-end items-center gap-1.5'>
            <div className='w-6 h-5 opacity-40 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              1
            </div>
            <div className='w-[5px] h-[5px] opacity-40 bg-gray-950 rounded-full' />
          </div>
          <div className='w-12 h-12 px-4 py-1 opacity-40 rounded-2xl inline-flex flex-col justify-end items-center gap-1.5'>
            <div className='w-6 h-5 opacity-40 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              2
            </div>
            <div className='w-[5px] h-[5px] opacity-40 rounded-full' />
          </div>
          <div className='w-12 h-12 px-4 py-1 opacity-40 rounded-2xl inline-flex flex-col justify-end items-center gap-1.5'>
            <div className='w-6 h-5 opacity-40 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              3
            </div>
            <div className='w-[5px] h-[5px] opacity-40 bg-gray-950 rounded-full' />
          </div>
          <div className='w-12 h-12 px-4 py-1 bg-purple-50 rounded-2xl inline-flex flex-col justify-end items-center gap-1.5'>
            <div className='w-6 h-5 text-center justify-center text-purple-500 text-xl font-semibold  leading-4'>
              4
            </div>
            <div className='w-[5px] h-[5px] rounded-full' />
          </div>
          <div className='w-12 h-12 px-4 py-1 rounded-2xl inline-flex flex-col justify-end items-center gap-1.5'>
            <div className='w-6 h-5 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              5
            </div>
            <div className='w-[5px] h-[5px] rounded-full' />
          </div>
          <div className='w-12 h-12 px-4 py-1 rounded-2xl inline-flex flex-col justify-end items-center gap-1.5'>
            <div className='w-6 h-5 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              6
            </div>
            <div className='w-[5px] h-[5px] rounded-full' />
          </div>
          <div className='w-12 h-12 px-4 py-1 rounded-2xl inline-flex flex-col justify-end items-center gap-1.5'>
            <div className='w-6 h-5 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              7
            </div>
            <div className='w-[5px] h-[5px] bg-purple-500 rounded-full' />
          </div>
        </div>
        <div className='self-stretch inline-flex justify-between items-center'>
          <div className='w-12 h-12 px-4 py-1 rounded-2xl inline-flex flex-col justify-end items-center gap-1.5'>
            <div className='w-6 h-5 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              8
            </div>
            <div className='w-[5px] h-[5px] bg-purple-500 rounded-full' />
          </div>
          <div className='w-12 h-12 px-4 py-1 rounded-2xl inline-flex flex-col justify-end items-center gap-1.5'>
            <div className='w-6 h-5 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              9
            </div>
            <div className='w-[5px] h-[5px] rounded-full' />
          </div>
          <div className='w-12 h-12 px-4 py-1 rounded-2xl inline-flex flex-col justify-end items-center gap-1.5'>
            <div className='w-6 h-5 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              10
            </div>
            <div className='w-[5px] h-[5px] rounded-full' />
          </div>
          <div className='w-12 h-12 px-4 py-1 rounded-2xl inline-flex flex-col justify-end items-center gap-1.5'>
            <div className='w-6 h-5 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              11
            </div>
            <div className='w-[5px] h-[5px] bg-purple-500 rounded-full' />
          </div>
          <div className='w-12 h-12 px-4 py-1 rounded-2xl inline-flex flex-col justify-end items-center gap-1.5'>
            <div className='w-6 h-5 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              12
            </div>
            <div className='w-[5px] h-[5px] rounded-full' />
          </div>
          <div className='w-12 h-12 px-4 py-1 rounded-2xl inline-flex flex-col justify-end items-center gap-1.5'>
            <div className='w-6 h-5 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              13
            </div>
            <div className='w-[5px] h-[5px] rounded-full' />
          </div>
          <div className='w-12 h-12 px-4 py-1 rounded-2xl inline-flex flex-col justify-end items-center gap-1.5'>
            <div className='w-6 h-5 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              14
            </div>
            <div className='w-[5px] h-[5px] bg-purple-500 rounded-full' />
          </div>
        </div>
        <div className='self-stretch inline-flex justify-between items-center'>
          <div className='w-12 h-12 px-4 py-1 rounded-2xl inline-flex flex-col justify-end items-center gap-1.5'>
            <div className='w-6 h-5 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              15
            </div>
            <div className='w-[5px] h-[5px] bg-purple-500 rounded-full' />
          </div>
          <div className='w-12 h-12 px-4 py-1 rounded-2xl inline-flex flex-col justify-end items-center gap-1.5'>
            <div className='w-6 h-5 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              16
            </div>
            <div className='w-[5px] h-[5px] rounded-full' />
          </div>
          <div className='w-12 h-12 px-4 py-1 rounded-2xl inline-flex flex-col justify-end items-center gap-1.5'>
            <div className='w-6 h-5 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              17
            </div>
            <div className='w-[5px] h-[5px] rounded-full' />
          </div>
          <div className='w-12 h-12 px-4 py-1 rounded-2xl inline-flex flex-col justify-end items-center gap-1.5'>
            <div className='w-6 h-5 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              18
            </div>
            <div className='w-[5px] h-[5px] rounded-full' />
          </div>
          <div className='w-12 h-12 px-4 py-1 rounded-2xl inline-flex flex-col justify-end items-center gap-1.5'>
            <div className='w-6 h-5 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              19
            </div>
            <div className='w-[5px] h-[5px] rounded-full' />
          </div>
          <div className='w-12 h-12 px-4 py-1 rounded-2xl inline-flex flex-col justify-end items-center gap-1.5'>
            <div className='w-6 h-5 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              20
            </div>
            <div className='w-[5px] h-[5px] bg-purple-500 rounded-full' />
          </div>
          <div className='w-12 h-12 px-4 py-1 rounded-2xl inline-flex flex-col justify-end items-center gap-1.5'>
            <div className='w-6 h-5 text-center justify-center text-gray-950 text-xl font-normal  leading-4'>
              21
            </div>
            <div className='w-[5px] h-[5px] rounded-full' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyApplicationCalendar;
