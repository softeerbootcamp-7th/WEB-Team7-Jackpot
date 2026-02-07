import { getKoreanDate, getKoreanTime } from '@/shared/utils/dates';

interface CardUserInfoProps {
  name: string;
  dateTime: string;
}

const CardUserInfo = ({ name, dateTime }: CardUserInfoProps) => {
  const date = getKoreanDate(dateTime);
  const time = getKoreanTime(dateTime);

  return (
    <>
      <div className='relative h-12 w-12 overflow-hidden rounded-full bg-purple-100'>
        {/* 바꾸기 */}
        <div className='absolute top-[12px] left-[17px] h-4 w-4 rounded-full bg-purple-300' />
        <div className='absolute top-[33px] left-[3px] h-11 w-11 rounded-full bg-purple-300' />
      </div>
      <div className='flex flex-1 flex-col items-start justify-center'>
        <span className='text-body-l line-clamp-1 font-bold text-gray-950'>
          {name}
        </span>
        <time
          dateTime={dateTime}
          className='flex items-start gap-1 text-[0.813rem] leading-5 font-normal text-gray-400'
        >
          <span>{date}</span>
          <span aria-hidden='true'>·</span>
          <span>{time}</span>
        </time>
      </div>
    </>
  );
};

export default CardUserInfo;
