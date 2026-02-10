import { useState } from 'react';

import LandingIntroBackground from '@/features/landing/components/LandingIntroBackground';
import { LandingPageIcon as I } from '@/features/landing/icons';

interface LandingIntroProps {
  onEnter: () => void;
}

const LandingIntro = ({ onEnter }: LandingIntroProps) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleEnterClick = () => {
    setIsExiting(true);
    onEnter();
  };

  return (
    <div
      className={`relative h-screen w-full overflow-hidden bg-white transition-opacity duration-300 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <LandingIntroBackground />

      <div className='absolute inset-0' />

      <div className='absolute right-24 bottom-16 z-50'>
        <button
          onClick={handleEnterClick}
          className='group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-full bg-white transition-transform'
        >
          <span className='absolute top-0 right-0 h-full w-0 bg-gray-950 transition-all duration-500 ease-in-out group-hover:w-full' />

          <span className='relative z-10 pl-6 text-2xl text-gray-950 transition-colors duration-500 group-hover:text-white'>
            Step into Narratix
          </span>
          <div className='relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gray-950 transition-colors duration-500'>
            <I.RightArrowIcon />
          </div>
        </button>
      </div>
    </div>
  );
};
export default LandingIntro;
