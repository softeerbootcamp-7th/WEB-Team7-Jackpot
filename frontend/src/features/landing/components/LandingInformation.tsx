import { useNavigate } from 'react-router';

import { LANDING_CONTENT } from '@/features/landing/constants';
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
            <span className='text-purple-600'>{LANDING_CONTENT.HEADER.LINE_ONE.HIGHLIGHT_1}</span>{LANDING_CONTENT.HEADER.LINE_ONE.TEXT_AFTER_1}
            <span className='ml-2 flex items-center text-purple-600'>
              {LANDING_CONTENT.HEADER.LINE_ONE.HIGHLIGHT_2}
            </span>
            <div className='mx-1'>
              <LAI.CheckIcon />
            </div>
            {LANDING_CONTENT.HEADER.LINE_ONE.TEXT_AFTER_2}
          </span>
          <span>{LANDING_CONTENT.HEADER.LINE_TWO}</span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className='text-title-m cursor-pointer rounded-lg bg-gray-900 px-5 py-3 font-bold text-white transition-colors duration-200 hover:bg-gray-700'
        >
          {LANDING_CONTENT.HEADER.LOGIN_BUTTON}
        </button>
      </div>

      <div className='flex gap-6'>
        {LANDING_CONTENT.CARDS.map((CARD, index) => (
          <div
            key={index}
            className={`${animationClass} flex flex-1 flex-col rounded-2xl bg-purple-50 p-10 opacity-0`}
            style={{ animationDelay: `${(index + 1) * 150}ms` }}
          >
            <div className='mb-8 flex justify-center'>
              <div className='flex h-40 w-40 items-center justify-center'>
                {CARD.ICON}
              </div>
            </div>
            <div className='mb-3 text-lg font-bold text-purple-500'>
              {CARD.TITLE}
            </div>
            <div className='mb-4 text-2xl leading-snug font-bold whitespace-pre-line text-gray-800'>
              {CARD.SUBTITLE}
            </div>
            <div className='text-body-s leading-relaxed whitespace-pre-line text-gray-400'>
              {CARD.DESCRIPTION}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingInformation;
