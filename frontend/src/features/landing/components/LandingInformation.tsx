import { useNavigate } from 'react-router';

import { LANDING_CARD_DATA } from '@/features/landing/constants/landing';
import * as LAI from '@/features/landing/icons';

interface LandingInformationProps {
  isAnimating: boolean;
}
const LandingInformation = ({ isAnimating }: LandingInformationProps) => {
  const navigate = useNavigate();
  const animationClass = isAnimating ? 'animate-slide-in-right' : '';

  return (
    <div className='flex h-screen flex-col justify-center overflow-hidden px-75 select-none'>
      <div
        className={`${animationClass} mb-20 flex items-start justify-between opacity-0`}
      >
        <div className='text-headline-s flex flex-col font-bold text-gray-950'>
          <span className='flex items-center'>
            <span className='text-purple-600'>사소한 기록</span>들이 모여 당신의
            <span className='ml-2 flex items-center text-purple-600'>
              가능성
            </span>
            <div className='mx-1'>
              <LAI.CheckIcon />
            </div>
            을 증명하듯,
          </span>
          <span>모든 발자취를 소중히 보관해드릴게요</span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className='text-title-m cursor-pointer rounded-lg bg-gray-900 px-5 py-3 font-bold text-white transition-colors duration-200 hover:bg-gray-700'
        >
          로그인 및 회원 가입하기
        </button>
      </div>

      <div className='flex gap-6'>
        {LANDING_CARD_DATA.map((card, index) => (
          <div
            key={index}
            className={`${animationClass} flex flex-1 flex-col rounded-2xl bg-purple-50 p-10 opacity-0`}
            style={{ animationDelay: `${(index + 1) * 150}ms` }}
          >
            <div className='mb-8 flex justify-center'>
              <div className='flex h-40 w-40 items-center justify-center'>
                {card.icon}
              </div>
            </div>
            <div className='mb-3 text-lg font-bold text-purple-500'>
              {card.title}
            </div>
            <div className='mb-4 text-2xl leading-snug font-bold whitespace-pre-line text-gray-800'>
              {card.subtitle}
            </div>
            <div className='text-body-s leading-relaxed whitespace-pre-line text-gray-400'>
              {card.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingInformation;
